import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { dbAdmin } from '@/lib/db/server';
import { resetStore } from '@/lib/db/store';
import type { BookingStatus } from '@/types/db';

// The webhook is where a Stripe charge becomes a confirmed booking. These lock:
// signature rejection, exactly-once confirm, replay dedupe, the resurrection
// guard, refund reconciliation, and account.updated → capability sync.

const { constructEvent, notifyBookingConfirmed } = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  notifyBookingConfirmed: vi.fn()
}));

vi.mock('@/lib/stripe/client', () => ({ stripe: { webhooks: { constructEvent } } }));
vi.mock('@/lib/email/notifications', () => ({ notifyBookingConfirmed }));

import { POST } from './route';

const savedSecret = process.env.STRIPE_WEBHOOK_SECRET;
beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
});
afterAll(() => {
  if (savedSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = savedSecret;
});

// deno-lint / ts: minimal event shape; constructEvent returns whatever we pass.
async function deliver(evt: unknown, sig: string | null = 'sig') {
  constructEvent.mockReturnValue(evt);
  return POST(
    new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      headers: sig ? { 'stripe-signature': sig } : {},
      body: JSON.stringify(evt)
    })
  );
}

async function seedPendingBooking(id = 'bk_test', piId = 'pi_test', status: BookingStatus = 'pending_payment') {
  const admin = dbAdmin();
  await admin.from('bookings').insert({
    id,
    braider_id: 'braider-x',
    service_id: 'svc',
    scheduled_at: '2999-01-01T10:00:00.000Z',
    duration_minutes: 120,
    price_cents: 10000,
    deposit_cents: 2000,
    status
  });
  await admin.from('payments').insert({
    booking_id: id,
    kind: 'deposit',
    amount_cents: 2000,
    status: 'pending',
    stripe_payment_intent_id: piId
  });
  return { id, piId };
}

const bookingStatus = async (id: string) =>
  (await dbAdmin().from('bookings').select('status').eq('id', id).maybeSingle()).data?.status;

describe('stripe webhook', () => {
  it('returns 400 when the signature is missing', async () => {
    const res = await deliver({ id: 'evt_x', type: 'x' }, null);
    expect(res.status).toBe(400);
  });

  it('returns 400 when signature verification throws', async () => {
    constructEvent.mockImplementation(() => {
      throw new Error('bad signature');
    });
    const res = await POST(
      new Request('http://localhost/api/stripe/webhook', {
        method: 'POST',
        headers: { 'stripe-signature': 'bad' },
        body: '{}'
      })
    );
    expect(res.status).toBe(400);
  });

  it('confirms a pending booking on payment_intent.succeeded and emails exactly once', async () => {
    const { id, piId } = await seedPendingBooking();
    const res = await deliver({
      id: 'evt_1',
      type: 'payment_intent.succeeded',
      data: { object: { id: piId, metadata: { booking_id: id, kind: 'deposit' }, latest_charge: 'ch_1' } }
    });
    expect(res.status).toBe(200);
    expect(await bookingStatus(id)).toBe('confirmed');
    const pay = (await dbAdmin().from('payments').select('status, stripe_charge_id').eq('booking_id', id).maybeSingle()).data;
    expect(pay?.status).toBe('succeeded');
    expect(pay?.stripe_charge_id).toBe('ch_1');
    expect(notifyBookingConfirmed).toHaveBeenCalledTimes(1);
  });

  it('is idempotent — a replayed event is deduped and does not re-confirm or re-email', async () => {
    const { id, piId } = await seedPendingBooking();
    const evt = {
      id: 'evt_dupe',
      type: 'payment_intent.succeeded',
      data: { object: { id: piId, metadata: { booking_id: id, kind: 'deposit' }, latest_charge: 'ch_1' } }
    };
    await deliver(evt);
    const res2 = await deliver(evt);
    expect((await res2.json()).duplicate).toBe(true);
    expect(notifyBookingConfirmed).toHaveBeenCalledTimes(1); // once total, not twice
  });

  it('never resurrects a cancelled booking', async () => {
    const { id, piId } = await seedPendingBooking('bk_cancel', 'pi_cancel', 'cancelled');
    await deliver({
      id: 'evt_late',
      type: 'payment_intent.succeeded',
      data: { object: { id: piId, metadata: { booking_id: id, kind: 'deposit' }, latest_charge: 'ch_z' } }
    });
    expect(await bookingStatus(id)).toBe('cancelled');
    expect(notifyBookingConfirmed).not.toHaveBeenCalled();
  });

  it('marks the payment failed on payment_intent.payment_failed, leaving the booking', async () => {
    const { id, piId } = await seedPendingBooking('bk_fail', 'pi_fail');
    await deliver({ id: 'evt_f', type: 'payment_intent.payment_failed', data: { object: { id: piId } } });
    expect(await bookingStatus(id)).toBe('pending_payment');
    const pay = (await dbAdmin().from('payments').select('status').eq('booking_id', id).maybeSingle()).data;
    expect(pay?.status).toBe('failed');
  });

  it('reconciles a dashboard-issued refund into a local refund row, idempotently', async () => {
    const { id, piId } = await seedPendingBooking('bk_ref', 'pi_ref');
    await dbAdmin().from('payments').update({ status: 'succeeded' }).eq('booking_id', id);

    await deliver({
      id: 'evt_ref1',
      type: 'refund.updated',
      data: { object: { id: 're_1', status: 'succeeded', amount: 2000, payment_intent: piId } }
    });
    // A second, distinct event carrying the same refund id must not duplicate the row.
    await deliver({
      id: 'evt_ref2',
      type: 'refund.updated',
      data: { object: { id: 're_1', status: 'succeeded', amount: 2000, payment_intent: piId } }
    });

    const rows = (await dbAdmin().from('payments').select('kind, status').eq('booking_id', id)).data as Array<{
      kind: string;
      status: string;
    }>;
    const refunds = rows.filter((p) => p.kind === 'refund');
    expect(refunds).toHaveLength(1);
    expect(refunds[0]?.status).toBe('succeeded');
  });

  it('clears accepting_bookings when account.updated reports charges disabled', async () => {
    await dbAdmin()
      .from('braiders')
      .update({ stripe_account_id: 'acct_wh', accepting_bookings: true, charges_enabled: true })
      .eq('slug', 'your-studio');
    await deliver({
      id: 'evt_acct',
      type: 'account.updated',
      data: { object: { id: 'acct_wh', charges_enabled: false, payouts_enabled: false, details_submitted: true } }
    });
    const b = (await dbAdmin().from('braiders').select('accepting_bookings, charges_enabled').eq('slug', 'your-studio').maybeSingle()).data;
    expect(b?.charges_enabled).toBe(false);
    expect(b?.accepting_bookings).toBe(false);
  });

  it('acknowledges an unhandled event type without changes', async () => {
    const res = await deliver({ id: 'evt_u', type: 'invoice.paid', data: { object: {} } });
    expect(res.status).toBe(200);
    expect((await res.json()).received).toBe(true);
  });
});
