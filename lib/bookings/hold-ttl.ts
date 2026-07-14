// Single source of truth for how long an unpaid booking hold may occupy a slot
// before it's released. Shared by the expiry cron (the global backstop) and the
// lazy release run on the booking-availability + create/reschedule paths, so the
// effective TTL is identical everywhere and tunable via one env var without a
// redeploy.

export const DEFAULT_PENDING_TTL_MINUTES = 30;

export function pendingHoldTtlMinutes(): number {
  const raw = Number(process.env.PENDING_BOOKING_TTL_MINUTES);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_PENDING_TTL_MINUTES;
}

/** ISO instant before which a `pending_payment` hold is considered stale. */
export function staleHoldCutoffIso(now: Date = new Date()): string {
  return new Date(now.getTime() - pendingHoldTtlMinutes() * 60_000).toISOString();
}
