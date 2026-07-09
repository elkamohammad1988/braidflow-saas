import { afterEach, describe, expect, it } from 'vitest';
import { isStripeConfigured } from '@/lib/stripe/config';
import { isEmailConfigured } from '@/lib/email/config';

// The demo path is chosen when the relevant keys are absent. These lock in that
// gating logic — the same switch that keeps the deposit, refund and email flows
// from touching an unconfigured integration.

const KEYS = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'RESEND_API_KEY'
] as const;

const saved: Record<string, string | undefined> = {};
for (const k of KEYS) saved[k] = process.env[k];

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe('isStripeConfigured', () => {
  it('is false (demo mode) when either key is missing', () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    expect(isStripeConfigured()).toBe(false);

    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    expect(isStripeConfigured()).toBe(false); // publishable still missing
  });

  it('is true only when both keys are present', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_x';
    expect(isStripeConfigured()).toBe(true);
  });

  it('treats blank/whitespace keys as unconfigured', () => {
    process.env.STRIPE_SECRET_KEY = '   ';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_x';
    expect(isStripeConfigured()).toBe(false);
  });
});

describe('isEmailConfigured', () => {
  it('is false (demo mode) without a Resend key', () => {
    delete process.env.RESEND_API_KEY;
    expect(isEmailConfigured()).toBe(false);
  });

  it('is true with a Resend key present', () => {
    process.env.RESEND_API_KEY = 're_test_x';
    expect(isEmailConfigured()).toBe(true);
  });
});
