import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendEmail } from './send';
import {
  BookingConfirmedClientEmail,
  confirmedClientSubject
} from './templates/booking-confirmed-client';
import {
  BookingReceivedBraiderEmail,
  receivedBraiderSubject
} from './templates/booking-received-braider';
import { ReminderClientEmail, reminderClientSubject } from './templates/reminder-client';
import { ReminderBraiderEmail, reminderBraiderSubject } from './templates/reminder-braider';
import {
  BookingCancelledEmail,
  cancelledSubject,
  type CancelledProps
} from './templates/booking-cancelled';
import {
  BookingRescheduledEmail,
  rescheduledSubject,
  type RescheduledProps
} from './templates/booking-rescheduled';
import {
  DepositRefundedEmail,
  refundedSubject,
  type RefundedProps
} from './templates/deposit-refunded';

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

function firstName(name: string) {
  return name.split(' ')[0] ?? name;
}

type BookingContext = {
  bookingId: string;
  scheduledAt: string;
  priceCents: number;
  depositCents: number;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  braiderName: string;
  braiderEmail: string;
  businessName: string;
};

async function loadBookingContext(bookingId: string): Promise<BookingContext | null> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from('bookings')
    .select(
      `id, scheduled_at, price_cents, deposit_cents,
       services(name),
       client:profiles!bookings_client_id_fkey(full_name, phone),
       braiders(business_name, profiles!braiders_id_fkey(full_name))`
    )
    .eq('id', bookingId)
    .maybeSingle();

  if (!data || !data.services || !data.client || !data.braiders) return null;

  // Emails live on auth.users — service role can read them via admin auth API.
  const { data: parties } = await admin
    .from('bookings')
    .select('client_id, braider_id')
    .eq('id', bookingId)
    .single();

  if (!parties) return null;

  const [{ data: clientAuth }, { data: braiderAuth }] = await Promise.all([
    admin.auth.admin.getUserById(parties.client_id),
    admin.auth.admin.getUserById(parties.braider_id)
  ]);

  if (!clientAuth?.user?.email || !braiderAuth?.user?.email) return null;

  return {
    bookingId: data.id,
    scheduledAt: data.scheduled_at,
    priceCents: data.price_cents,
    depositCents: data.deposit_cents,
    serviceName: data.services.name,
    clientName: data.client.full_name,
    clientEmail: clientAuth.user.email,
    clientPhone: data.client.phone,
    braiderName: data.braiders.profiles?.full_name ?? data.braiders.business_name,
    braiderEmail: braiderAuth.user.email,
    businessName: data.braiders.business_name
  };
}

export async function notifyBookingConfirmed(bookingId: string) {
  const ctx = await loadBookingContext(bookingId);
  if (!ctx) return;

  const clientProps = {
    clientFirstName: firstName(ctx.clientName),
    businessName: ctx.businessName,
    serviceName: ctx.serviceName,
    scheduledAt: ctx.scheduledAt,
    priceCents: ctx.priceCents,
    depositCents: ctx.depositCents,
    bookingUrl: `${siteUrl()}/bookings`
  };

  const braiderProps = {
    braiderFirstName: firstName(ctx.braiderName),
    clientName: ctx.clientName,
    clientPhone: ctx.clientPhone,
    serviceName: ctx.serviceName,
    scheduledAt: ctx.scheduledAt,
    priceCents: ctx.priceCents,
    depositCents: ctx.depositCents,
    dashboardUrl: `${siteUrl()}/dashboard/appointments`
  };

  await Promise.allSettled([
    sendEmail({
      to: ctx.clientEmail,
      subject: confirmedClientSubject(clientProps),
      react: BookingConfirmedClientEmail(clientProps)
    }),
    sendEmail({
      to: ctx.braiderEmail,
      subject: receivedBraiderSubject(braiderProps),
      react: BookingReceivedBraiderEmail(braiderProps)
    })
  ]);
}

