import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addDays, startOfDay } from 'date-fns';
import { supabaseServer } from '@/lib/supabase/server';
import { computeSlotsForDay } from '@/lib/bookings/availability';
import { BookingFlow } from './booking-flow';

const WINDOW_DAYS = 21;

export default async function BookPage({ params }: { params: { slug: string } }) {
  const supabase = supabaseServer();
  const { data: braider } = await supabase
    .from('braiders')
    .select(
      'id, slug, business_name, accepting_bookings, services(id, name, description, duration_minutes, price_cents, deposit_cents, is_active), availability_rules(day_of_week, start_minute, end_minute), availability_overrides(starts_at, ends_at, kind)'
    )
    .eq('slug', params.slug)
    .maybeSingle();

  if (!braider) notFound();

  const services = (braider.services ?? []).filter((s) => s.is_active);

  // Guard the dead-end: if the braider isn't accepting bookings or has no active
  // services, the slot grid would render empty with a permanently-disabled
  // button. Show an explanatory state instead and link back to the profile.
  if (!braider.accepting_bookings || services.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl text-ink">
          {braider.business_name} isn&rsquo;t taking bookings right now
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          {braider.accepting_bookings
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

  const today = startOfDay(new Date());
  const horizon = addDays(today, WINDOW_DAYS);

  const { data: bookings } = await supabase
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
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-ink-muted">
        Booking with <span className="text-ink">{braider.business_name}</span>
      </p>
      <h1 className="mt-1 font-display text-3xl text-ink">Pick a service and time</h1>
      <div className="mt-8">
        <BookingFlow
          services={services}
          slotsByService={slotsByService}
          braiderSlug={params.slug}
        />
      </div>
    </div>
  );
}
