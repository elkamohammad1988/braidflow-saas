'use server';

import { revalidatePath } from 'next/cache';
import { stripe } from '@/lib/stripe/client';
import { isStripeConfigured } from '@/lib/stripe/config';
import { db, dbAdmin } from '@/lib/db/server';
import { notifyCancellation } from '@/lib/email/notifications';
import { recordAuditLog } from '@/lib/audit/log';
import { captureException } from '@/lib/monitoring';
import { createLogger, errorInfo } from '@/lib/log';
import { rateLimit, clientIpKey } from '@/lib/rate-limit';
import { issueDepositRefund } from './refund';
import { decideDepositRefund, type RefundDecision } from './cancellation-policy';
import { authorizeBookingMutation } from './access';

const log = createLogger('booking.cancel');

export async function cancelBookingAction(bookingId: string, token?: string) {
  const database = db();
  const { data: { user } } = await database.auth.getUser();

  // Cancellation moves money (refund / PI cancel) and sends mail, so throttle it.
  // Keyed per user when signed in, else per IP for the guest-token path.
  const limit = user
    ? rateLimit(`booking:cancel:${user.id}`, { limit: 15, windowMs: 10 * 60_000 })
    : rateLimit(`booking:cancel:ip:${clientIpKey()}`, { limit: 10, windowMs: 15 * 60_000 });
  if (!limit.ok) {
    return { error: 'You\'re doing that very quickly. Please wait a moment and try again.' };
  }

  const admin = dbAdmin();
  const { data: booking } = await admin
    .from('bookings')
    .select(
      'id, client_id, braider_id, guest_token, status, scheduled_at, payments(id, kind, status, stripe_payment_intent_id)'
    )
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) return { error: 'Booking not found.' };

  // Owner (session) or guest (capability token). A guest acts as the client
  // party for policy purposes (their own cancellation).
  const actor = await authorizeBookingMutation(booking, user?.id ?? null, token);
  if ('error' in actor) return { error: actor.error };
  const isClient = actor.role === 'client' || actor.role === 'guest';
  // Capture the (narrowed) actor id in a plain const — TS won't carry the
  // discriminated-union narrowing of `actor` into the nested settle closure below.
  const actorId = actor.userId;

  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return { error: 'That booking can\'t be cancelled.' };
  }

  if (new Date(booking.scheduled_at) < new Date()) {
    return { error: 'Past appointments can\'t be cancelled.' };
  }

  // Guarded transition: only cancel a row that is still in the status we read.
  // Without this a concurrent confirm (webhook) or expire (cron) could be
  // clobbered — a read-then-write TOCTOU that the rest of the codebase avoids.
  const { data: cancelled, error } = await admin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('status', booking.status)
    .select('id');

  if (error) return { error: 'Could not cancel that booking.' };
  if (!cancelled || cancelled.length === 0) {
    return { error: 'That booking was just updated. Refresh and try again.' };
  }

  // --- Money settlement on cancellation ------------------------------------
  // Apply the cancellation policy to the deposit:
  //   - CHARGED deposit + policy says refund (braider cancelled, or client
  //     cancelled outside the window) → refund;
  //   - CHARGED deposit + within the window on a client cancel → forfeit
  //     (deposit stays with the braider; recorded for dispute defense);
  //   - UNPAID hold → cancel its PaymentIntent so a late payment can't land
  //     against a now-cancelled booking. If Stripe rejects the cancel the client
  //     just paid — re-apply the policy to that now-charged deposit.
  const deposit = (booking.payments ?? []).find((p) => p.kind === 'deposit');
  const cancelledBy = isClient ? 'client' : 'braider';
  const decision = decideDepositRefund({
    cancelledBy,
    scheduledAt: new Date(booking.scheduled_at),
    now: new Date()
  });
  // Whether money was actually at stake. An unpaid hold has no charged deposit,
  // so its cancellation must NOT be logged as a "forfeit" — that would be
  // misleading chargeback-defense evidence. Starts from the read status and is
  // flipped true only if the PI-cancel race path below finds the deposit charged.
  let depositCharged = deposit?.status === 'succeeded';

  async function settleChargedDeposit(d: RefundDecision) {
    if (!d.refund) return; // forfeit — braider keeps the deposit per policy
    const outcome = await issueDepositRefund(admin, bookingId, actorId);
    if ('error' in outcome) {
      // The booking is already cancelled; surface the refund failure loudly so
      // support can settle it manually rather than silently keeping the money.
      log.error('auto-refund failed', { bookingId, error: outcome.error });
      captureException(new Error('Auto-refund on cancellation failed'), {
        bookingId,
        stage: 'cancel.refund'
      });
    } else if ('skipped' in outcome && outcome.skipped !== 'already_refunded') {
      // Policy said refund and the deposit was charged, yet nothing settled — an
      // unexpected reconciliation gap. Alert so support settles it manually rather
      // than the client silently losing the deposit.
      log.error('auto-refund skipped unexpectedly', { bookingId, skipped: outcome.skipped });
      captureException(new Error('Auto-refund on cancellation skipped'), {
        bookingId,
        stage: 'cancel.refund'
      });
    }
  }

  if (deposit?.status === 'succeeded') {
    await settleChargedDeposit(decision);
  } else if (deposit?.status === 'pending' && deposit.stripe_payment_intent_id) {
    if (!isStripeConfigured()) {
      // Demo mode: the hold's PaymentIntent is a synthesized `pi_demo_*` id with
      // no real Stripe object to cancel. Just release the hold locally so the
      // cancellation completes cleanly instead of throwing on the unconfigured
      // Stripe client.
      await admin.from('payments').update({ status: 'failed' }).eq('id', deposit.id);
    } else {
      try {
        await stripe.paymentIntents.cancel(deposit.stripe_payment_intent_id);
        await admin.from('payments').update({ status: 'failed' }).eq('id', deposit.id);
      } catch (err) {
        // Stripe rejects a cancel when the intent already succeeded — i.e. the
        // client paid in the race window. Don't assume, though: a transient API
        // error throws the same way. Confirm the intent's real state, and only
        // treat the deposit as charged when Stripe says it truly succeeded.
        log.error('PI cancel failed, reconciling intent state', { bookingId, ...errorInfo(err) });
        let charged = false;
        try {
          const intent = await stripe.paymentIntents.retrieve(deposit.stripe_payment_intent_id);
          charged = intent.status === 'succeeded';
        } catch (retrieveErr) {
          captureException(retrieveErr, { bookingId, stage: 'cancel.reconcile' });
        }
        if (charged) {
          // The deposit really was collected in the race window. Reconcile the
          // local row — the payment_intent.succeeded webhook may not have landed
          // yet, and issueDepositRefund guards on a `succeeded` deposit — then
          // settle per policy. The refund stays idempotent on its stable key.
          depositCharged = true;
          await admin.from('payments').update({ status: 'succeeded' }).eq('id', deposit.id);
          await settleChargedDeposit(decision);
        } else {
          // Cancel failed for another reason and the intent is NOT charged —
          // surface it loudly rather than fabricating a charge or a refund.
          captureException(err, { bookingId, stage: 'cancel.settle' });
        }
      }
    }
  }
  // -------------------------------------------------------------------------

  await recordAuditLog({
    actorId,
    action: 'booking.cancelled',
    entityType: 'booking',
    entityId: bookingId,
    metadata: {
      cancelled_by: cancelledBy,
      previous_status: booking.status,
      scheduled_at: booking.scheduled_at,
      // Record the policy outcome only when a deposit was actually charged — it's
      // the evidence trail for chargeback defense when a within-window
      // cancellation forfeits the deposit. For an unpaid hold nothing was at
      // stake, so log that instead of a spurious "forfeit".
      ...(depositCharged
        ? {
            deposit_charged: true,
            deposit_refunded: decision.refund,
            refund_reason: decision.reason,
            refund_window_hours: decision.windowHours
          }
        : { deposit_charged: false })
    }
  });

  await notifyCancellation(bookingId, isClient ? 'client' : 'braider');

  // Revalidate every surface that shows this booking — matching complete.ts /
  // reschedule.ts. A braider can cancel straight from the appointments table, so
  // without busting the dashboard overview, calendar and clients views their
  // soft-navigation would keep drawing the now-cancelled appointment.
  revalidatePath('/bookings');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard/calendar');
  revalidatePath('/dashboard/clients');
  return { ok: true as const };
}
