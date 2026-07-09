import { TZDate } from '@date-fns/tz';
import { addDays, endOfDay, startOfWeek } from 'date-fns';
import { requireBraider } from '@/lib/auth/session';
import { db } from '@/lib/db/server';
import { PageHeader } from '@/components/shared/page-header';
import { cn, formatMoney } from '@/lib/utils';
import { formatInZone } from '@/lib/format-date';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';
import { getTranslations } from 'next-intl/server';

export default async function CalendarPage() {
  const { user } = await requireBraider();
  const database = db();
  const t = await getTranslations('dashboard');

  const { data: braiderRow } = await database
    .from('braiders')
    .select('timezone')
    .eq('id', user.id)
    .maybeSingle();
  const tz = braiderRow?.timezone ?? DEFAULT_TIMEZONE;

  // The week and its day grid are computed in the braider's zone, so a booking
  // near midnight lands in the right local day, not the server's.
  const weekStart = startOfWeek(TZDate.tz(tz), { weekStartsOn: 1 });
  const weekEnd = endOfDay(addDays(weekStart, 6));

  const { data: bookings, error } = await database
    .from('bookings')
    .select(
      'id, scheduled_at, duration_minutes, status, price_cents, guest_name, services(name), profiles!bookings_client_id_fkey(full_name)'
    )
    .eq('braider_id', user.id)
    .gte('scheduled_at', weekStart.toISOString())
    .lte('scheduled_at', weekEnd.toISOString())
    .in('status', ['pending_payment', 'confirmed'])
    .order('scheduled_at');

  if (error) throw error;

  type Booking = NonNullable<typeof bookings>[number];
  const todayKey = formatInZone(new Date(), tz, 'yyyy-MM-dd');
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const byDay = new Map<string, Booking[]>();
  bookings?.forEach((b) => {
    const key = formatInZone(b.scheduled_at, tz, 'yyyy-MM-dd');
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(b);
  });

  const bookedCount = bookings?.length ?? 0;
  const weekTotal = (bookings ?? []).reduce((sum, b) => sum + b.price_cents, 0);

  return (
    <div>
      <PageHeader
        title={t('calendar.title')}
        description={`${formatInZone(weekStart, tz, 'MMM d')} – ${formatInZone(
          addDays(weekStart, 6),
          tz,
          'MMM d'
        )}`}
        action={
          <div className="flex items-center gap-6">
            <div>
              <p className="font-display text-2xl font-medium leading-none text-ink">
                {bookedCount}
              </p>
              <p className="mt-1.5 text-xs text-ink-muted">
                {t('calendar.appointments', { count: bookedCount })}
              </p>
            </div>
            <div className="h-9 w-px bg-line" aria-hidden />
            <div>
              <p className="font-display text-2xl font-medium leading-none text-ink">
                {formatMoney(weekTotal)}
              </p>
              <p className="mt-1.5 text-xs text-ink-muted">{t('calendar.bookedValue')}</p>
            </div>
          </div>
        }
      />

      {/* Legend */}
      <div className="mt-6 flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-subtle">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-moss" /> {t('status.confirmed')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-clay" /> {t('status.awaitingDeposit')}
        </span>
      </div>

      {/* Desktop: seven-column week grid */}
      <div className="mt-4 hidden gap-3 md:grid md:grid-cols-7">
        {days.map((day) => {
          const key = formatInZone(day, tz, 'yyyy-MM-dd');
          const items = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          const isPast = key < todayKey;
          const dayTotal = items.reduce((sum, b) => sum + b.price_cents, 0);
          return (
            <div
              key={key}
              className={cn(
                'flex min-h-[200px] flex-col rounded-card border bg-paper p-3 shadow-soft transition-colors',
                isToday ? 'border-clay/40 ring-1 ring-gold/25' : 'border-line',
                isPast && !isToday && 'bg-paper/50'
              )}
            >
              <div className="flex items-center justify-between">
                <p
                  className={cn(
                    'text-[11px] font-semibold uppercase tracking-wider',
                    isToday ? 'text-clay-text' : isPast ? 'text-ink-subtle' : 'text-ink-muted'
                  )}
                >
                  {formatInZone(day, tz, 'EEE')}
                </p>
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full font-display text-sm font-medium leading-none',
                    isToday
                      ? 'bg-gradient-to-b from-gold-bright to-gold text-night shadow-glow-gold'
                      : isPast
                        ? 'text-ink-subtle'
                        : 'text-ink'
                  )}
                >
                  {formatInZone(day, tz, 'd')}
                </span>
              </div>

              <ul className="mt-2.5 flex flex-1 flex-col gap-1.5">
                {items.map((b) => (
                  <li
                    key={b.id}
                    className={cn(
                      'rounded-lg border-s-2 bg-cream/70 py-1.5 ps-2.5 pe-2',
                      b.status === 'confirmed' ? 'border-s-moss' : 'border-s-clay'
                    )}
                  >
                    <p className="font-mono text-[11px] font-medium tabular-nums text-ink">
                      {formatInZone(b.scheduled_at, tz, 'h:mm a')}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium text-ink">
                      {b.profiles?.full_name ?? b.guest_name}
                    </p>
                    <p className="truncate text-[11px] text-ink-muted">{b.services?.name}</p>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="flex flex-1 items-center justify-center pb-4 text-[11px] text-ink-subtle/60">
                    {isPast ? '' : t('calendar.open')}
                  </li>
                )}
              </ul>

              {items.length > 0 && (
                <p className="mt-2 border-t border-line pt-1.5 text-end font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
                  {formatMoney(dayTotal)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: compact agenda — one row per day, expanding only where there's
          something booked, so an empty week doesn't become a wall of tall cards. */}
      <div className="mt-4 space-y-2.5 md:hidden">
        {days.map((day) => {
          const key = formatInZone(day, tz, 'yyyy-MM-dd');
          const items = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          const isPast = key < todayKey;
          return (
            <div
              key={key}
              className={cn(
                'overflow-hidden rounded-card border bg-paper shadow-soft',
                isToday ? 'border-clay/40 ring-1 ring-gold/25' : 'border-line',
                isPast && !isToday && items.length === 0 && 'opacity-60'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-between gap-3 px-4 py-3',
                  items.length > 0 && 'border-b border-line'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-base font-medium leading-none',
                      isToday
                        ? 'bg-gradient-to-b from-gold-bright to-gold text-night shadow-glow-gold'
                        : 'bg-ink/[0.05] text-ink'
                    )}
                  >
                    {formatInZone(day, tz, 'd')}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{formatInZone(day, tz, 'EEEE')}</p>
                    <p className="text-xs text-ink-muted">
                      {formatInZone(day, tz, 'MMM d')}
                      {isToday ? ` · ${t('calendar.today')}` : ''}
                    </p>
                  </div>
                </div>
                {items.length > 0 ? (
                  <span className="rounded-full bg-ink/[0.05] px-2.5 py-0.5 text-xs font-medium text-ink-muted">
                    {items.length}
                  </span>
                ) : (
                  <span className="text-xs text-ink-subtle">{t('calendar.open')}</span>
                )}
              </div>

              {items.length > 0 && (
                <ul className="divide-y divide-line">
                  {items.map((b) => (
                    <li key={b.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span
                        aria-hidden
                        className={cn(
                          'h-2 w-2 shrink-0 rounded-full',
                          b.status === 'confirmed' ? 'bg-moss' : 'bg-clay'
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {b.profiles?.full_name ?? b.guest_name}
                        </p>
                        <p className="truncate text-xs text-ink-muted">{b.services?.name}</p>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="font-mono text-xs font-medium tabular-nums text-ink">
                          {formatInZone(b.scheduled_at, tz, 'h:mm a')}
                        </p>
                        <p className="text-xs text-ink-muted">{formatMoney(b.price_cents)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
