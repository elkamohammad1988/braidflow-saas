import 'server-only';
import { headers } from 'next/headers';

// Basic in-memory fixed-window rate limiter.
//
// Scope & limitation: the counter lives in the memory of a single server
// instance. On a multi-instance or serverless deployment (e.g. Vercel) each
// instance keeps its own window, so the effective global limit is roughly
// `limit × instances`, and a cold start resets it. That is an acceptable,
// deliberately "basic" first line of defence against bursts, accidental loops,
// and casual abuse — it is NOT a hard security boundary. For a strict global
// limit, swap the Map below for a shared store (Upstash Redis, a Postgres
// table) behind this same `rateLimit()` signature; see docs/DEPLOYMENT.md.

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

// Opportunistic cleanup so the Map can't grow unbounded under many distinct
// keys. Runs at most once per interval, piggy-backed on access — no background
// timer (which wouldn't survive a serverless freeze anyway).
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Requests left in the current window (0 once blocked). */
  remaining: number;
  /** Seconds until the window resets — surface this in a Retry-After/UI hint. */
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= opts.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
    };
  }

  entry.count += 1;
  return { ok: true, remaining: opts.limit - entry.count, retryAfterSeconds: 0 };
}

// Best-effort client IP for rate-limit keying, read from the request headers.
// Vercel (and most proxies) set `x-forwarded-for`; the left-most entry is the
// original client. Unknown clients collapse into one shared bucket rather than
// each getting their own unlimited allowance.
export function clientIpKey(): string {
  const h = headers();
  const forwarded = h.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
}
