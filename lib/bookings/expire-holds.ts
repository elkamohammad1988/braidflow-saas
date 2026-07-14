import 'server-only';
import type { dbAdmin } from '@/lib/db/server';
import { stripe } from '@/lib/stripe/client';
import { isStripeConfigured } from '@/lib/stripe/config';
import { recordAuditLog } from '@/lib/audit/log';
import { createLogger, errorInfo } from '@/lib/log';
import { pendingHoldTtlMinutes, staleHoldCutoffIso } from './hold-ttl';

type Admin = ReturnType<typeof dbAdmin>;

const log = createLogger('booking.expire-holds');

/**
 * Release abandoned `pending_payment` holds whose TTL has elapsed — the single
 * implementation behind both the scheduled cron sweep and the lazy release the
 * booking/create/reschedule paths run inline so a stale hold frees its slot at
 * the TTL rather than at the next daily cron.
 *
 * Safety (identical to the original cron): a hold may only be released once its
 * deposit PaymentIntent is confirmed dead — otherwise we'd race the Stripe
 * webhook and cancel a booking the client just paid for (money taken, slot
 * released). So per hold we (1) skip anything already `succeeded`, (2) cancel the
 * PI FIRST and only release if that succeeds (in the keyless demo the id is a
 * synthesized `pi_demo_*` with no Stripe object, so we skip the call and treat
 * the hold as dead), and (3) release with a status-guarded write so a payment
 * that lands in the race window is never clobbered.
 *
 * @param braiderId  scope the sweep to one braider (the lazy path); omitted for
 *                   the global cron backstop.
 * @returns the number of holds released.
 */
export async function expireStaleHolds(
  admin: Admin,
  opts: { braiderId?: string; limit?: number } = {}
): Promise<number> {
  const limit = opts.limit ?? 100;
  const ttl = pendingHoldTtlMinutes();
  const cutoff = staleHoldCutoffIso();

  let query = admin
    .from('bookings')
    .select('id, braider_id, scheduled_at, payments(id, kind, status, stripe_payment_intent_id)')
    .eq('status', 'pending_payment')
    .lt('created_at', cutoff);
  if (opts.braiderId) query = query.eq('braider_id', opts.braiderId);

  const { data: candidates, error } = await query
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    log.error('lookup failed', { code: error.code });
    return 0;
  }

  let expired = 0;

  for (const b of candidates ?? []) {
    const deposit = (b.payments ?? []).find((p) => p.kind === 'deposit');

    // A succeeded deposit means the booking is (or is about to be) confirmed by
    // the webhook — never release it.
    if (deposit?.status === 'succeeded') continue;

    // Cancel the PaymentIntent first. If the client has already paid, Stripe
    // rejects the cancel — that's our signal to leave the booking alone so the
    // webhook can confirm it. Only a successfully-cancelled (or absent) PI lets
    // us safely release the slot.
    let piDead = true;
    if (isStripeConfigured() && deposit?.stripe_payment_intent_id && deposit.status === 'pending') {
      try {
        await stripe.paymentIntents.cancel(deposit.stripe_payment_intent_id);
      } catch (err) {
        log.error('PI cancel failed, leaving booking', { bookingId: b.id, ...errorInfo(err) });
        piDead = false;
      }
    }
    if (!piDead) continue;

    // Guarded release: only flip a row that is still pending.
    const { data: released } = await admin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', b.id)
      .eq('status', 'pending_payment')
      .select('id');

    if (!released || released.length === 0) continue;

    if (deposit) {
      await admin.from('payments').update({ status: 'failed' }).eq('id', deposit.id);
    }

    await recordAuditLog({
      actorId: null,
      action: 'booking.expired',
      entityType: 'booking',
      entityId: b.id,
      metadata: { braider_id: b.braider_id, scheduled_at: b.scheduled_at, ttl_minutes: ttl }
    });

    expired += 1;
  }

  return expired;
}
