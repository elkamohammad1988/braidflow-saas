import { NextResponse } from 'next/server';
import { subMinutes } from 'date-fns';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { recordAuditLog } from '@/lib/audit/log';

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
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const ttl = ttlMinutes();
  const cutoff = subMinutes(new Date(), ttl).toISOString();

  // Atomic claim: flip stale unpaid holds to cancelled in one statement. The
  // status recheck makes this safe under concurrent cron hits — a row can only
  // be claimed once. Cancelling (not deleting) frees the gist exclusion slot
  // while preserving history. A paid booking is already 'confirmed', so it can
  // never match here.
  const { data: claimed, error } = await admin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('status', 'pending_payment')
    .lt('created_at', cutoff)
    .select('id, braider_id, scheduled_at');

  if (error) {
    console.error('[cron/expire-bookings] claim failed', error);
    return NextResponse.json({ error: 'claim failed' }, { status: 500 });
  }

  const ids = (claimed ?? []).map((b) => b.id);
  if (ids.length === 0) {
    return NextResponse.json({ ok: true, expired: 0 });
  }

  // Cancel the dangling deposit PaymentIntents so a late payment can't reconfirm
  // a now-cancelled booking, and mark the deposit rows dead.
  const { data: deposits } = await admin
    .from('payments')
    .select('id, stripe_payment_intent_id, status')
    .in('booking_id', ids)
    .eq('kind', 'deposit');

  for (const dep of deposits ?? []) {
    if (dep.stripe_payment_intent_id && dep.status === 'pending') {
      try {
        await stripe.paymentIntents.cancel(dep.stripe_payment_intent_id);
      } catch (err) {
        // Already cancelled/succeeded or unknown — log and keep going.
        console.error('[cron/expire-bookings] PI cancel failed', dep.stripe_payment_intent_id, err);
      }
      await admin.from('payments').update({ status: 'failed' }).eq('id', dep.id);
    }
  }

  await Promise.all(
    (claimed ?? []).map((b) =>
      recordAuditLog({
        actorId: null,
        action: 'booking.expired',
        entityType: 'booking',
        entityId: b.id,
        metadata: {
          braider_id: b.braider_id,
          scheduled_at: b.scheduled_at,
          ttl_minutes: ttl
        }
      })
    )
  );

  return NextResponse.json({ ok: true, expired: ids.length });
}
