import { NextResponse } from 'next/server';
import { subMinutes } from 'date-fns';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { recordAuditLog } from '@/lib/audit/log';
import { isAuthorizedCron } from '@/lib/cron/auth';
import { assertRuntimeEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_TTL_MINUTES = 30;

// How long an unpaid hold may sit before it's released. Configurable so the
// window can be tuned without a redeploy.
function ttlMinutes(): number {
  const raw = Number(process.env.PENDING_BOOKING_TTL_MINUTES);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TTL_MINUTES;
}

export async function GET(req: Request) {
  assertRuntimeEnv();
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const ttl = ttlMinutes();
  const cutoff = subMinutes(new Date(), ttl).toISOString();

  // Find stale unpaid holds — but do NOT release them in bulk up front. A hold
  // may only be cancelled once its deposit PaymentIntent is confirmed dead;
  // otherwise we'd race the Stripe webhook and cancel a booking the client just
  // paid for (money taken, slot released). So for each hold we cancel the PI
  // FIRST and only release the slot if that succeeds.
  const { data: candidates, error } = await admin
    .from('bookings')
    .select(
      'id, braider_id, scheduled_at, payments(id, kind, status, stripe_payment_intent_id)'
    )
    .eq('status', 'pending_payment')
    .lt('created_at', cutoff);

  if (error) {
    console.error('[cron/expire-bookings] lookup failed', error);
    return NextResponse.json({ error: 'lookup failed' }, { status: 500 });
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
    if (deposit?.stripe_payment_intent_id && deposit.status === 'pending') {
      try {
        await stripe.paymentIntents.cancel(deposit.stripe_payment_intent_id);
      } catch (err) {
        console.error(
          '[cron/expire-bookings] PI cancel failed, leaving booking',
          b.id,
          err
        );
        piDead = false;
      }
    }
    if (!piDead) continue;

    // Guarded release: only flip a row that is still pending. Safe under
    // concurrent cron hits, and a payment that somehow landed after our cancel
    // attempt won't be clobbered.
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
      metadata: {
        braider_id: b.braider_id,
        scheduled_at: b.scheduled_at,
        ttl_minutes: ttl
      }
    });

    expired += 1;
  }

  return NextResponse.json({ ok: true, expired });
}
