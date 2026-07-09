'use server';

import { redirect } from 'next/navigation';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { stripe } from '@/lib/stripe/client';
import { isStripeConfigured } from '@/lib/stripe/config';
import { signBookingSnapshot } from './demo-snapshot';
import { db, dbAdmin } from '@/lib/db/server';
import { recordAuditLog } from '@/lib/audit/log';
import { captureException } from '@/lib/monitoring';
import { rateLimit, clientIpKey } from '@/lib/rate-limit';
import { CURRENCY } from '@/lib/constants';
import { isSlotBookable } from './slot-check';
import { createBookingSchema, type CreateBookingInput } from './validation';
import { generateGuestToken } from './guest-token';

export async function createBookingAction(input: CreateBookingInput) {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid booking details.' };

  const database = db();
  const { data: { user } } = await database.auth.getUser();

  // A guest (not signed in) books with the contact details from the form. An
  // authenticated client books against their account and any guest fields are
  // ignored. Guest bookings get a capability token so they can manage the
  // booking later without an account.
  const guest = user ? null : parsed.data.guest ?? null;
  if (!user && !guest) {
    return { error: 'Add your name and email so we can confirm your booking.' };
  }
  const guestToken = guest ? generateGuestToken() : null;

  // Throttle each attempt — it creates a pending booking + a Stripe
  // PaymentIntent, so an abusive loop is both DB churn and Stripe spend. Keyed
  // per user when signed in, otherwise per client IP (guests have no id), with a
  // tighter window for the unauthenticated path. A normal client never trips this.
  const limit = user
    ? rateLimit(`booking:create:${user.id}`, { limit: 8, windowMs: 5 * 60_000 })
    : rateLimit(`booking:create:ip:${clientIpKey()}`, { limit: 5, windowMs: 15 * 60_000 });
  if (!limit.ok) {
    return { error: 'You\'re booking very quickly. Please wait a moment and try again.' };
  }

  const admin = dbAdmin();

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
      'accepting_bookings, timezone, stripe_account_id, charges_enabled, availability_rules(day_of_week, start_minute, end_minute), availability_overrides(starts_at, ends_at, kind)'
    )
    .eq('id', service.braider_id)
    .maybeSingle();

  if (!braider || !braider.accepting_bookings) {
    return { error: 'This braider isn\'t accepting bookings right now.' };
  }

  // Hard gate: a braider can only take deposits once their Stripe Connect account
  // can accept charges. Without this we'd create a PaymentIntent that can't be
  // routed to them. The booking page hides the flow in this state, but the
  // request is untrusted — enforce it here too.
  if (!braider.charges_enabled || !braider.stripe_account_id) {
    return { error: 'This braider hasn\'t finished setting up payments yet. Please check back soon.' };
  }
  const connectedAccountId = braider.stripe_account_id;

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
    braider.timezone,
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
      client_id: user?.id ?? null,
      braider_id: service.braider_id,
      service_id: service.id,
      scheduled_at: parsed.data.scheduledAt,
      duration_minutes: service.duration_minutes,
      price_cents: service.price_cents,
      deposit_cents: service.deposit_cents,
      client_notes: parsed.data.clientNotes ?? null,
      guest_name: guest?.name ?? null,
      guest_email: guest?.email ?? null,
      guest_phone: guest?.phone ?? null,
      guest_token: guestToken,
      status: 'pending_payment'
    })
    .select('id')
    .single();

  // 23P01 = exclusion violation → slot already taken.
  if (insertError || !booking) {
    if (insertError?.code === '23P01') {
      return { error: 'Someone just grabbed that slot. Pick another time.' };
    }
    return { error: 'Could not create that booking. Try again.' };
  }

  // Deposit PaymentIntent. With real Stripe configured this is a Connect
  // destination charge to the braider's account. In the keyless demo we skip
  // Stripe entirely and synthesize an id — the deposit is simulated on the pay
  // page (see confirmDemoDepositAction); no money ever moves.
  let paymentIntentId: string;
  if (isStripeConfigured()) {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: service.deposit_cents,
        currency: CURRENCY,
        automatic_payment_methods: { enabled: true },
        // Destination charge: the braider is the merchant of record and receives
        // the full deposit in their connected account. No application_fee_amount —
        // the platform takes no cut during beta (see lib/constants PLATFORM_FEE_BPS
        // for the future model). Refunds reverse this transfer (see refund.ts).
        on_behalf_of: connectedAccountId,
        transfer_data: { destination: connectedAccountId },
        metadata: { booking_id: booking.id, kind: 'deposit' },
        description: `Deposit · ${service.name}`
      });
      paymentIntentId = intent.id;
    } catch (err) {
      // Roll back the hold so the slot isn't stuck until the expiry cron, and the
      // user gets a clean error instead of an unhandled rejection.
      console.error('[booking] PaymentIntent creation failed, rolling back', booking.id, err);
      captureException(err, { stage: 'payment_intent.create', bookingId: booking.id });
      await admin.from('bookings').delete().eq('id', booking.id);
      return { error: 'Could not start payment. Please try again.' };
    }
  } else {
    paymentIntentId = `pi_demo_${booking.id}`;
  }

  const { error: paymentError } = await admin.from('payments').insert({
    booking_id: booking.id,
    kind: 'deposit',
    amount_cents: service.deposit_cents,
    status: 'pending',
    stripe_payment_intent_id: paymentIntentId
  });

  if (paymentError) {
    // Without a payments row the deposit could be charged with no local record
    // and the webhook would match nothing. Cancel the intent and release the
    // hold rather than proceed.
    console.error('[booking] payment row insert failed, rolling back', booking.id, paymentError);
    if (isStripeConfigured()) {
      try {
        await stripe.paymentIntents.cancel(paymentIntentId);
      } catch (cancelErr) {
        // Worst case: a live PaymentIntent with no local payment row. Alert loudly
        // so it can be reconciled before a client is charged for a phantom booking.
        console.error('[booking] PI cancel during rollback failed', paymentIntentId, cancelErr);
        captureException(cancelErr, { stage: 'payment_intent.cancel', paymentIntentId });
      }
    }
    await admin.from('bookings').delete().eq('id', booking.id);
    return { error: 'Could not start payment. Please try again.' };
  }

  // Record before redirect — redirect() throws, so nothing after it runs.
  await recordAuditLog({
    actorId: user?.id ?? null,
    action: 'booking.created',
    entityType: 'booking',
    entityId: booking.id,
    metadata: {
      braider_id: service.braider_id,
      service_id: service.id,
      scheduled_at: parsed.data.scheduledAt,
      deposit_cents: service.deposit_cents,
      guest: Boolean(guest)
    }
  });

  // Guests carry their capability token through to the pay page (and onward);
  // authenticated clients are recognised by their session. In demo mode we also
  // carry a signed snapshot so the pay/confirmation steps can self-heal the
  // booking onto whichever serverless instance serves them (see demo-snapshot).
  const query: string[] = [];
  if (guestToken) query.push(`t=${guestToken}`);
  if (!isStripeConfigured()) {
    const snapshot = await signBookingSnapshot(
      {
        id: booking.id,
        client_id: user?.id ?? null,
        braider_id: service.braider_id,
        service_id: service.id,
        scheduled_at: parsed.data.scheduledAt,
        duration_minutes: service.duration_minutes,
        price_cents: service.price_cents,
        deposit_cents: service.deposit_cents,
        status: 'pending_payment',
        client_notes: parsed.data.clientNotes ?? null,
        guest_name: guest?.name ?? null,
        guest_email: guest?.email ?? null,
        guest_phone: guest?.phone ?? null,
        guest_token: guestToken,
        created_at: new Date().toISOString()
      },
      'pending'
    );
    query.push(`d=${encodeURIComponent(snapshot)}`);
  }
  redirect(`/bookings/${booking.id}/pay${query.length ? `?${query.join('&')}` : ''}`);
}
