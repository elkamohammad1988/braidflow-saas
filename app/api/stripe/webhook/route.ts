import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { notifyBookingConfirmed } from '@/lib/email/notifications';

export const runtime = 'nodejs';

export async function POST(req: Request) {
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

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      const bookingId = pi.metadata.booking_id;
      if (!bookingId) break;

      await admin
        .from('payments')
        .update({
          status: 'succeeded',
          stripe_charge_id: typeof pi.latest_charge === 'string' ? pi.latest_charge : null
        })
        .eq('stripe_payment_intent_id', pi.id);

      if (pi.metadata.kind === 'deposit') {
        const { data: prior } = await admin
          .from('bookings')
          .select('status')
          .eq('id', bookingId)
          .single();

        await admin.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId);

        // Only send the confirmation pair on the first transition to `confirmed`.
        // Webhooks can be delivered more than once — this keeps things idempotent.
        if (prior?.status === 'pending_payment') {
          await notifyBookingConfirmed(bookingId);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
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
      const status =
        refund.status === 'succeeded'
          ? 'succeeded'
          : refund.status === 'failed' || refund.status === 'canceled'
          ? 'failed'
          : 'pending';

      await admin
        .from('payments')
        .update({ status })
        .eq('stripe_refund_id', refund.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
