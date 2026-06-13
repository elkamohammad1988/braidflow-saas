'use server';

import { headers } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
import { rateLimit, clientIpKey } from '@/lib/rate-limit';

// Resolve the absolute origin for the recovery redirect. Prefer the configured
// site URL (correct behind a proxy); fall back to the request host so a
// misconfigured env still produces a working, same-origin link.
function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  const h = headers();
  const host = h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return host ? `${proto}://${host}` : '';
}

// Always-generic shape: we never reveal whether an email maps to a real
// account (prevents user enumeration). The only non-success case is a rate-limit
// trip, which is independent of whether the address exists.
export type ResetRequestResult = { ok: true } | { ok: false; error: string };

// Send a password-reset link. Called from the (client) forgot-password form as
// a server action so we can rate-limit it ourselves — the reset email is a
// classic spam/enumeration vector, and Supabase's own limits are coarse.
export async function requestPasswordReset(emailRaw: string): Promise<ResetRequestResult> {
  const email = emailRaw.trim().toLowerCase();

  // Rate limit per IP and per target email so neither a single client nor a
  // single targeted address can be used to blast reset emails.
  const ip = clientIpKey();
  const perIp = rateLimit(`pwreset:ip:${ip}`, { limit: 5, windowMs: 15 * 60_000 });
  const perEmail = rateLimit(`pwreset:email:${email}`, { limit: 3, windowMs: 60 * 60_000 });
  if (!perIp.ok || !perEmail.ok) {
    return { ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' };
  }

  // Cheap shape check. A malformed address can't match an account; treat it as
  // success so we don't leak which inputs are "valid".
  if (!email || !email.includes('@') || email.length > 254) {
    return { ok: true };
  }

  const supabase = supabaseServer();
  // After the user clicks the link, /auth/callback establishes the recovery
  // session and forwards them to /reset-password to choose a new password.
  const redirectTo = `${siteOrigin()}/auth/callback?next=/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    // Log for ops, but still return success — surfacing the difference would
    // leak account existence and send-failure detail to the caller.
    console.error('[password-reset] resetPasswordForEmail failed', error.message);
  }

  return { ok: true };
}
