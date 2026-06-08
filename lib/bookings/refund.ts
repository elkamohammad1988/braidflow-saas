'use server';

import { revalidatePath } from 'next/cache';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { notifyDepositRefunded } from '@/lib/email/notifications';

type Result = { ok: true } | { error: string };

export async function refundDepositAction(bookingId: string): Promise<Result> {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You need to be signed in.' };

  const admin = supabaseAdmin();
  const { data: booking } = await admin
    .from('bookings')
    .select('id, braider_id, status, deposit_cents')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) return { error: 'Booking not found.' };
  if (booking.braider_id !== user.id) return { error: 'Only the braider can issue a refund.' };

  const { data: payments } = await admin
    .from('payments')
    .select('id, kind, status, stripe_payment_intent_id')
    .eq('booking_id', bookingId);

  const deposit = payments?.find((p) => p.kind === 'deposit');
  const existingRefund = payments?.find((p) => p.kind === 'refund');

  if (!deposit) return { error: 'No deposit to refund on this booking.' };
  if (deposit.status !== 'succeeded') {
    return { error: 'The deposit hasn\'t been collected yet.' };
  }
  if (existingRefund && existingRefund.status !== 'failed') {
    return { error: 'A refund has already been issued for this booking.' };
  }
  if (!deposit.stripe_payment_intent_id) {
    return { error: 'Missing payment reference — contact support.' };
  }

  let refund;
  try {
    refund = await stripe.refunds.create(
      {
        payment_intent: deposit.stripe_payment_intent_id,
        metadata: { booking_id: bookingId }
      },
      { idempotencyKey: `refund-${bookingId}` }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Refund failed';
    return { error: message };
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

  if (initialStatus !== 'failed') {
    await notifyDepositRefunded(bookingId, refund.amount);
  }

  revalidatePath('/bookings');
  revalidatePath('/dashboard/appointments');

  return initialStatus === 'failed'
    ? { error: 'Stripe rejected the refund. Try again or contact support.' }
    : { ok: true };
}
