import 'server-only';
import { randomBytes, timingSafeEqual } from 'crypto';

// Capability token for guest bookings. A guest has no account, so possession of
// this token (delivered in the booking's URLs + emails) is what authorizes
// viewing, paying, rescheduling, and cancelling the booking. Treat it like a
// password-reset token: high entropy, compared in constant time, never logged.

/** Mint a fresh guest token: 32 random bytes, URL-safe (~43 chars). */
export function generateGuestToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Constant-time equality for a stored token vs. a presented one. Avoids leaking
 * length/prefix via early-exit timing. Returns false on any length mismatch or
 * empty input rather than throwing.
 */
export function guestTokenMatches(stored: string | null | undefined, presented: string | null | undefined): boolean {
  if (!stored || !presented) return false;
  const a = Buffer.from(stored);
  const b = Buffer.from(presented);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
