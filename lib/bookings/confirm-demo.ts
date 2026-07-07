'use server';

// Demo deposit confirmation.
// -----------------------------------------------------------------------------
// The keyless demo has no real Stripe webhook to promote a booking after payment,
// so this action stands in for it: it marks the deposit paid and atomically
// confirms the hold — exactly the transition app/api/stripe/webhook does on
// `payment_intent.succeeded`. No money moves; nothing here touches Stripe.
//
// It also self-heals: on serverless the booking may have been created on another
// instance, so it rebuilds it from the signed snapshot before confirming, and
// returns a fresh confirmed snapshot for the confirmation page to render from.
//
// Hard-gated to demo mode: if real Stripe is configured, confirmation MUST come
// from the signed webhook after an actual charge, never from this action.

import { db, dbAdmin } from '@/lib/db/server';
import { guestTokenMatches } from '@/lib/bookings/guest-token';
import { isStripeConfigured } from '@/lib/stripe/config';
import {
  ensureBookingFromSnapshot,
  signBookingSnapshot,
  type BookingRow
} from '@/lib/bookings/demo-snapshot';

type Result = { ok: true; snapshot: string } | { error: string };

export async function confirmDemoDepositAction(input: {
  bookingId: string;
  token?: string;
  snapshot?: string;
}): Promise<Result> {
  // Never allow a simulated confirm to bypass a real charge in production.
  if (isStripeConfigured()) return { error: 'unavailable' };

  // Rebuild the booking onto this instance if it was created on another.
  await ensureBookingFromSnapshot(input.bookingId, input.snapshot);

  const admin = dbAdmin();
  const { data: booking } = await admin
    .from('bookings')
    .select(
      'id, client_id, braider_id, service_id, scheduled_at, duration_minutes, price_cents, deposit_cents, status, client_notes, guest_name, guest_email, guest_phone, guest_token, created_at'
    )
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

  // Mark the deposit succeeded + confirm the hold (mirror of the webhook),
  // idempotently — a re-submit of an already-confirmed booking is a no-op.
  if (booking.status === 'pending_payment') {
    await admin
      .from('payments')
      .update({ status: 'succeeded', stripe_charge_id: `ch_demo_${booking.id}` })
      .eq('booking_id', booking.id)
      .eq('kind', 'deposit');
    await admin
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', booking.id)
      .eq('status', 'pending_payment');
  }

  // Hand the confirmation page a signed, confirmed snapshot so it renders success
  // even if it lands on yet another serverless instance.
  const confirmedRow: BookingRow = { ...(booking as BookingRow), status: 'confirmed' };
  const snapshot = await signBookingSnapshot(confirmedRow, 'succeeded');
  return { ok: true, snapshot };
}
