'use server';

// Demo deposit confirmation.
// -----------------------------------------------------------------------------
// The keyless demo has no real Stripe webhook to promote a booking after payment,
// so this action stands in for it: it marks the deposit paid and atomically
// confirms the hold — exactly the transition app/api/stripe/webhook does on
// `payment_intent.succeeded`. No money moves; nothing here touches Stripe.
//
// Hard-gated to demo mode: if real Stripe is configured, confirmation MUST come
// from the signed webhook after an actual charge, never from this action.

import { db, dbAdmin } from '@/lib/db/server';
import { guestTokenMatches } from '@/lib/bookings/guest-token';
import { isStripeConfigured } from '@/lib/stripe/config';

type Result = { ok: true } | { error: string };

export async function confirmDemoDepositAction(input: {
  bookingId: string;
  token?: string;
}): Promise<Result> {
  // Never allow a simulated confirm to bypass a real charge in production.
  if (isStripeConfigured()) return { error: 'unavailable' };

  const admin = dbAdmin();
  const { data: booking } = await admin
    .from('bookings')
    .select('id, client_id, guest_token, status')
    .eq('id', input.bookingId)
    .maybeSingle();

  if (!booking) return { error: 'not_found' };

  // Authorize the caller: the signed-in owner, or the guest holding the token.
  const {
    data: { user }
  } = await db().auth.getUser();
  const authorized = user
    ? booking.client_id === user.id
    : guestTokenMatches(booking.guest_token, input.token ?? '');
  if (!authorized) return { error: 'forbidden' };

  // Idempotent: only a still-pending hold transitions. A confirmed/cancelled
  // booking (double-submit, back button) is a no-op success.
  if (booking.status !== 'pending_payment') return { ok: true };

  // Mark the deposit succeeded (mirror of the webhook's payments update).
  await admin
    .from('payments')
    .update({ status: 'succeeded', stripe_charge_id: `ch_demo_${booking.id}` })
    .eq('booking_id', booking.id)
    .eq('kind', 'deposit');

  // Guarded, atomic promote — identical to the webhook. Only the first caller to
  // flip pending_payment → confirmed wins, so concurrent submits stay idempotent.
  await admin
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', booking.id)
    .eq('status', 'pending_payment');

  return { ok: true };
}
