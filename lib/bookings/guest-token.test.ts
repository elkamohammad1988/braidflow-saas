import { describe, it, expect } from 'vitest';
import { generateGuestToken, guestTokenMatches } from './guest-token';

describe('generateGuestToken', () => {
  it('produces a URL-safe, high-entropy token', () => {
    const token = generateGuestToken();
    // 32 bytes base64url → 43 chars, no padding, only URL-safe chars.
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('produces a different token each call', () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateGuestToken()));
    expect(tokens.size).toBe(100);
  });
});

describe('guestTokenMatches', () => {
  it('matches an identical token', () => {
    const token = generateGuestToken();
    expect(guestTokenMatches(token, token)).toBe(true);
  });

  it('rejects a different token of the same length', () => {
    const a = generateGuestToken();
    const b = generateGuestToken();
    expect(guestTokenMatches(a, b)).toBe(false);
  });

  it('rejects tokens of different lengths without throwing', () => {
    expect(guestTokenMatches('short', generateGuestToken())).toBe(false);
  });

  it('rejects null / undefined / empty inputs (no token = no access)', () => {
    const token = generateGuestToken();
    expect(guestTokenMatches(null, token)).toBe(false);
    expect(guestTokenMatches(token, null)).toBe(false);
    expect(guestTokenMatches(undefined, undefined)).toBe(false);
    expect(guestTokenMatches('', '')).toBe(false);
    expect(guestTokenMatches(token, '')).toBe(false);
  });
});
