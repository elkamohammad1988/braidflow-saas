// Edge-safe HMAC-SHA256 signing primitives.
// -----------------------------------------------------------------------------
// Shared by the session cookie (lib/auth/session-token) and the demo booking
// snapshot (lib/bookings/demo-snapshot). Built entirely on the Web Crypto API and
// btoa/atob — no Node-only modules — so the identical code runs in Edge
// middleware and in Node server actions. Each signature is domain-separated by a
// `context` label, so a token minted for one purpose can never validate as
// another even though both use the same key.

const FALLBACK_SECRET = 'braidflow-demo-signing-secret-set-AUTH_SECRET-to-override';

let warnedFallback = false;

/**
 * The single source of the HMAC signing secret. Real deployments set a long,
 * random `AUTH_SECRET`. Without it the app falls back to a world-readable
 * constant — fine for the zero-config demo, unsafe for real multi-tenant auth —
 * and logs a one-time production warning so the risk is never silent. See
 * `lib/env.ts` for the config assertions.
 */
export function authSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production' && !warnedFallback) {
    warnedFallback = true;
    console.error(
      '[auth] AUTH_SECRET is not set — signing with the PUBLIC demo fallback ' +
        'secret. It is committed to the repo and therefore forgeable. Set ' +
        'AUTH_SECRET to a long random value for any deployment with real users.'
    );
  }
  return FALLBACK_SECRET;
}

const encoder = new TextEncoder();

export function base64urlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64urlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(authSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

/**
 * Sign `data` under a domain-separation `context` (e.g. 'session', 'snapshot').
 * The signed message is `${context}:${data}`, so a signature valid for one
 * context is never valid for another.
 */
export async function hmacSign(context: string, data: string): Promise<string> {
  const key = await hmacKey();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${context}:${data}`));
  return base64urlEncode(new Uint8Array(signature));
}

/** Constant-time string compare — no early exit that would leak the diff position. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
