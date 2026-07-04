// Stateless signed session tokens.
// -----------------------------------------------------------------------------
// A session is a small JSON payload, base64url-encoded and signed with HMAC-
// SHA256 so it can't be tampered with. Built entirely on the Web Crypto API and
// btoa/atob so the exact same code runs in the Edge middleware and in Node
// server actions — no Node-only `crypto` module, no external service.

import type { Role } from './personas';

const SECRET =
  process.env.AUTH_SECRET ||
  // A stable default keeps the demo zero-config. Set AUTH_SECRET in production
  // to invalidate forged cookies signed with this well-known value.
  'braidflow-demo-signing-secret-set-AUTH_SECRET-to-override';

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

function base64urlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function sign(data: string): Promise<string> {
  const key = await hmacKey();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64urlEncode(new Uint8Array(signature));
}

// Constant-time string compare so signature verification can't be timed.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function createSessionToken(
  payload: Omit<SessionPayload, 'exp'>,
  maxAgeSeconds: number
): Promise<string> {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds
  };
  const body = base64urlEncode(encoder.encode(JSON.stringify(full)));
  const signature = await sign(body);
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
  const expected = await sign(body);
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
