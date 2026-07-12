import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { dbAdmin } from '@/lib/db/server';
import { notifyBookingConfirmed } from '@/lib/email/notifications';
import { recordAuditLog } from '@/lib/audit/log';
import { captureMessage } from '@/lib/monitoring';
import { createLogger } from '@/lib/log';
import { assertRuntimeEnv } from '@/lib/env';
import { readAccountStatus } from '@/lib/stripe/connect';
import { applyConnectStatus } from '@/lib/braider/connect-sync';

export const runtime = 'nodejs';

const log = createLogger('stripe.webhook');

function refundStatus(status: Stripe.Refund['status']) {
  return status === 'succeeded'
    ? 'succeeded'
    : status === 'failed' || status === 'canceled'
    ? 'failed'
    : 'pending';
}

export async function POST(req: Request) {
  // This route is excluded from middleware, so the runtime-env check never ran
  // for it. Assert here so any required config is validated up front rather than
  // failing opaquely mid-handler.
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

  const admin = dbAdmin();

  // Idempotency: record the event id first. Stripe delivers at-least-once and
  // can replay; a duplicate insert conflicts (23505) and we skip re-processing.
  const { error: dedupeError } = await admin
    .from('stripe_webhook_events')
    .insert({ id: event.id, type: event.type });
  let deduped = false;
  if (dedupeError) {
    if (dedupeError.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true });
    }
    // A non-duplicate dedupe failure shouldn't drop the event — log and proceed
    // (the per-handler guards below are themselves idempotent).
    log.error('dedupe insert failed', { eventId: event.id, code: dedupeError.code });
  } else {
    deduped = true;
  }

  // Process inside a guard: if a handler throws part-way (a transient store/Stripe
  // failure), roll back the dedupe row before surfacing the 500 so Stripe's retry
  // is actually re-processed rather than skipped as a "duplicate". Every handler
  // is safe to re-run — transitions/refunds/account syncs are idempotent, and the
  // dispute handler's single record is protected by the (re-inserted) dedupe row —
  // so this yields exactly-once processing without losing events on failure.
  try {
    await handleEvent(admin, event);
  } catch (err) {
    if (deduped) {
      const { error: rollbackError } = await admin
        .from('stripe_webhook_events')
        .delete()
        .eq('id', event.id);
      if (rollbackError) {
        log.error('dedupe rollback failed after handler error', {
          eventId: event.id,
          code: rollbackError.code
        });
      }
    }
    throw err;
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(admin: ReturnType<typeof dbAdmin>, event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      const bookingId = pi.metadata.booking_id;
      if (!bookingId) {
        log.error('succeeded PI without booking_id', { paymentIntent: pi.id });
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

    case 'account.updated': {
      // A braider's Connect account changed (finished onboarding, capability
      // flipped, requirements due). Mirror the capability flags onto their row so
      // the booking gate reflects reality. Keyed by stripe_account_id; no-ops if
      // the account isn't linked to a braider.
      const account = event.data.object as Stripe.Account;
      await applyConnectStatus(admin, account.id, readAccountStatus(account));
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

      log.error('dispute opened', {
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
}
