import { stripe } from './client';
import { supabaseAdmin } from '@/lib/supabase/server';

// Returns the deposit PaymentIntent client secret for a booking, but ONLY to the
// client who owns it. Authorization lives in the helper itself (not the caller)
// so a future call site can't accidentally leak a payment secret via IDOR.
export async function getDepositClientSecret(bookingId: string, userId: string) {
  const admin = supabaseAdmin();

  const { data: booking } = await admin
    .from('bookings')
    .select('client_id')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking || booking.client_id !== userId) return null;

  const { data: payment } = await admin
    .from('payments')
    .select('stripe_payment_intent_id, status')
    .eq('booking_id', bookingId)
    .eq('kind', 'deposit')
    .maybeSingle();

  if (!payment?.stripe_payment_intent_id) return null;
  if (payment.status === 'succeeded') return { clientSecret: null, alreadyPaid: true as const };

  try {
    const intent = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id);
    return { clientSecret: intent.client_secret, alreadyPaid: false as const };
  } catch (err) {
    // Stripe unreachable / intent gone — let the pay page render its fallback
    // rather than 500.
    console.error('[stripe] could not retrieve deposit intent', bookingId, err);
    return null;
  }
}
