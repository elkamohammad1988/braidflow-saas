import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { TZDate } from '@date-fns/tz';
import { addDays, startOfDay, subDays } from 'date-fns';
import { getTranslations } from 'next-intl/server';
import { dbAdmin, db } from '@/lib/db/server';
import { computeSlotsForDay } from '@/lib/bookings/availability';
import { staleHoldCutoffIso } from '@/lib/bookings/hold-ttl';
import { CANCELLATION_REFUND_WINDOW_HOURS } from '@/lib/constants';
import type { Metadata } from 'next';
import { BookingFlow } from './booking-flow';

// A transactional funnel step, not indexable content.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: t('bookTitle'),
    robots: { index: false, follow: false }
  };
}

// Availability changes constantly and the query reads private braider data with
// no request cookies (so it isn't implicitly dynamic) — render on every request.
export const dynamic = 'force-dynamic';

const WINDOW_DAYS = 21;

export default async function BookPage({ params }: { params: { slug: string } }) {
  const t = await getTranslations('booking');
  // Availability is computed from privileged data — this braider's private block
  // windows and every client's busy slots. Only the derived free slots are sent
  // to the browser, never raw bookings or override notes.
  const admin = dbAdmin();

  // Whether to collect guest contact details in the flow. Signed-in clients book
  // against their account; everyone else books as a guest. (No redirect — the
  // whole point is that the page is reachable without an account.)
  const { data: { user } } = await db().auth.getUser();
  const isAuthenticated = Boolean(user);

  const { data: braider } = await admin
    .from('braiders')
    .select(
      'id, slug, business_name, accepting_bookings, charges_enabled, timezone, services(id, name, description, duration_minutes, price_cents, deposit_cents, is_active), availability_rules(day_of_week, start_minute, end_minute), availability_overrides(starts_at, ends_at, kind)'
    )
    .eq('slug', params.slug)
    .maybeSingle();

  if (!braider) notFound();

  const services = (braider.services ?? []).filter((s) => s.is_active);

  // A braider is bookable only when they're accepting bookings AND Stripe can
  // take charges for them. Clients don't need to know which is missing — both
  // read as "books closed".
  const open = braider.accepting_bookings && braider.charges_enabled;

  // Guard the dead-end: if the braider isn't bookable or has no active services,
  // the slot grid would render empty with a permanently-disabled button. Show an
  // explanatory state instead and link back to the profile.
  if (!open || services.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl text-ink">
          {t('notTakingBookings', { name: braider.business_name })}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          {open ? t('noServices') : t('booksClosed')}
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href={`/braiders/${params.slug}`} className="text-sm font-medium text-ink underline">
            {t('viewProfile')}
          </Link>
          <Link href="/braiders" className="text-sm font-medium text-ink-muted underline">
            {t('browseBraiders')}
          </Link>
        </div>
      </div>
    );
  }

  // Iterate calendar days in the braider's zone so "day 1" is their tomorrow,
  // not the server's. computeSlotsForDay resolves each day's hours in that zone.
  const tz = braider.timezone;
  const today = startOfDay(TZDate.tz(tz));
  const horizon = addDays(today, WINDOW_DAYS);

  // Pad the fetch a full day on each side of the visible window. The bounds are
  // braider-zone midnights; a booking near either edge (or one that spills across
  // the boundary in a zone offset from UTC) can sit just outside [today, horizon)
  // yet still overlap a first/last-day slot. computeSlotsForDay does the precise
  // per-slot overlap, so over-fetching is free — under-fetching would let the
  // picker offer an already-taken edge slot that then fails at submit. Mirrors the
  // padded window in create.ts / reschedule.ts.
  const { data: bookingsRaw } = await admin
    .from('bookings')
    .select('scheduled_at, duration_minutes, status, created_at')
    .eq('braider_id', braider.id)
    .in('status', ['pending_payment', 'confirmed'])
    .gte('scheduled_at', subDays(today, 1).toISOString())
    .lt('scheduled_at', addDays(horizon, 1).toISOString());

  // Don't let an abandoned hold squat a slot in the picker. A `pending_payment`
  // hold older than the TTL is effectively expired (the cron/lazy-release will
  // formally cancel it, and the create action releases it before booking), so
  // treat it as free here rather than showing the slot as taken for up to a day.
  const staleCutoff = staleHoldCutoffIso();
  const bookings = (bookingsRaw ?? []).filter(
    (b) => b.status !== 'pending_payment' || (b.created_at ?? '') >= staleCutoff
  );

  const slotsByDayForService = (durationMinutes: number) =>
    Array.from({ length: WINDOW_DAYS }, (_, i) => {
      const day = addDays(today, i);
      return {
        date: day.toISOString(),
        slots: computeSlotsForDay(
          day,
          tz,
          durationMinutes,
          braider.availability_rules ?? [],
          braider.availability_overrides ?? [],
          bookings ?? []
        ).map((s) => ({ start: s.start.toISOString(), end: s.end.toISOString() }))
      };
    });

  // Precompute real availability for every active service. Each service has its
  // own duration, so the open slots genuinely differ per service. Computed once
  // here against the braider's shared rules, overrides, and existing bookings,
  // then the client switches between them instantly when the service changes.
  const slotsByService: Record<string, ReturnType<typeof slotsByDayForService>> = {};
  for (const service of services) {
    slotsByService[service.id] = slotsByDayForService(service.duration_minutes);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6 md:py-8">
      <Link
        href={`/braiders/${params.slug}`}
        className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        {braider.business_name}
      </Link>

      <h1 className="mt-4 font-display text-3xl leading-tight text-ink md:text-4xl">
        {t('bookAppointment')}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        {t('chooseServiceTime', { hours: CANCELLATION_REFUND_WINDOW_HOURS })}
      </p>

      <div className="mt-6">
        <BookingFlow
          services={services}
          slotsByService={slotsByService}
          braiderSlug={params.slug}
          businessName={braider.business_name}
          timeZone={tz}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