export async function notifyReminder(bookingId: string, proximity: '24h' | '2h' = '24h') {
  const ctx = await loadBookingContext(bookingId);
  if (!ctx) return;

  const clientProps = {
    clientFirstName: firstName(ctx.clientName),
    businessName: ctx.businessName,
    serviceName: ctx.serviceName,
    scheduledAt: ctx.scheduledAt,
    balanceCents: ctx.priceCents - ctx.depositCents,
    bookingUrl: `${siteUrl()}/bookings`,
    proximity
  };

  const braiderProps = {
    braiderFirstName: firstName(ctx.braiderName),
    clientName: ctx.clientName,
    clientPhone: ctx.clientPhone,
    serviceName: ctx.serviceName,
    scheduledAt: ctx.scheduledAt,
    dashboardUrl: `${siteUrl()}/dashboard/appointments`,
    proximity
  };

  await Promise.allSettled([
    sendEmail({
      to: ctx.clientEmail,
      subject: reminderClientSubject(clientProps),
      react: ReminderClientEmail(clientProps)
    }),
    sendEmail({
      to: ctx.braiderEmail,
      subject: reminderBraiderSubject(braiderProps),
      react: ReminderBraiderEmail(braiderProps)
    })
  ]);
}

export async function notifyReschedule(
  bookingId: string,
  meta: { previousScheduledAt: string; movedBy: 'client' | 'braider' }
) {
  const ctx = await loadBookingContext(bookingId);
  if (!ctx) return;

  const toClient: RescheduledProps = {
    recipientFirstName: firstName(ctx.clientName),
    audience: 'client',
    otherPartyName: ctx.businessName,
    serviceName: ctx.serviceName,
    previousScheduledAt: meta.previousScheduledAt,
    newScheduledAt: ctx.scheduledAt
  };

  const toBraider: RescheduledProps = {
    recipientFirstName: firstName(ctx.braiderName),
    audience: 'braider',
    otherPartyName: ctx.clientName,
    serviceName: ctx.serviceName,
    previousScheduledAt: meta.previousScheduledAt,
    newScheduledAt: ctx.scheduledAt
  };

  // Send to the party who didn't initiate the change. The initiator already
  // saw the success state in-app, so we skip emailing them — keeps the inbox quiet.
  const recipients = meta.movedBy === 'client' ? [toBraider] : [toClient];

  await Promise.allSettled(
    recipients.map((p) =>
      sendEmail({
        to: p.audience === 'client' ? ctx.clientEmail : ctx.braiderEmail,
        subject: rescheduledSubject(p),
        react: BookingRescheduledEmail(p)
      })
    )
  );
}

export async function notifyDepositRefunded(bookingId: string, amountCents: number) {
  const ctx = await loadBookingContext(bookingId);
  if (!ctx) return;

  const props: RefundedProps = {
    clientFirstName: firstName(ctx.clientName),
    businessName: ctx.businessName,
    serviceName: ctx.serviceName,
    amountCents
  };

  await sendEmail({
    to: ctx.clientEmail,
    subject: refundedSubject(props),
    react: DepositRefundedEmail(props)
  });
}

export async function notifyCancellation(bookingId: string, cancelledBy: 'client' | 'braider') {
  const ctx = await loadBookingContext(bookingId);
  if (!ctx) return;

  const toClient: CancelledProps = {
    recipientFirstName: firstName(ctx.clientName),
    audience: 'client',
    cancelledBy,
    otherPartyName: ctx.businessName,
    serviceName: ctx.serviceName,
    scheduledAt: ctx.scheduledAt
  };

  const toBraider: CancelledProps = {
    recipientFirstName: firstName(ctx.braiderName),
    audience: 'braider',
    cancelledBy,
    otherPartyName: ctx.clientName,
    serviceName: ctx.serviceName,
    scheduledAt: ctx.scheduledAt
  };

  await Promise.allSettled([
    sendEmail({
      to: ctx.clientEmail,
      subject: cancelledSubject(toClient),
      react: BookingCancelledEmail(toClient)
    }),
    sendEmail({
      to: ctx.braiderEmail,
      subject: cancelledSubject(toBraider),
      react: BookingCancelledEmail(toBraider)
    })
  ]);
}
