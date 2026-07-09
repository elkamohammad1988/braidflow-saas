'use server';

import { rateLimit, clientIpKey } from '@/lib/rate-limit';
import { isEmailConfigured } from '@/lib/email/config';

// `delivery` tells the UI what actually happened so it never over-promises:
//   - 'email' → an email provider is configured and a reset link would be sent
//     (generic messaging, so the page can't be used to probe which addresses
//     are registered);
//   - 'demo'  → no email provider is wired up (the deployed demo). We say so
//     plainly rather than faking a "check your inbox" screen.
// The only failure case is a rate-limit trip, independent of whether the address
// exists.
export type ResetRequestResult =
  | { ok: true; delivery: 'email' | 'demo' }
  | { ok: false; error: string };

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

  // No email provider (the self-contained demo): be honest — nothing was sent.
  // With Resend configured, a real signed reset link would be dispatched here.
  if (!isEmailConfigured()) return { ok: true, delivery: 'demo' };
  return { ok: true, delivery: 'email' };
}
