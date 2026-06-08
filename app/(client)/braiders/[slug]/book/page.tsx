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
      'id, slug, business_name, services(id, name, description, duration_minutes, price_cents, deposit_cents, is_active), availability_rules(day_of_week, start_minute, end_minute), availability_overrides(starts_at, ends_at, kind)'
    )
    .eq('slug', params.slug)
    .maybeSingle();

  if (!braider) notFound();

  const today = startOfDay(new Date());
  const horizon = addDays(today, WINDOW_DAYS);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('scheduled_at, duration_minutes, status')
    .eq('braider_id', braider.id)
    .in('status', ['pending_payment', 'confirmed'])
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', horizon.toISOString());

  const services = (braider.services ?? []).filter((s) => s.is_active);

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
