import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { dbAdmin } from '@/lib/db/server';
import { getSession } from '@/lib/auth/session';
import { guestTokenMatches } from './guest-token';

// Who is allowed to act on a booking. The authed owner (a client whose
// client_id matches the session) gets in without a token; a guest gets in by
// presenting the capability token from their booking URL. The braider's own
// management of a booking goes through the dashboard (session) and is checked in
// the individual actions, not here.
export type BookingViewer =
  | { kind: 'owner'; userId: string }
  | { kind: 'guest' };

/**
 * Resolve the viewer for a booking *page*. Designed to be called at the top of a
 * server component:
 *   - a valid `token` → guest access (no login required);
 *   - no token → require a session and confirm the user owns the booking;
 *   - otherwise → notFound() (guest) / redirect to /login (owner).
 *
 * Returns the row's id + client_id alongside the viewer so the caller doesn't
 * re-query just to branch. Authorization lives here so no call site can forget it.
 */
export async function resolveBookingViewer(
  bookingId: string,
  token?: string | null
): Promise<{ viewer: BookingViewer; clientId: string | null }> {
  const admin = dbAdmin();
  const { data: booking } = await admin
    .from('bookings')
    .select('id, client_id, guest_token')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) notFound();

  // Guest path: present a token, it must match this booking's token.
  if (token) {
    if (guestTokenMatches(booking.guest_token, token)) {
      return { viewer: { kind: 'guest' }, clientId: booking.client_id };
    }
    // A token was offered but doesn't match — don't fall back to a login prompt,
    // just 404 (avoids leaking whether the booking exists).
    notFound();
  }

  // Owner path: must be signed in and own the booking.
  const session = await getSession();
  if (!session) redirect('/login');
  if (booking.client_id !== session.user.id) notFound();
  return { viewer: { kind: 'owner', userId: session.user.id }, clientId: booking.client_id };
}

// Result type for *mutations* (server actions), which return errors instead of
// redirecting. `actor` is who is performing the change; `null` userId = guest.
export type BookingActor =
  | { role: 'client'; userId: string }
  | { role: 'braider'; userId: string }
  | { role: 'guest'; userId: null };

/**
 * Authorize a booking mutation (cancel / reschedule) for either a signed-in
 * party (client or braider) or a guest holding the token. Returns a structured
 * error string instead of throwing/redirecting so actions can surface it.
 */
export async function authorizeBookingMutation(
  booking: { client_id: string | null; braider_id: string; guest_token: string | null },
  sessionUserId: string | null,
  token?: string | null
): Promise<BookingActor | { error: string }> {
  if (token) {
    if (guestTokenMatches(booking.guest_token, token)) {
      return { role: 'guest', userId: null };
    }
    return { error: 'This link is no longer valid.' };
  }
  if (!sessionUserId) return { error: 'You need to be signed in.' };
  if (booking.client_id === sessionUserId) return { role: 'client', userId: sessionUserId };
  if (booking.braider_id === sessionUserId) return { role: 'braider', userId: sessionUserId };
  return { error: 'Not your booking.' };
}
