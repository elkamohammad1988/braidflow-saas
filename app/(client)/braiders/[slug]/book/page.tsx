import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { TZDate } from '@date-fns/tz';
import { addDays, startOfDay } from 'date-fns';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { computeSlotsForDay } from '@/lib/bookings/availability';
import { CANCELLATION_REFUND_WINDOW_HOURS } from '@/lib/constants';
import { BookingFlow } from './booking-flow';

// Availability changes constantly and the data is fetched with the service role
// (no cookies to make this implicitly dynamic), so render on every request.
export const dynamic = 'force-dynamic';

const WINDOW_DAYS = 21;

export default async function BookPage({ params }: { params: { slug: string } }) {
  // Use the service role for availability data: it must include this braider's
  // private block windows and EVERY client's busy slots to compute openings
  // correctly. RLS would hide both from the viewing client. Only derived free
  // slots are sent to the browser — never raw bookings or override notes.
  const admin = supabaseAdmin();

  // Whether to collect guest contact details in the flow. Signed-in clients book
  // against their account; everyone else books as a guest. (No redirect — the
  // whole point is that the page is reachable without an account.)
  const { data: { user } } = await supabaseServer().auth.getUser();
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
          {braider.business_name} isn&rsquo;t taking bookings right now
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          {open
            ? 'This braider hasn’t published any services yet. Check back soon.'
            : 'Their books are currently closed. Check back soon or browse other braiders.'}
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href={`/braiders/${params.slug}`} className="text-sm font-medium text-ink underline">
            View profile
          </Link>
          <Link href="/braiders" className="text-sm font-medium text-ink-muted underline">
            Browse braiders
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

  const { data: bookings } = await admin
    .from('bookings')
    .select('scheduled_at, duration_minutes, status')
    .eq('braider_id', braider.id)
    .in('status', ['pending_payment', 'confirmed'])
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', horizon.toISOString());

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
    <div className="mx-auto max-w-3xl px-6 py-8 md:py-10">
      <Link
        href={`/braiders/${params.slug}`}
        className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        {braider.business_name}
      </Link>

      <h1 className="mt-4 font-display text-3xl leading-tight text-ink md:text-4xl">
        Book your appointment
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Choose a service and time — a small deposit holds your slot, refundable up to{' '}
        {CANCELLATION_REFUND_WINDOW_HOURS} hours before.
      </p>

      <div className="mt-8">
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
