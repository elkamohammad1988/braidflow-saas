import 'server-only';
import { dbAdmin } from '@/lib/db/server';
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
  clientEmail: string | null;
  clientPhone: string | null;
  braiderName: string;
  braiderEmail: string | null;
  businessName: string;
  braiderTimezone: string;
  // Where the client manages this booking: a guest's tokenized capability URL, or
  // a registered client's bookings list.
  clientManageUrl: string;
};

type SendResult = Awaited<ReturnType<typeof sendEmail>>;

// A send "succeeded" if it was delivered OR intentionally skipped (no API key in
// dev). Only an actual delivery failure counts against us.
function sendOk(r: SendResult): boolean {
  return r.skipped ? true : r.ok;
}

async function loadBookingContext(bookingId: string): Promise<BookingContext | null> {
  const admin = dbAdmin();
  const { data } = await admin
    .from('bookings')
    .select(
      `id, scheduled_at, price_cents, deposit_cents, client_id, braider_id,
       guest_name, guest_email, guest_phone, guest_token,
       services(name),
       client:profiles!bookings_client_id_fkey(full_name, phone),
       braiders(business_name, timezone, profiles!braiders_id_fkey(full_name))`
    )
    .eq('id', bookingId)
    .maybeSingle();

  // Note: `client` is intentionally NOT required — guest bookings have no profile.
  if (!data || !data.services || !data.braiders) {
    console.error('[notify] booking context unavailable', bookingId);
    return null;
  }

  // Client identity: a registered client resolves via their profile + auth email
  // (emails live on auth.users, read via the admin auth API); a guest carries
  // their contact details on the booking itself, with no auth row to look up.
  let clientName: string;
  let clientEmail: string | null;
  let clientPhone: string | null;
  if (data.client_id) {
    const { data: clientAuth } = await admin.auth.admin.getUserById(data.client_id);
    clientName = data.client?.full_name ?? 'there';
    clientEmail = clientAuth?.user?.email ?? null;
    clientPhone = data.client?.phone ?? null;
  } else {
    clientName = data.guest_name ?? 'there';
    clientEmail = data.guest_email ?? null;
    clientPhone = data.guest_phone ?? null;
  }

  const { data: braiderAuth } = await admin.auth.admin.getUserById(data.braider_id);
  const braiderEmail = braiderAuth?.user?.email ?? null;

  // A missing email no longer suppresses BOTH messages — we send to whoever we
  // can reach and log the gap rather than silently dropping everything.
  if (!clientEmail) console.error('[notify] missing client email for booking', bookingId);
  if (!braiderEmail) console.error('[notify] missing braider email for booking', bookingId);

  // Guests manage via their capability URL (no account); registered clients via
  // their bookings list.
  const clientManageUrl =
    !data.client_id && data.guest_token
      ? `${siteUrl()}/bookings/${data.id}/confirmation?t=${encodeURIComponent(data.guest_token)}`
      : `${siteUrl()}/bookings`;

  return {
    bookingId: data.id,
    scheduledAt: data.scheduled_at,
    priceCents: data.price_cents,
    depositCents: data.deposit_cents,
    serviceName: data.services.name,
    clientName,
    clientEmail,
    clientPhone,
    braiderName: data.braiders.profiles?.full_name ?? data.braiders.business_name,
    braiderEmail,
    businessName: data.braiders.business_name,
    braiderTimezone: data.braiders.timezone,
    clientManageUrl
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
    timeZone: ctx.braiderTimezone,
    priceCents: ctx.priceCents,
    depositCents: ctx.depositCents,
    bookingUrl: ctx.clientManageUrl
  };

  const braiderProps = {
    braiderFirstName: firstName(ctx.braiderName),
    clientName: ctx.clientName,
    clientPhone: ctx.clientPhone,
    serviceName: ctx.serviceName,
    scheduledAt: ctx.scheduledAt,
    timeZone: ctx.braiderTimezone,
    priceCents: ctx.priceCents,
    depositCents: ctx.depositCents,
    dashboardUrl: `${siteUrl()}/dashboard/appointments`
  };

  const sends: Promise<SendResult>[] = [];
  if (ctx.clientEmail) {
    sends.push(
      sendEmail({
        to: ctx.clientEmail,
        subject: confirmedClientSubject(clientProps),
        react: BookingConfirmedClientEmail(clientProps)
      })
    );
  }
  if (ctx.braiderEmail) {
    sends.push(
      sendEmail({
        to: ctx.braiderEmail,
        subject: receivedBraiderSubject(braiderProps),
        react: BookingReceivedBraiderEmail(braiderProps)
      })
    );
  }
  const settled = await Promise.allSettled(sends);
  if (settled.some((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !sendOk(r.value)))) {
    console.error('[notify] confirmation email(s) failed for booking', ctx.bookingId);
  }
}

