'use server';

import { redirect } from 'next/navigation';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { recordAuditLog } from '@/lib/audit/log';
import { captureException } from '@/lib/monitoring';
import { rateLimit } from '@/lib/rate-limit';
import { CURRENCY } from '@/lib/constants';
import { isSlotBookable } from './slot-check';
import { createBookingSchema, type CreateBookingInput } from './validation';

export async function createBookingAction(input: CreateBookingInput) {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid booking details.' };

  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You need to be signed in to book.' };

  // Throttle per user: each attempt creates a pending booking + a Stripe
  // PaymentIntent, so an abusive loop is both a DB-churn and a Stripe-spend
  // vector. A normal client never trips this.
  const limit = rateLimit(`booking:create:${user.id}`, { limit: 8, windowMs: 5 * 60_000 });
  if (!limit.ok) {
    return { error: 'You\'re booking very quickly. Please wait a moment and try again.' };
  }

  const admin = supabaseAdmin();

  const { data: service, error: serviceError } = await admin
    .from('services')
    .select('id, braider_id, name, duration_minutes, price_cents, deposit_cents, is_active')
    .eq('id', parsed.data.serviceId)
    .single();

  if (serviceError || !service || !service.is_active) {
    return { error: 'That service is no longer available.' };
  }

  // --- Server-side slot validation -----------------------------------------
  // The client only ever surfaces bookable slots, but the request is fully
  // untrusted: re-validate the requested time from scratch.
  const requestedStart = new Date(parsed.data.scheduledAt);
  if (Number.isNaN(requestedStart.getTime())) {
    return { error: 'Pick a valid time.' };
  }

  // Future-date guard, with a small skew allowance for clock drift.
  if (requestedStart.getTime() <= Date.now() + 60_000) {
    return { error: 'Pick a time in the future.' };
  }

  const { data: braider } = await admin
    .from('braiders')
    .select(
      'accepting_bookings, availability_rules(day_of_week, start_minute, end_minute), availability_overrides(starts_at, ends_at, kind)'
    )
    .eq('id', service.braider_id)
    .maybeSingle();

  if (!braider || !braider.accepting_bookings) {
    return { error: 'This braider isn\'t accepting bookings right now.' };
  }

  // Pull the braider's bookings around the requested day (one day back to catch
  // an appointment that spills past midnight) for the overlap check.
  const windowStart = subDays(startOfDay(requestedStart), 1).toISOString();
  const windowEnd = endOfDay(requestedStart).toISOString();
  const { data: dayBookings } = await admin
    .from('bookings')
    .select('scheduled_at, duration_minutes')
    .eq('braider_id', service.braider_id)
    .in('status', ['pending_payment', 'confirmed'])
    .gte('scheduled_at', windowStart)
    .lt('scheduled_at', windowEnd);

  const bookable = isSlotBookable(
    requestedStart,
    service.duration_minutes,
    braider.availability_rules ?? [],
    braider.availability_overrides ?? [],
    dayBookings ?? []
  );
  if (!bookable) {
    return { error: 'That time isn\'t available. Pick another slot.' };
  }
  // -------------------------------------------------------------------------

  const { data: booking, error: insertError } = await admin
    .from('bookings')
    .insert({
      client_id: user.id,
      braider_id: service.braider_id,
      service_id: service.id,
      scheduled_at: parsed.data.scheduledAt,
      duration_minutes: service.duration_minutes,
      price_cents: service.price_cents,
      deposit_cents: service.deposit_cents,
      client_notes: parsed.data.clientNotes ?? null,
      status: 'pending_payment'
    })
    .select('id')
    .single();

  // 23P01 = exclusion violation → slot already taken.
  if (insertError) {
    if (insertError.code === '23P01') {
      return { error: 'Someone just grabbed that slot. Pick another time.' };
    }
    return { error: 'Could not create that booking. Try again.' };
  }

  let intent;
  try {
    intent = await stripe.paymentIntents.create({
      amount: service.deposit_cents,
      currency: CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: { booking_id: booking.id, kind: 'deposit' },
      description: `Deposit · ${service.name}`
    });
  } catch (err) {
    // Roll back the hold so the slot isn't stuck until the expiry cron, and the
    // user gets a clean error instead of an unhandled rejection.
    console.error('[booking] PaymentIntent creation failed, rolling back', booking.id, err);
    captureException(err, { stage: 'payment_intent.create', bookingId: booking.id });
    await admin.from('bookings').delete().eq('id', booking.id);
    return { error: 'Could not start payment. Please try again.' };
  }

  const { error: paymentError } = await admin.from('payments').insert({
    booking_id: booking.id,
    kind: 'deposit',
    amount_cents: service.deposit_cents,
    status: 'pending',
    stripe_payment_intent_id: intent.id
  });

  if (paymentError) {
    // Without a payments row the deposit could be charged with no local record
    // and the webhook would match nothing. Cancel the intent and release the
    // hold rather than proceed.
    console.error('[booking] payment row insert failed, rolling back', booking.id, paymentError);
    try {
      await stripe.paymentIntents.cancel(intent.id);
    } catch (cancelErr) {
      // Worst case: a live PaymentIntent with no local payment row. Alert loudly
      // so it can be reconciled before a client is charged for a phantom booking.
      console.error('[booking] PI cancel during rollback failed', intent.id, cancelErr);
      captureException(cancelErr, { stage: 'payment_intent.cancel', paymentIntentId: intent.id });
    }
    await admin.from('bookings').delete().eq('id', booking.id);
    return { error: 'Could not start payment. Please try again.' };
  }

  // Record before redirect — redirect() throws, so nothing after it runs.
  await recordAuditLog({
    actorId: user.id,
    action: 'booking.created',
    entityType: 'booking',
    entityId: booking.id,
    metadata: {
      braider_id: service.braider_id,
      service_id: service.id,
      scheduled_at: parsed.data.scheduledAt,
      deposit_cents: service.deposit_cents
    }
  });

  redirect(`/bookings/${booking.id}/pay`);
}
