// Runtime environment validation.
// -----------------------------------------------------------------------------
// The app deploys with zero required configuration (self-contained demo). But
// every OPTIONAL integration, once switched on, has invariants: keys must be
// well-formed and their companion secrets must be present, or the integration is
// silently insecure/broken. This schema encodes those invariants and is asserted
// once at server boot (instrumentation.ts) and before sensitive route work, so
// misconfiguration fails loudly and early rather than at the worst moment.
//
// Empty/whitespace values are treated as UNSET — `.env` files routinely carry
// `STRIPE_SECRET_KEY=` placeholders, and those must not count as "configured".
// AUTH_SECRET is intentionally optional (the demo runs on the public fallback;
// lib/crypto/signing.ts warns loudly in production when it does).

import { z } from 'zod';

// Wrap a string schema so blank/whitespace becomes `undefined` (i.e. optional),
// and only a genuinely present value is format-checked.
function optional<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    schema.optional()
  );
}

// A string that must parse to a sampling rate in [0, 1]. A garbage value like
// `abc` would otherwise become `NaN` and silently disable/skew Sentry sampling.
function rate01(name: string) {
  return z.string().refine((v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 1;
  }, `${name} must be a number between 0 and 1.`);
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
    AUTH_SECRET: optional(z.string().min(16, 'AUTH_SECRET should be a long random string (16+ chars).')),
    STRIPE_SECRET_KEY: optional(z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with "sk_".')),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optional(
      z.string().startsWith('pk_', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with "pk_".')
    ),
    STRIPE_WEBHOOK_SECRET: optional(
      z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with "whsec_".')
    ),
    RESEND_API_KEY: optional(z.string().startsWith('re_', 'RESEND_API_KEY must start with "re_".')),
    EMAIL_FROM: optional(z.string()),
    CRON_SECRET: optional(z.string().min(16, 'CRON_SECRET should be a long random string (16+ chars).')),
    PENDING_BOOKING_TTL_MINUTES: optional(
      z
        .string()
        .refine(
          (v) => Number.isFinite(Number(v)) && Number(v) > 0,
          'PENDING_BOOKING_TTL_MINUTES must be a positive number of minutes.'
        )
    ),
    NEXT_PUBLIC_SITE_URL: optional(z.string().url('NEXT_PUBLIC_SITE_URL must be an absolute URL.')),
    NEXT_PUBLIC_SENTRY_DSN: optional(z.string().url('NEXT_PUBLIC_SENTRY_DSN must be a URL.')),
    SENTRY_DSN: optional(z.string().url('SENTRY_DSN must be a URL.')),
    SENTRY_TRACES_SAMPLE_RATE: optional(rate01('SENTRY_TRACES_SAMPLE_RATE')),
    NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: optional(rate01('NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE'))
  })
  .superRefine((env, ctx) => {
    const hasSecret = Boolean(env.STRIPE_SECRET_KEY);
    const hasPublishable = Boolean(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    // A single Stripe key is a half-configured integration.
    if (hasSecret !== hasPublishable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['STRIPE_SECRET_KEY'],
        message: 'Set BOTH STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, or neither.'
      });
    }
    // Real Stripe without webhook verification would accept forged events.
    if (hasSecret && hasPublishable && !env.STRIPE_WEBHOOK_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['STRIPE_WEBHOOK_SECRET'],
        message: 'STRIPE_WEBHOOK_SECRET is required when Stripe keys are set (webhook signature verification).'
      });
    }
    // Live Stripe means real money moving — and real, distinct users. In that mode
    // the committed AUTH_SECRET fallback (lib/crypto/signing.ts) is account-takeover
    // grade: anyone who knows the public fallback could forge a braider session
    // cookie and issue refunds or read client PII. So once live keys are present a
    // real AUTH_SECRET becomes mandatory. The keyless demo and `sk_test_` setups
    // keep booting on the fallback (which still logs a loud one-time warning).
    if (env.STRIPE_SECRET_KEY?.startsWith('sk_live_') && !env.AUTH_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['AUTH_SECRET'],
        message:
          'AUTH_SECRET is required when live Stripe keys (sk_live_) are configured — without it, ' +
          'session cookies are signed with the public demo fallback and are forgeable.'
      });
    }
  });

let validated = false;

/**
 * Validate `process.env` against the schema. Memoized — cheap to call from every
 * sensitive route. Throws a single, readable error listing every problem.
 */
export function assertRuntimeEnv(): void {
  if (validated) return;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const problems = result.error.issues
      .map((i) => `${i.path.join('.') || 'env'}: ${i.message}`)
      .join('\n  - ');
    throw new Error(`Invalid environment configuration:\n  - ${problems}`);
  }
  validated = true;
}
