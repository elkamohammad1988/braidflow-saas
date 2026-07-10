'use server';

import { revalidatePath } from 'next/cache';
import { stripe } from '@/lib/stripe/client';
import { isStripeConfigured } from '@/lib/stripe/config';
import { db, dbAdmin } from '@/lib/db/server';
import { notifyCancellation } from '@/lib/email/notifications';
import { recordAuditLog } from '@/lib/audit/log';
import { captureException } from '@/lib/monitoring';
import { createLogger, errorInfo } from '@/lib/log';
import { issueDepositRefund } from './refund';
import { decideDepositRefund, type RefundDecision } from './cancellation-policy';
import { authorizeBookingMutation } from './access';

const log = createLogger('booking.cancel');

export async function cancelBookingAction(bookingId: string, token?: string) {
  const database = db();
  const { data: { user } } = await database.auth.getUser();

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
        // Stripe rejects the cancel when the intent already succeeded — i.e. the
        // client paid in the race window. The deposit is now charged, so apply the
        // refund policy to it.
        log.error('PI cancel failed, settling charged deposit', { bookingId, ...errorInfo(err) });
        await settleChargedDeposit(decision);
        captureException(err, { bookingId, stage: 'cancel.settle' });
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
      // Record the policy outcome — this is the evidence trail for chargeback
      // defense when a within-window cancellation forfeits the deposit.
      deposit_refunded: decision.refund,
      refund_reason: decision.reason,
      refund_window_hours: decision.windowHours
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
