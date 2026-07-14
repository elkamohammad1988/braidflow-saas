import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { dbAdmin } from '@/lib/db/server';
import { resetStore } from '@/lib/db/store';

// The lazy release shares the cron's vetted per-hold logic; here we cover the
// booking/create/reschedule entry point: the `braiderId`-scoped sweep, which must
// release only the target braider's stale holds and leave everyone else's alone.

const { isStripeConfigured, cancel } = vi.hoisted(() => ({
  isStripeConfigured: vi.fn(),
  cancel: vi.fn()
}));
vi.mock('@/lib/stripe/config', () => ({ isStripeConfigured }));
vi.mock('@/lib/stripe/client', () => ({ stripe: { paymentIntents: { cancel } } }));

import { expireStaleHolds } from './expire-holds';

const savedTtl = process.env.PENDING_BOOKING_TTL_MINUTES;
beforeEach(async () => {
  resetStore();
  await dbAdmin().from('payments').delete();
  await dbAdmin().from('bookings').delete();
  vi.clearAllMocks();
  isStripeConfigured.mockReturnValue(false);
  delete process.env.PENDING_BOOKING_TTL_MINUTES;
});
afterAll(() => {
  if (savedTtl === undefined) delete process.env.PENDING_BOOKING_TTL_MINUTES;
  else process.env.PENDING_BOOKING_TTL_MINUTES = savedTtl;
});

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

async function hold(id: string, braiderId: string, createdAt: string, scheduledAt: string) {
  await dbAdmin().from('bookings').insert({
    id,
    braider_id: braiderId,
    service_id: 'svc',
    // Distinct slots per hold so the no-overlap constraint doesn't reject inserts.
    scheduled_at: scheduledAt,
    duration_minutes: 120,
    price_cents: 10000,
    deposit_cents: 2000,
    status: 'pending_payment',
    created_at: createdAt
  });
}

const status = async (id: string) =>
  (await dbAdmin().from('bookings').select('status').eq('id', id).maybeSingle()).data?.status;

describe('expireStaleHolds (scoped lazy release)', () => {
  it('releases only the target braider\'s stale holds', async () => {
    await hold('mine_stale', 'braider-a', hoursAgo(2), '2999-01-01T10:00:00.000Z');
    await hold('mine_fresh', 'braider-a', hoursAgo(0), '2999-01-02T10:00:00.000Z');
    await hold('theirs_stale', 'braider-b', hoursAgo(2), '2999-01-01T10:00:00.000Z');

    const released = await expireStaleHolds(dbAdmin(), { braiderId: 'braider-a' });

    expect(released).toBe(1);
    expect(await status('mine_stale')).toBe('cancelled');
    expect(await status('mine_fresh')).toBe('pending_payment'); // not yet stale
    expect(await status('theirs_stale')).toBe('pending_payment'); // other braider untouched
  });
});
