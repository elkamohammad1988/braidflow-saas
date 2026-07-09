import 'server-only';

// Self-healing demo booking snapshot.
// -----------------------------------------------------------------------------
// The demo runs on an in-memory store that is per-server-instance. On a single
// process (local, or a warm serverless instance) that's fine, but across
// serverless instances a booking created by one request can be missing when the
// next request lands on a different instance — breaking create → pay → confirm.
//
// Rather than add an external store (which would break the zero-config promise),
// the demo flow carries a compact, HMAC-signed snapshot of the booking through
// the URL. Every step calls `ensureBookingFromSnapshot`, which reconstructs the
// booking (and its deposit payment) into whatever instance is serving the
// request — and reconciles its status to the snapshot's. Service/braider joins
// resolve from the deterministic seed, so only the booking + payment rows need
// rehydrating. Signed, so a client can't fabricate a booking; demo-only, so real
// Stripe deployments never touch this path.

import { dbAdmin } from '@/lib/db/server';
import { isStripeConfigured } from '@/lib/stripe/config';
import { base64urlEncode, base64urlDecode, hmacSign, safeEqual } from '@/lib/crypto/signing';
import type { BookingStatus } from '@/types/db';

// Domain-separation label — a snapshot signature is never valid as a session
// cookie (see lib/auth/session-token) and vice-versa, though both share a key.
const CONTEXT = 'snapshot';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type BookingRow = {
  id: string;
  client_id: string | null;
  braider_id: string;
  service_id: string;
  scheduled_at: string;
  duration_minutes: number;
  price_cents: number;
  deposit_cents: number;
  status: BookingStatus;
  client_notes: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guest_token: string | null;
  created_at: string;
};

type Snapshot = { b: BookingRow; ps: 'pending' | 'succeeded'; exp: number };

// Sign a booking snapshot for the given deposit-payment status. Returns a
// URL-safe `<body>.<sig>` token (valid for a day — a demo hold never lives long).
export async function signBookingSnapshot(
  booking: BookingRow,
  paymentStatus: 'pending' | 'succeeded'
): Promise<string> {
  const snap: Snapshot = { b: booking, ps: paymentStatus, exp: Math.floor(Date.now() / 1000) + 86400 };
  const body = base64urlEncode(encoder.encode(JSON.stringify(snap)));
  return `${body}.${await hmacSign(CONTEXT, body)}`;
}

async function readSnapshot(token: string | undefined | null): Promise<Snapshot | null> {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  if (!safeEqual(await hmacSign(CONTEXT, body), token.slice(dot + 1))) return null;
  try {
    const snap = JSON.parse(decoder.decode(base64urlDecode(body))) as Snapshot;
    if (!snap.b?.id) return null;
    if (snap.exp && snap.exp * 1000 < Date.now()) return null;
    return snap;
  } catch {
    return null;
  }
}

// Ensure this instance's store holds the booking described by the (signed)
// snapshot, reconciling its status + deposit-payment status. Safe to call on
// every request: a no-op when Stripe is configured, when there's no token, when
// the token doesn't match the id, or when the store is already in sync.
export async function ensureBookingFromSnapshot(
  bookingId: string,
  token: string | undefined | null
): Promise<void> {
  if (isStripeConfigured()) return;
  const snap = await readSnapshot(token);
  if (!snap || snap.b.id !== bookingId) return;

  const admin = dbAdmin();
  const { data: existing } = await admin
    .from('bookings')
    .select('id, status')
    .eq('id', bookingId)
    .maybeSingle();

  if (!existing) {
    await admin.from('bookings').insert(snap.b);
  } else if (existing.status !== snap.b.status) {
    // Only ever advance a hold toward its snapshot state; never resurrect a
    // booking the braider has since cancelled/completed on this instance.
    if (existing.status === 'pending_payment') {
      await admin.from('bookings').update({ status: snap.b.status }).eq('id', bookingId);
    }
  }

  const { data: payment } = await admin
    .from('payments')
    .select('id, status')
    .eq('booking_id', bookingId)
    .eq('kind', 'deposit')
    .maybeSingle();

  const chargeId = snap.ps === 'succeeded' ? `ch_demo_${bookingId}` : null;
  if (!payment) {
    await admin.from('payments').insert({
      booking_id: bookingId,
      kind: 'deposit',
      amount_cents: snap.b.deposit_cents,
      status: snap.ps,
      stripe_payment_intent_id: `pi_demo_${bookingId}`,
      stripe_charge_id: chargeId
    });
  } else if (payment.status !== snap.ps && payment.status !== 'succeeded') {
    await admin
      .from('payments')
      .update({ status: snap.ps, stripe_charge_id: chargeId })
      .eq('id', payment.id);
  }
}
