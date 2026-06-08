import { stripe } from './client';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function getDepositClientSecret(bookingId: string) {
  const admin = supabaseAdmin();
  const { data: payment } = await admin
    .from('payments')
    .select('stripe_payment_intent_id, status')
    .eq('booking_id', bookingId)
    .eq('kind', 'deposit')
    .maybeSingle();

  if (!payment?.stripe_payment_intent_id) return null;
  if (payment.status === 'succeeded') return { clientSecret: null, alreadyPaid: true as const };

  const intent = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id);
  return { clientSecret: intent.client_secret, alreadyPaid: false as const };
}
