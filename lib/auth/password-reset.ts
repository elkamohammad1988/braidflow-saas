'use server';

import { rateLimit, clientIpKey } from '@/lib/rate-limit';

// Always-generic shape: we never reveal whether an email maps to a real
// account (prevents user enumeration). The only non-success case is a rate-limit
// trip, which is independent of whether the address exists.
export type ResetRequestResult = { ok: true } | { ok: false; error: string };

// Request a password reset. This build ships without an email provider, so the
// request is accepted and rate-limited but no message is sent — the UI shows the
// same generic "check your inbox" confirmation either way. Wire up an email
// service here to send a real reset link.
export async function requestPasswordReset(emailRaw: string): Promise<ResetRequestResult> {
  const email = emailRaw.trim().toLowerCase();

  // Rate limit per IP and per target email so neither a single client nor a
  // single targeted address can be used to blast reset requests.
  const ip = clientIpKey();
  const perIp = rateLimit(`pwreset:ip:${ip}`, { limit: 5, windowMs: 15 * 60_000 });
  const perEmail = rateLimit(`pwreset:email:${email}`, { limit: 3, windowMs: 60 * 60_000 });
  if (!perIp.ok || !perEmail.ok) {
    return { ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' };
  }

  return { ok: true };
}
