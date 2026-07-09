// Stateless signed session tokens.
// -----------------------------------------------------------------------------
// A session is a small JSON payload, base64url-encoded and signed with HMAC-
// SHA256 so it can't be tampered with. Built entirely on the Web Crypto API and
// btoa/atob so the exact same code runs in the Edge middleware and in Node
// server actions — no Node-only `crypto` module, no external service.

import type { Role } from './personas';
import { base64urlEncode, base64urlDecode, hmacSign, safeEqual } from '@/lib/crypto/signing';

// Domain-separation label so a session signature can never be replayed as a
// booking snapshot (see lib/bookings/demo-snapshot) even though both share a key.
const CONTEXT = 'session';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type SessionPayload = {
  sub: string;
  email: string;
  role: Role;
  name: string;
  // Expiry, in seconds since the epoch.
  exp: number;
};

export async function createSessionToken(
  payload: Omit<SessionPayload, 'exp'>,
  maxAgeSeconds: number
): Promise<string> {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds
  };
  const body = base64urlEncode(encoder.encode(JSON.stringify(full)));
  const signature = await hmacSign(CONTEXT, body);
  return `${body}.${signature}`;
}

export async function readSessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;

  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = await hmacSign(CONTEXT, body);
  if (!safeEqual(expected, signature)) return null;

  try {
    const payload = JSON.parse(decoder.decode(base64urlDecode(body))) as SessionPayload;
    if (!payload.sub || !payload.role) return null;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
