// Single source of truth for the platform's billing currency. Stripe expects
// the lowercase ISO 4217 code; Intl.NumberFormat expects it uppercased.
export const CURRENCY = 'usd';
export const CURRENCY_DISPLAY = CURRENCY.toUpperCase();

// Cancellation/refund policy: a client who cancels at least this many hours
// before the appointment gets a full deposit refund; cancelling later forfeits
// the deposit. A braider-initiated cancellation always refunds the client.
export const CANCELLATION_REFUND_WINDOW_HOURS = 48;

// NB: the platform takes 0% of deposits and charges no subscription during beta
// (see the pricing page and lib/bookings/create.ts) — braiders keep the full
// deposit and it's transferred straight to their connected account. The future
// commission / subscription model lives in git history, not as dead constants
// that would contradict the live "0% fee" pricing.
