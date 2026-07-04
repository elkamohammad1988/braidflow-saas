import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TZDate } from '@date-fns/tz';
import { addDays, startOfDay } from 'date-fns';
import { requireSession } from '@/lib/auth/session';
import { dbAdmin } from '@/lib/db/server';
import { computeSlotsForDay } from '@/lib/bookings/availability';
import { guestTokenMatches } from '@/lib/bookings/guest-token';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';
import { RescheduleFlow } from './reschedule-flow';

const WINDOW_DAYS = 28;

export default async function ReschedulePage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { t?: string };
}) {
  const token = searchParams.t;
  const database = dbAdmin();

  const { data: booking } = await database
    .from('bookings')
    .select(
      `id, client_id, braider_id, guest_token, status, scheduled_at, duration_minutes,
       services(name, duration_minutes),
       braiders(business_name, slug, timezone,
         availability_rules(day_of_week, start_minute, end_minute),
         availability_overrides(starts_at, ends_at, kind))`
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!booking) notFound();

  // Three possible viewers: a guest (capability token), the signed-in client, or
  // the signed-in braider. Guests and clients return to their own surfaces.
  let isGuest = false;
  let isBraider = false;
  if (token) {
    if (!guestTokenMatches(booking.guest_token, token)) notFound();
    isGuest = true;
  } else {
    const { user } = await requireSession();
    const isClient = booking.client_id === user.id;
    isBraider = booking.braider_id === user.id;
    if (!isClient && !isBraider) notFound();
  }

  const tokenQuery = isGuest && token ? `?t=${encodeURIComponent(token)}` : '';
  const returnTo = isBraider
    ? '/dashboard/appointments'
    : isGuest
    ? `/bookings/${booking.id}/confirmation${tokenQuery}`
    : '/bookings';

  if (booking.status !== 'pending_payment' && booking.status !== 'confirmed') {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-ink">This booking can&apos;t be rescheduled</h1>
        <p className="mt-3 text-sm text-ink-muted">
          It&apos;s either already cancelled or completed.
        </p>
        <Link
          href={returnTo}
          className="mt-6 inline-block text-sm font-medium text-ink underline underline-offset-4"
        >
          ← Back
        </Link>
      </div>
    );
  }

  const tz = booking.braiders?.timezone ?? DEFAULT_TIMEZONE;
  const today = startOfDay(TZDate.tz(tz));
  const horizon = addDays(today, WINDOW_DAYS);

  const { data: otherBookings } = await database
    .from('bookings')
    .select('id, scheduled_at, duration_minutes')
    .eq('braider_id', booking.braider_id)
    .in('status', ['pending_payment', 'confirmed'])
    .neq('id', booking.id)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', horizon.toISOString());

  const duration = booking.duration_minutes;
  const slotsByDay = Array.from({ length: WINDOW_DAYS }, (_, i) => {
    const day = addDays(today, i);
    return {
      date: day.toISOString(),
      slots: computeSlotsForDay(
        day,
        tz,
        duration,
        booking.braiders?.availability_rules ?? [],
        booking.braiders?.availability_overrides ?? [],
        otherBookings ?? []
      ).map((s) => ({ start: s.start.toISOString(), end: s.end.toISOString() }))
    };
  });

  const businessName = booking.braiders?.business_name ?? '';
  const serviceName = booking.services?.name ?? '';

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={returnTo}
        className="inline-flex items-center text-sm text-ink-muted hover:text-ink"
      >
        ← {isBraider ? 'Back to appointments' : 'Back to my bookings'}
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
          Reschedule
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">Pick a new time</h1>
        <p className="mt-3 max-w-prose text-sm text-ink-muted">
          Same {serviceName.toLowerCase()} with {businessName}. Your deposit carries over —
          no payment needed.
        </p>
      </div>

      <div className="mt-10">
        <RescheduleFlow
          bookingId={booking.id}
          currentScheduledAt={booking.scheduled_at}
          businessName={businessName}
          serviceName={serviceName}
          slotsByDay={slotsByDay}
          returnTo={returnTo}
          timeZone={tz}
          token={isGuest ? token : undefined}
        />
      </div>

      <div className="mt-10 rounded-card border border-line bg-paper/60 px-5 py-4 text-sm text-ink-muted">
        Can&apos;t find a time that works?{' '}
        <Link
          href={`/braiders/${booking.braiders?.slug ?? ''}`}
          className="text-ink underline underline-offset-4"
        >
          See {businessName}&apos;s page
        </Link>{' '}
        or cancel from your{' '}
        <Link href={returnTo} className="text-ink underline underline-offset-4">
          {isBraider ? 'appointments list' : 'bookings list'}
        </Link>
        .
      </div>
    </div>
  );
}
