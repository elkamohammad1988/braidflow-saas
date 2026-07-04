'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { stripe } from '@/lib/stripe/client';
import { db, dbAdmin } from '@/lib/db/server';
import { notifyDepositRefunded } from '@/lib/email/notifications';
import { recordAuditLog } from '@/lib/audit/log';
import { captureException } from '@/lib/monitoring';

type Result = { ok: true } | { error: string };

type Admin = ReturnType<typeof dbAdmin>;

export type DepositRefundOutcome =
  | { status: 'succeeded' | 'pending'; amountCents: number }
  | { skipped: 'no_succeeded_deposit' | 'already_refunded' | 'missing_reference' }
  | { error: string };

/**
 * Refund a booking's *charged* deposit. Pure money operation — the CALLER is
 * responsible for authorization (who is allowed to trigger this). Idempotent:
 * a stable Stripe idempotency key dedupes double-clicks of the same attempt, and
 * the `payments` row is upserted on the unique `stripe_refund_id`. Safe to call
 * on a booking with no charged deposit (it no-ops via `skipped`).
 *
 * Shared by the braider's manual "Refund deposit" action and the automatic
 * refund-on-cancellation path so both behave identically.
 */
export async function issueDepositRefund(
  admin: Admin,
  bookingId: string,
  actorId: string | null
): Promise<DepositRefundOutcome> {
  const { data: payments } = await admin
    .from('payments')
    .select('id, kind, status, stripe_payment_intent_id')
    .eq('booking_id', bookingId);

  const deposit = payments?.find((p) => p.kind === 'deposit');
  const existingRefund = payments?.find((p) => p.kind === 'refund');

  // Nothing collected → nothing to refund (e.g. cancelling an unpaid hold).
  if (!deposit || deposit.status !== 'succeeded') return { skipped: 'no_succeeded_deposit' };
  // A non-failed refund already exists — don't double-refund.
  if (existingRefund && existingRefund.status !== 'failed') return { skipped: 'already_refunded' };
  if (!deposit.stripe_payment_intent_id) return { skipped: 'missing_reference' };

  // A stable key dedupes accidental double-clicks of the SAME attempt. But after
  // a genuinely failed refund, reusing it would make Stripe return the same
  // failed refund forever — so a retry past a failure uses a fresh key.
  const idempotencyKey =
    existingRefund?.status === 'failed'
      ? `refund-${bookingId}-${randomUUID()}`
      : `refund-${bookingId}`;

  let refund;
  try {
    refund = await stripe.refunds.create(
      {
        payment_intent: deposit.stripe_payment_intent_id,
        // The deposit was a destination charge to the braider's connected
        // account, so reverse the transfer to claw the funds back from their
        // balance — otherwise the platform would eat the refund.
        reverse_transfer: true,
        metadata: { booking_id: bookingId }
      },
      { idempotencyKey }
    );
  } catch (err) {
    // Log the detail server-side; don't surface raw Stripe text to the UI.
    console.error('[refund] stripe refund failed', bookingId, err);
    captureException(err, { stage: 'refund.create', bookingId });
    return { error: 'We couldn\'t process the refund. Try again or contact support.' };
  }

  const initialStatus =
    refund.status === 'succeeded'
      ? 'succeeded'
      : refund.status === 'failed' || refund.status === 'canceled'
      ? 'failed'
      : 'pending';

  // Upsert on the unique stripe_refund_id so an idempotent retry doesn't
  // create a duplicate row.
  await admin
    .from('payments')
    .upsert(
      {
        booking_id: bookingId,
        kind: 'refund',
        amount_cents: refund.amount,
        status: initialStatus,
        stripe_refund_id: refund.id
      },
      { onConflict: 'stripe_refund_id' }
    );

  await recordAuditLog({
    actorId,
    action: 'booking.refunded',
    entityType: 'booking',
    entityId: bookingId,
    metadata: {
      amount_cents: refund.amount,
      stripe_refund_id: refund.id,
      status: initialStatus
    }
  });

  if (initialStatus === 'failed') {
    return { error: 'Stripe rejected the refund. Try again or contact support.' };
  }

  await notifyDepositRefunded(bookingId, refund.amount);
  return { status: initialStatus, amountCents: refund.amount };
}

export async function refundDepositAction(bookingId: string): Promise<Result> {
  const database = db();
  const { data: { user } } = await database.auth.getUser();
  if (!user) return { error: 'You need to be signed in.' };

  const admin = dbAdmin();
  const { data: booking } = await admin
    .from('bookings')
    .select('id, braider_id, status, deposit_cents')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) return { error: 'Booking not found.' };
  // Authorization: only the braider may issue a refund from the dashboard.
  if (booking.braider_id !== user.id) return { error: 'Only the braider can issue a refund.' };

  const outcome = await issueDepositRefund(admin, bookingId, user.id);

  if ('error' in outcome) return { error: outcome.error };
  if ('skipped' in outcome) {
    switch (outcome.skipped) {
      case 'already_refunded':
        return { error: 'A refund has already been issued for this booking.' };
      case 'missing_reference':
        return { error: 'Missing payment reference — contact support.' };
      case 'no_succeeded_deposit':
      default:
        return { error: 'The deposit hasn\'t been collected yet, so there\'s nothing to refund.' };
    }
  }

  revalidatePath('/bookings');
  revalidatePath('/dashboard/appointments');
  return { ok: true };
}