export async function notifyReminder(
  bookingId: string,
  proximity: '24h' | '2h' = '24h'
): Promise<{ ok: boolean }> {
  const ctx = await loadBookingContext(bookingId);
  // A missing context is likely transient (DB / auth lookup) — report failure so
  // the cron un-claims the reminder and retries on the next tick.
  if (!ctx) return { ok: false };

  const clientProps = {
    clientFirstName: firstName(ctx.clientName),
    businessName: ctx.businessName,
    serviceName: ctx.serviceName,
    scheduledAt: ctx.scheduledAt,
    timeZone: ctx.braiderTimezone,
    balanceCents: ctx.priceCents - ctx.depositCents,
    bookingUrl: ctx.clientManageUrl,
    proximity
  };

  const braiderProps = {
    braiderFirstName: firstName(ctx.braiderName),
    clientName: ctx.clientName,
    clientPhone: ctx.clientPhone,
    serviceName: ctx.serviceName,
    scheduledAt: ctx.scheduledAt,
    timeZone: ctx.braiderTimezone,
    dashboardUrl: `${siteUrl()}/dashboard/appointments`,
    proximity
  };

  const sends: Promise<SendResult>[] = [];
  if (ctx.clientEmail) {
    sends.push(
      sendEmail({
        to: ctx.clientEmail,
        subject: reminderClientSubject(clientProps),
        react: ReminderClientEmail(clientProps)
      })
    );
  }
  if (ctx.braiderEmail) {
    sends.push(
      sendEmail({
        to: ctx.braiderEmail,
        subject: reminderBraiderSubject(braiderProps),
        react: ReminderBraiderEmail(braiderProps)
      })
    );
  }

  const settled = await Promise.allSettled(sends);
  const ok =
    settled.length > 0 &&
    settled.every((r) => r.status === 'fulfilled' && sendOk(r.value));
  return { ok };
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
    newScheduledAt: ctx.scheduledAt,
    timeZone: ctx.braiderTimezone
  };

  const toBraider: RescheduledProps = {
    recipientFirstName: firstName(ctx.braiderName),
    audience: 'braider',
    otherPartyName: ctx.clientName,
    serviceName: ctx.serviceName,
    previousScheduledAt: meta.previousScheduledAt,
    newScheduledAt: ctx.scheduledAt,
    timeZone: ctx.braiderTimezone
  };

  // Send to the party who didn't initiate the change. The initiator already
  // saw the success state in-app, so we skip emailing them — keeps the inbox quiet.
  const recipients = meta.movedBy === 'client' ? [toBraider] : [toClient];

  await Promise.allSettled(
    recipients.flatMap((p) => {
      const to = p.audience === 'client' ? ctx.clientEmail : ctx.braiderEmail;
      if (!to) return [];
      return [
        sendEmail({
          to,
          subject: rescheduledSubject(p),
          react: BookingRescheduledEmail(p)
        })
      ];
    })
  );
}

export async function notifyDepositRefunded(bookingId: string, amountCents: number) {
  const ctx = await loadBookingContext(bookingId);
  if (!ctx) return;

  if (!ctx.clientEmail) return;

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
    scheduledAt: ctx.scheduledAt,
    timeZone: ctx.braiderTimezone
  };

  const toBraider: CancelledProps = {
    recipientFirstName: firstName(ctx.braiderName),
    audience: 'braider',
    cancelledBy,
    otherPartyName: ctx.clientName,
    serviceName: ctx.serviceName,
    scheduledAt: ctx.scheduledAt,
    timeZone: ctx.braiderTimezone
  };

  const sends: Promise<SendResult>[] = [];
  if (ctx.clientEmail) {
    sends.push(
      sendEmail({
        to: ctx.clientEmail,
        subject: cancelledSubject(toClient),
        react: BookingCancelledEmail(toClient)
      })
    );
  }
  if (ctx.braiderEmail) {
    sends.push(
      sendEmail({
        to: ctx.braiderEmail,
        subject: cancelledSubject(toBraider),
        react: BookingCancelledEmail(toBraider)
      })
    );
  }
  await Promise.allSettled(sends);
}
