import { TZDate } from '@date-fns/tz';
import { addDays, endOfDay, startOfWeek } from 'date-fns';
import { requireBraider } from '@/lib/auth/session';
import { supabaseServer } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { formatMoney } from '@/lib/utils';
import { formatInZone } from '@/lib/format-date';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';

export default async function CalendarPage() {
  const { user } = await requireBraider();
  const supabase = supabaseServer();

  const { data: braiderRow } = await supabase
    .from('braiders')
    .select('timezone')
    .eq('id', user.id)
    .maybeSingle();
  const tz = braiderRow?.timezone ?? DEFAULT_TIMEZONE;

  // The week and its day grid are computed in the braider's zone, so a booking
  // near midnight lands in the right local day, not the server's.
  const weekStart = startOfWeek(TZDate.tz(tz), { weekStartsOn: 1 });
  const weekEnd = endOfDay(addDays(weekStart, 6));

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(
      'id, scheduled_at, duration_minutes, status, price_cents, services(name), profiles!bookings_client_id_fkey(full_name)'
    )
    .eq('braider_id', user.id)
    .gte('scheduled_at', weekStart.toISOString())
    .lte('scheduled_at', weekEnd.toISOString())
    .in('status', ['pending_payment', 'confirmed'])
    .order('scheduled_at');

  if (error) throw error;

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const byDay = new Map<string, typeof bookings>();
  bookings?.forEach((b) => {
    const key = formatInZone(b.scheduled_at, tz, 'yyyy-MM-dd');
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(b);
  });

  return (
    <div>
      <PageHeader
        title="This week"
        description={`${formatInZone(weekStart, tz, 'MMM d')} – ${formatInZone(
          addDays(weekStart, 6),
          tz,
          'MMM d'
        )}`}
      />

      <div className="mt-8 grid gap-3 md:grid-cols-7">
        {days.map((day) => {
          const key = formatInZone(day, tz, 'yyyy-MM-dd');
          const items = byDay.get(key) ?? [];
          return (
            <div
              key={key}
              className="min-h-[180px] rounded-card border border-ink/5 bg-white p-3 shadow-soft"
            >
              <p className="text-xs uppercase tracking-wider text-ink-muted">
                {formatInZone(day, tz, 'EEE')}
              </p>
              <p className="font-display text-2xl text-ink">{formatInZone(day, tz, 'd')}</p>
              <ul className="mt-3 space-y-2">
                {items.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-lg border border-ink/5 bg-cream/60 px-2.5 py-2 text-xs"
                  >
                    <p className="font-medium text-ink">
                      {formatInZone(b.scheduled_at, tz, 'h:mm a')}
                    </p>
                    <p className="truncate text-ink-muted">{b.profiles?.full_name}</p>
                    <p className="truncate text-ink-muted">{b.services?.name}</p>
                    <p className="mt-1 text-ink-muted">{formatMoney(b.price_cents)}</p>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="text-xs text-ink-muted/70">—</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
