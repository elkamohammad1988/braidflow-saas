import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dbAdmin } from '@/lib/db/server';
import { resetStore } from '@/lib/db/store';
import { depositStateFromPayments } from '@/lib/payments/status';
import { issueDepositRefund } from './refund';

// The refund records a payment row + audit trail (what we assert) and then fires
// a best-effort notification email. Stub the notification module so the test
// doesn't pull the React-email `.tsx` templates through the JSX transform — the
// email is a side effect, not the behavior under test.
vi.mock('@/lib/email/notifications', () => ({
  notifyDepositRefunded: async () => {}
}));

// These exercise the deposit-refund path against the seeded in-memory store with
// no Stripe keys configured — i.e. the exact environment the live demo runs in,
// where the refund used to throw. Every case must resolve cleanly.

type PaymentRow = { booking_id: string; kind: string; status: string };

async function allPayments(): Promise<PaymentRow[]> {
  const { data } = await dbAdmin().from('payments').select('booking_id, kind, status');
  return (data ?? []) as PaymentRow[];
}

// A booking whose deposit was collected (succeeded) but has no refund yet — the
// normal target of a manual refund or a policy-driven refund on cancellation.
async function freshRefundableBooking(): Promise<string> {
  const byBooking = new Map<string, Record<string, string>>();
  for (const p of await allPayments()) {
    const entry = byBooking.get(p.booking_id) ?? {};
    entry[p.kind] = p.status;
    byBooking.set(p.booking_id, entry);
  }
  for (const [bookingId, kinds] of byBooking) {
    if (kinds.deposit === 'succeeded' && !kinds.refund) return bookingId;
  }
  throw new Error('seed has no succeeded deposit without a refund');
}

async function bookingWithPendingDeposit(): Promise<string> {
  const row = (await allPayments()).find((p) => p.kind === 'deposit' && p.status === 'pending');
  if (!row) throw new Error('seed has no pending deposit');
  return row.booking_id;
}

async function alreadyRefundedBooking(): Promise<string> {
  const row = (await allPayments()).find((p) => p.kind === 'refund');
  if (!row) throw new Error('seed has no existing refund');
  return row.booking_id;
}

async function refundRowFor(bookingId: string) {
  const { data } = await dbAdmin()
    .from('payments')
    .select('kind, status, amount_cents, stripe_refund_id')
    .eq('booking_id', bookingId);
  return (data ?? []).find((p) => p.kind === 'refund');
}

describe('issueDepositRefund — demo mode (no Stripe configured)', () => {
  beforeEach(() => resetStore());

  it('simulates a successful refund instead of throwing', async () => {
    const bookingId = await freshRefundableBooking();
    const outcome = await issueDepositRefund(dbAdmin(), bookingId, 'actor-1');

    expect(outcome).toMatchObject({ status: 'succeeded' });
    if ('status' in outcome) expect(outcome.amountCents).toBeGreaterThan(0);
  });

  it('writes a succeeded refund row with a demo reference', async () => {
    const bookingId = await freshRefundableBooking();
    await issueDepositRefund(dbAdmin(), bookingId, null);

    const refund = await refundRowFor(bookingId);
    expect(refund?.status).toBe('succeeded');
    expect(refund?.amount_cents).toBeGreaterThan(0);
    expect(String(refund?.stripe_refund_id)).toContain('re_demo_');
  });

  it('never returns an error outcome in demo mode', async () => {
    const bookingId = await freshRefundableBooking();
    const outcome = await issueDepositRefund(dbAdmin(), bookingId, null);
    expect('error' in outcome).toBe(false);
  });

  it('is idempotent — a second refund is skipped and leaves one row', async () => {
    const bookingId = await freshRefundableBooking();
    await issueDepositRefund(dbAdmin(), bookingId, null);
    const second = await issueDepositRefund(dbAdmin(), bookingId, null);

    expect(second).toEqual({ skipped: 'already_refunded' });
    const { data } = await dbAdmin()
      .from('payments')
      .select('kind')
      .eq('booking_id', bookingId);
    expect((data ?? []).filter((p) => p.kind === 'refund')).toHaveLength(1);
  });

  it('skips when the deposit was never collected', async () => {
    const bookingId = await bookingWithPendingDeposit();
    const outcome = await issueDepositRefund(dbAdmin(), bookingId, null);
    expect(outcome).toEqual({ skipped: 'no_succeeded_deposit' });
  });

  it('does not double-refund a booking already refunded in the seed', async () => {
    const bookingId = await alreadyRefundedBooking();
    const outcome = await issueDepositRefund(dbAdmin(), bookingId, null);
    expect(outcome).toEqual({ skipped: 'already_refunded' });
  });

  // The cancellation flow settles a charged deposit by calling this same
  // function; assert the resulting payment state reads back as "refunded".
  it('drives the deposit state to refunded (cancellation settlement path)', async () => {
    const bookingId = await freshRefundableBooking();
    await issueDepositRefund(dbAdmin(), bookingId, null);

    const { data } = await dbAdmin()
      .from('payments')
      .select('kind, status')
      .eq('booking_id', bookingId);
    expect(depositStateFromPayments(data)).toBe('refunded');
  });
});
