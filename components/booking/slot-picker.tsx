'use client';

import { useMemo, useState } from 'react';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Slot } from '@/lib/bookings/availability';

type Props = {
  slotsByDay: { date: Date; slots: Slot[] }[];
  selected?: Date;
  onSelect: (date: Date) => void;
};

export function SlotPicker({ slotsByDay, selected, onSelect }: Props) {
  const [activeDay, setActiveDay] = useState(slotsByDay[0]?.date ?? startOfDay(new Date()));

  const activeSlots = useMemo(
    () => slotsByDay.find((d) => isSameDay(d.date, activeDay))?.slots ?? [],
    [slotsByDay, activeDay]
  );

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {slotsByDay.map(({ date, slots }) => {
          const active = isSameDay(date, activeDay);
          const empty = slots.length === 0;
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setActiveDay(date)}
              disabled={empty}
              className={cn(
                'flex w-16 shrink-0 flex-col items-center rounded-xl border px-3 py-2 text-sm transition-colors',
                active ? 'border-ink bg-ink text-cream' : 'border-ink/10 bg-white hover:border-ink/25',
                empty && 'cursor-not-allowed opacity-40'
              )}
            >
              <span className="text-xs uppercase tracking-wider">{format(date, 'EEE')}</span>
              <span className="font-display text-lg leading-none">{format(date, 'd')}</span>
            </button>
          );
        })}
      </div>

      {activeSlots.length === 0 ? (
        <p
          key={activeDay.toISOString()}
          className="motion-safe:animate-fade-in rounded-card border border-dashed border-ink/10 bg-white/40 px-4 py-8 text-center text-sm text-ink-muted"
        >
          No openings on this day. Pick another date.
        </p>
      ) : (
        <div
          key={activeDay.toISOString()}
          className="motion-safe:animate-fade-in grid grid-cols-3 gap-2 sm:grid-cols-4"
        >
          {activeSlots.map((slot) => {
            const isSelected = selected && +selected === +slot.start;
            return (
              <button
                key={slot.start.toISOString()}
                type="button"
                onClick={() => onSelect(slot.start)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm transition-colors',
                  isSelected
                    ? 'border-ink bg-ink text-cream'
                    : 'border-ink/10 bg-white hover:border-ink/25'
                )}
              >
                {format(slot.start, 'h:mm a')}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function buildWeek(from: Date, days: number) {
  return Array.from({ length: days }, (_, i) => addDays(startOfDay(from), i));
}
