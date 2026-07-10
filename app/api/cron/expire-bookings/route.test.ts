import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { dbAdmin } from '@/lib/db/server';
import { resetStore } from '@/lib/db/store';

// The expiry cron must free abandoned holds WITHOUT racing a late payment: cancel
// the PaymentIntent first, release the slot only if that succeeds, and never touch
// a hold whose deposit already succeeded. In demo mode it must not call Stripe.

const { isStripeConfigured, cancel } = vi.hoisted(() => ({
  isStripeConfigured: vi.fn(),
  cancel: vi.fn()
}));
vi.mock('@/lib/stripe/config', () => ({ isStripeConfigured }));
vi.mock('@/lib/stripe/client', () => ({ stripe: { paymentIntents: { cancel } } }));

import { GET } from './route';

const savedSecret = process.env.CRON_SECRET;
beforeEach(async () => {
  resetStore();
  // Start from an empty bookings/payments set so `expired` counts are exact — the
  // seed ships its own stale demo holds that would otherwise be swept too.
  await dbAdmin().from('payments').delete();
  await dbAdmin().from('bookings').delete();
  vi.clearAllMocks();
  isStripeConfigured.mockReturnValue(false); // demo by default
  process.env.CRON_SECRET = 'cron-secret-value';
});
afterAll(() => {
  if (savedSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = savedSecret;
});

const authed = () =>
  new Request('http://localhost/api/cron/expire-bookings', {
    headers: { authorization: 'Bearer cron-secret-value' }
  });

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

async function seedHold(opts: {
  id: string;
  createdAt: string;
  depositStatus?: 'pending' | 'succeeded';
  piId?: string;
}) {
  const admin = dbAdmin();
  await admin.from('bookings').insert({
    id: opts.id,
    braider_id: 'braider-x',
    service_id: 'svc',
    scheduled_at: '2999-01-01T10:00:00.000Z',
    duration_minutes: 120,
    price_cents: 10000,
    deposit_cents: 2000,
    status: 'pending_payment',
    created_at: opts.createdAt
  });
  if (opts.piId) {
    await admin.from('payments').insert({
      booking_id: opts.id,
      kind: 'deposit',
      amount_cents: 2000,
      status: opts.depositStatus ?? 'pending',
      stripe_payment_intent_id: opts.piId
    });
  }
}

const status = async (id: string) =>
  (await dbAdmin().from('bookings').select('status').eq('id', id).maybeSingle()).data?.status;

describe('expire-bookings cron', () => {
  it('rejects an unauthenticated request', async () => {
    const res = await GET(new Request('http://localhost/api/cron/expire-bookings'));
    expect(res.status).toBe(401);
  });

  it('demo mode: releases a stale hold without calling Stripe', async () => {
    await seedHold({ id: 'bk_demo', createdAt: hoursAgo(2), piId: 'pi_demo_bk_demo' });
    const res = await GET(authed());
    expect((await res.json()).expired).toBe(1);
    expect(await status('bk_demo')).toBe('cancelled');
    const pay = (await dbAdmin().from('payments').select('status').eq('booking_id', 'bk_demo').maybeSingle()).data;
    expect(pay?.status).toBe('failed');
    expect(cancel).not.toHaveBeenCalled();
  });

  it('never releases a hold whose deposit already succeeded', async () => {
    await seedHold({ id: 'bk_paid', createdAt: hoursAgo(2), depositStatus: 'succeeded', piId: 'pi_paid' });
    const res = await GET(authed());
    expect((await res.json()).expired).toBe(0);
    expect(await status('bk_paid')).toBe('pending_payment');
  });

  it('leaves a fresh (not-yet-stale) hold alone', async () => {
    await seedHold({ id: 'bk_fresh', createdAt: hoursAgo(0), piId: 'pi_demo_bk_fresh' });
    const res = await GET(authed());
    expect((await res.json()).expired).toBe(0);
    expect(await status('bk_fresh')).toBe('pending_payment');
  });

  it('real mode: cancels the PaymentIntent first, then releases', async () => {
    isStripeConfigured.mockReturnValue(true);
    cancel.mockResolvedValue({ id: 'pi_real' });
    await seedHold({ id: 'bk_real', createdAt: hoursAgo(2), piId: 'pi_real' });
    await GET(authed());
    expect(cancel).toHaveBeenCalledWith('pi_real');
    expect(await status('bk_real')).toBe('cancelled');
  });

  it('real mode: if the PaymentIntent cancel is rejected (client just paid), the hold is left intact', async () => {
    isStripeConfigured.mockReturnValue(true);
    cancel.mockRejectedValue(new Error('already succeeded'));
    await seedHold({ id: 'bk_race', createdAt: hoursAgo(2), piId: 'pi_race' });
    const res = await GET(authed());
    expect((await res.json()).expired).toBe(0);
    expect(await status('bk_race')).toBe('pending_payment'); // webhook will confirm it
    const pay = (await dbAdmin().from('payments').select('status').eq('booking_id', 'bk_race').maybeSingle()).data;
    expect(pay?.status).toBe('pending'); // untouched
  });
});
