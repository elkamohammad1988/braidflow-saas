// Single source of truth for the platform's billing currency. Stripe expects
// the lowercase ISO 4217 code; Intl.NumberFormat expects it uppercased.
export const CURRENCY = 'usd';
export const CURRENCY_DISPLAY = CURRENCY.toUpperCase();

// --- Business / revenue model -------------------------------------------------
// Owner-set on 2026-06-13 (hybrid marketplace). Centralized so the booking,
// payout, subscription, and refund logic all read one source of truth.

// Platform commission taken from each booking deposit, charged via Stripe
// Connect `application_fee_amount`. Basis points to avoid float drift
// (1000 bps = 10%).
export const PLATFORM_FEE_BPS = 1000;

// Braider subscription (Stripe Billing). Price id comes from env so test/live
// can differ without a code change.
export const SUBSCRIPTION_PRICE_CENTS = 2900;
export const SUBSCRIPTION_TRIAL_DAYS = 14;

// Cancellation/refund policy: a client who cancels at least this many hours
// before the appointment gets a full deposit refund; cancelling later forfeits
// the deposit. A braider-initiated cancellation always refunds the client.
export const CANCELLATION_REFUND_WINDOW_HOURS = 48;

/** Platform fee (in cents) for a given deposit, rounded to the nearest cent. */
export function platformFeeCents(depositCents: number): number {
  return Math.round((depositCents * PLATFORM_FEE_BPS) / 10_000);
}
