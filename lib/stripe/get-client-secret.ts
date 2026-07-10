import { stripe } from './client';
import { isStripeConfigured } from './config';
import { dbAdmin } from '@/lib/db/server';
import { guestTokenMatches } from '@/lib/bookings/guest-token';
import { createLogger, errorInfo } from '@/lib/log';

const log = createLogger('stripe.client-secret');

// Who is asking for the deposit secret: the authenticated owner, or a guest
// holding the booking's capability token. Authorization lives in this helper
// (not the caller) so a future call site can't accidentally leak a payment
// secret via IDOR.
export type DepositAccess = { userId: string } | { guestToken: string };

function authorize(
  booking: { client_id: string | null; guest_token: string | null },
  access: DepositAccess
): boolean {
  if ('userId' in access) return booking.client_id === access.userId;
  return guestTokenMatches(booking.guest_token, access.guestToken);
}

/**
 * Returns the deposit PaymentIntent client secret for a booking, but ONLY to the
 * client who owns it (by session) or the guest who holds its token.
 */
export async function getDepositClientSecret(bookingId: string, access: DepositAccess) {
  const admin = dbAdmin();

  const { data: booking } = await admin
    .from('bookings')
    .select('client_id, guest_token')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking || !authorize(booking, access)) return null;

  const { data: payment } = await admin
    .from('payments')
    .select('stripe_payment_intent_id, status')
    .eq('booking_id', bookingId)
    .eq('kind', 'deposit')
    .maybeSingle();

  if (!payment?.stripe_payment_intent_id) return null;
  if (payment.status === 'succeeded') return { clientSecret: null, alreadyPaid: true as const };

  // Keyless demo: there is no real PaymentIntent to retrieve. Signal the pay page
  // to render the simulated checkout (see confirmDemoDepositAction). The caller is
  // already authorized above, so this never leaks across bookings.
  if (!isStripeConfigured()) {
    return { clientSecret: null, alreadyPaid: false as const, demo: true as const };
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id);
    return { clientSecret: intent.client_secret, alreadyPaid: false as const };
  } catch (err) {
    // Stripe unreachable / intent gone — let the pay page render its fallback
    // rather than 500.
    log.error('could not retrieve deposit intent', { bookingId, ...errorInfo(err) });
    return null;
  }
}
