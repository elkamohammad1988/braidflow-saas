import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { notifyBookingConfirmed } from '@/lib/email/notifications';
import { recordAuditLog } from '@/lib/audit/log';
import { captureMessage } from '@/lib/monitoring';
import { assertRuntimeEnv } from '@/lib/env';

export const runtime = 'nodejs';

function refundStatus(status: Stripe.Refund['status']) {
  return status === 'succeeded'
    ? 'succeeded'
    : status === 'failed' || status === 'canceled'
    ? 'failed'
    : 'pending';
}

export async function POST(req: Request) {
  // This route is excluded from middleware, so the runtime-env check never ran
  // for it. Assert here so a missing service-role key fails clearly instead of
  // crashing opaquely inside supabaseAdmin() — which would silently stop paid
  // bookings from ever being confirmed.
  assertRuntimeEnv();

  const signature = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // Idempotency: record the event id first. Stripe delivers at-least-once and
  // can replay; a duplicate insert conflicts (23505) and we skip re-processing.
  const { error: dedupeError } = await admin
    .from('stripe_webhook_events')
    .insert({ id: event.id, type: event.type });
  if (dedupeError) {
    if (dedupeError.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true });
    }
    // A non-duplicate dedupe failure shouldn't drop the event — log and proceed
    // (the per-handler guards below are themselves idempotent).
    console.error('[stripe webhook] dedupe insert failed', dedupeError);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      const bookingId = pi.metadata.booking_id;
      if (!bookingId) {
        console.error('[stripe webhook] succeeded PI without booking_id', pi.id);
        break;
      }

      await admin
        .from('payments')
        .update({
          status: 'succeeded',
          stripe_charge_id: typeof pi.latest_charge === 'string' ? pi.latest_charge : null
        })
        .eq('stripe_payment_intent_id', pi.id);

      if (pi.metadata.kind === 'deposit') {
        // Guarded transition: only promote a booking that is still
        // `pending_payment`. This is atomic (no read-then-write TOCTOU), so:
        //   - a late/duplicate event can't resurrect a cancelled/expired booking
        //   - the confirmation pair is sent exactly once (only the first
        //     transition returns a row), keeping duplicate deliveries idempotent.
        const { data: confirmed } = await admin
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId)
          .eq('status', 'pending_payment')
          .select('id');

        if (confirmed && confirmed.length > 0) {
          await notifyBookingConfirmed(bookingId);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed':
    case 'payment_intent.canceled': {
      const pi = event.data.object;
      await admin
        .from('payments')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent_id', pi.id);
      break;
    }

    case 'refund.updated':
    case 'refund.created':
    case 'refund.failed': {
      const refund = event.data.object as Stripe.Refund;
      const status = refundStatus(refund.status);

      const { data: updated } = await admin
        .from('payments')
        .update({ status })
        .eq('stripe_refund_id', refund.id)
        .select('id');

      // No matching row means the refund was issued outside the app (e.g. from
      // the Stripe Dashboard). Reconcile by creating the refund row against the
      // booking so the UI and accounting reflect it.
      if ((!updated || updated.length === 0) && refund.payment_intent) {
        const piId =
          typeof refund.payment_intent === 'string'
            ? refund.payment_intent
            : refund.payment_intent.id;
        const { data: deposit } = await admin
          .from('payments')
          .select('booking_id')
          .eq('stripe_payment_intent_id', piId)
          .eq('kind', 'deposit')
          .maybeSingle();

        if (deposit) {
          await admin.from('payments').upsert(
            {
              booking_id: deposit.booking_id,
              kind: 'refund',
              amount_cents: refund.amount,
              status,
              stripe_refund_id: refund.id
            },
            { onConflict: 'stripe_refund_id' }
          );
        }
      }
      break;
    }

    case 'charge.dispute.created': {
      // Chargebacks must not be invisible. Map the dispute back to a booking and
      // record it to the audit trail + server logs for alerting/reconciliation.
      const dispute = event.data.object as Stripe.Dispute;
      const piId =
        typeof dispute.payment_intent === 'string'
          ? dispute.payment_intent
          : dispute.payment_intent?.id ?? null;

      let bookingId: string | null = null;
      if (piId) {
        const { data: dep } = await admin
          .from('payments')
          .select('booking_id')
          .eq('stripe_payment_intent_id', piId)
          .maybeSingle();
        bookingId = dep?.booking_id ?? null;
      }

      console.error('[stripe webhook] dispute opened', {
        disputeId: dispute.id,
        paymentIntent: piId,
        bookingId,
        amount: dispute.amount
      });

      // A chargeback is money leaving the platform — surface it in monitoring,
      // not just logs, so it can be actioned before the response deadline.
      captureMessage('Stripe dispute opened', {
        disputeId: dispute.id,
        bookingId,
        amountCents: dispute.amount,
        reason: dispute.reason ?? null
      });

      await recordAuditLog({
        actorId: null,
        action: 'payment.disputed',
        entityType: 'booking',
        entityId: bookingId,
        metadata: {
          dispute_id: dispute.id,
          amount_cents: dispute.amount,
          reason: dispute.reason ?? null
        }
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
