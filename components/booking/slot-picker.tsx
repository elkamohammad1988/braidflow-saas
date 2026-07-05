'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatInZone, zoneAbbreviation } from '@/lib/format-date';
import type { Slot } from '@/lib/bookings/availability';

type Props = {
  slotsByDay: { date: Date; slots: Slot[] }[];
  selected?: Date;
  onSelect: (date: Date) => void;
  // The braider's IANA zone. Slots are absolute instants; all day/time labels and
  // the active-day comparison are resolved in this zone so a client in another
  // timezone sees the braider's actual local hours.
  timeZone: string;
};

export function SlotPicker({ slotsByDay, selected, onSelect, timeZone }: Props) {
  const dayKey = (d: Date) => formatInZone(d, timeZone, 'yyyy-MM-dd');

  const [activeKey, setActiveKey] = useState(
    slotsByDay[0] ? dayKey(slotsByDay[0].date) : ''
  );

  const activeDay = useMemo(
    () => slotsByDay.find((d) => dayKey(d.date) === activeKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slotsByDay, activeKey, timeZone]
  );
  const activeSlots = activeDay?.slots ?? [];

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1.5">
        {slotsByDay.map(({ date, slots }) => {
          const key = dayKey(date);
          const active = key === activeKey;
          const empty = slots.length === 0;
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setActiveKey(key)}
              disabled={empty}
              aria-pressed={active}
              className={cn(
                'flex w-[3.75rem] shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3 py-2.5 transition-all duration-200 ease-spring active:scale-[0.96]',
                active
                  ? 'border-transparent bg-gradient-to-br from-onyx-soft to-night text-ivory shadow-soft ring-1 ring-gold/25'
                  : 'border-line bg-paper text-ink hover:-translate-y-px hover:border-clay/30 hover:shadow-card',
                empty && 'cursor-not-allowed opacity-35 hover:translate-y-0 hover:border-line hover:shadow-none active:scale-100'
              )}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider opacity-80">
                {formatInZone(date, timeZone, 'EEE')}
              </span>
              <span className="font-display text-lg leading-none">
                {formatInZone(date, timeZone, 'd')}
              </span>
            </button>
          );
        })}
      </div>

      {activeDay && (
        <p className="mb-3 text-sm text-ink">
          <span className="font-medium">{formatInZone(activeDay.date, timeZone, 'EEEE, MMMM d')}</span>
          <span className="text-ink-subtle"> · {zoneAbbreviation(activeDay.date, timeZone)}</span>
        </p>
      )}

      {activeSlots.length === 0 ? (
        <div
          key={activeKey}
          className="motion-safe:animate-fade-in rounded-card border border-dashed border-line-strong bg-cream/40 px-4 py-10 text-center"
        >
          <p className="text-sm font-medium text-ink">No openings this day</p>
          <p className="mt-1 text-sm text-ink-muted">Try one of the other dates above.</p>
        </div>
      ) : (
        <div
          key={activeKey}
          className="motion-safe:animate-fade-in grid grid-cols-3 gap-2 sm:grid-cols-4"
        >
          {activeSlots.map((slot) => {
            const isSelected = selected && +selected === +slot.start;
            return (
              <button
                key={slot.start.toISOString()}
                type="button"
                onClick={() => onSelect(slot.start)}
                aria-pressed={Boolean(isSelected)}
                className={cn(
                  'rounded-lg border py-2.5 text-center text-sm font-medium tabular-nums transition-all duration-200 ease-spring active:scale-[0.96]',
                  isSelected
                    ? 'border-transparent bg-gradient-to-b from-gold-bright to-gold text-night shadow-glow-gold'
                    : 'border-line-strong bg-paper text-ink hover:-translate-y-px hover:border-clay/40 hover:bg-gold/[0.05] hover:shadow-card'
                )}
              >
                {formatInZone(slot.start, timeZone, 'h:mm a')}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
