import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// assertRuntimeEnv memoizes success at module scope, so each case resets modules
// and re-imports to get a fresh (un-memoized) copy, and restores process.env after.

const KEYS = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'AUTH_SECRET',
  'NEXT_PUBLIC_SITE_URL'
] as const;

const saved: Record<string, string | undefined> = {};
for (const k of KEYS) saved[k] = process.env[k];

function clear() {
  for (const k of KEYS) delete process.env[k];
}

beforeEach(() => {
  vi.resetModules();
  clear();
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

// Fresh, un-memoized assert each call.
async function assertEnv(): Promise<void> {
  const { assertRuntimeEnv } = await import('./env');
  assertRuntimeEnv();
}

describe('assertRuntimeEnv', () => {
  it('passes with a bare zero-config demo env (all optional keys unset)', async () => {
    await expect(assertEnv()).resolves.toBeUndefined();
  });

  it('rejects a malformed Stripe key', async () => {
    process.env.STRIPE_SECRET_KEY = 'totally-not-a-stripe-key';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_x';
    await expect(assertEnv()).rejects.toThrow(/STRIPE_SECRET_KEY/);
  });

  it('requires the webhook secret when Stripe is fully configured', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_x';
    await expect(assertEnv()).rejects.toThrow(/STRIPE_WEBHOOK_SECRET/);
  });

  it('rejects a half-configured Stripe (one key only)', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    await expect(assertEnv()).rejects.toThrow(/both|STRIPE/i);
  });

  it('accepts a fully, correctly configured Stripe env', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_x';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_x';
    await expect(assertEnv()).resolves.toBeUndefined();
  });

  it('rejects a non-URL site URL', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'not a url';
    await expect(assertEnv()).rejects.toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it('requires AUTH_SECRET once LIVE Stripe keys are configured', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_live_x';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_live_x';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_x';
    // No AUTH_SECRET → forgeable session cookies while real money moves.
    await expect(assertEnv()).rejects.toThrow(/AUTH_SECRET/);
  });

  it('accepts LIVE Stripe keys when a real AUTH_SECRET is set', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_live_x';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_live_x';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_x';
    process.env.AUTH_SECRET = 'a-sufficiently-long-random-secret';
    await expect(assertEnv()).resolves.toBeUndefined();
  });

  it('does NOT require AUTH_SECRET for test-key Stripe (the demo stays zero-config)', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_x';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_x';
    await expect(assertEnv()).resolves.toBeUndefined();
  });
});
