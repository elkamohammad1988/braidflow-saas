import { describe, expect, it } from 'vitest';
import { base64urlEncode, base64urlDecode, hmacSign, safeEqual } from './signing';

// Low-level HMAC + encoding primitives that the session cookie and the demo
// snapshot both stand on. A regression here is a silent auth-integrity failure.

const enc = new TextEncoder();

describe('safeEqual', () => {
  it('is true only for identical strings', () => {
    expect(safeEqual('abc123', 'abc123')).toBe(true);
    expect(safeEqual('abc123', 'abc124')).toBe(false);
  });

  it('is false for different lengths (and does not throw)', () => {
    expect(safeEqual('abc', 'abcd')).toBe(false);
    expect(safeEqual('', 'x')).toBe(false);
  });
});

describe('base64url', () => {
  it('round-trips arbitrary bytes without padding chars', () => {
    const bytes = enc.encode('the quick brown fox 🦊 — ÷ ø');
    const encoded = base64urlEncode(bytes);
    expect(encoded).not.toMatch(/[+/=]/); // URL-safe, unpadded
    expect(new TextDecoder().decode(base64urlDecode(encoded))).toBe('the quick brown fox 🦊 — ÷ ø');
  });
});

describe('hmacSign', () => {
  it('is deterministic for the same context + data', async () => {
    const a = await hmacSign('session', 'payload');
    const b = await hmacSign('session', 'payload');
    expect(a).toBe(b);
  });

  it('is domain-separated — the same data under a different context yields a different signature', async () => {
    const session = await hmacSign('session', 'payload');
    const snapshot = await hmacSign('snapshot', 'payload');
    expect(session).not.toBe(snapshot);
  });
});
