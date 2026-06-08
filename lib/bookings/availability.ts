import { addMinutes, endOfDay, isBefore, startOfDay } from 'date-fns';

export type AvailabilityRule = {
  day_of_week: number;
  start_minute: number;
  end_minute: number;
};

export type AvailabilityOverride = {
  starts_at: string;
  ends_at: string;
  kind: 'block' | 'open';
};

export type ExistingBooking = {
  scheduled_at: string;
  duration_minutes: number;
};

export type Slot = { start: Date; end: Date };

const SLOT_GRANULARITY_MINUTES = 30;

export function computeSlotsForDay(
  date: Date,
  serviceDurationMinutes: number,
  rules: AvailabilityRule[],
  overrides: AvailabilityOverride[],
  bookings: ExistingBooking[]
): Slot[] {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const dow = date.getDay();

  const windows: Slot[] = rules
    .filter((r) => r.day_of_week === dow)
    .map((r) => ({
      start: addMinutes(dayStart, r.start_minute),
      end: addMinutes(dayStart, r.end_minute)
    }));

  for (const o of overrides) {
    const oStart = new Date(o.starts_at);
    const oEnd = new Date(o.ends_at);
    if (oEnd <= dayStart || oStart >= dayEnd) continue;
    if (o.kind === 'open') {
      windows.push({
        start: oStart < dayStart ? dayStart : oStart,
        end: oEnd > dayEnd ? dayEnd : oEnd
      });
    }
  }

  const blocks: Slot[] = overrides
    .filter((o) => o.kind === 'block')
    .map((o) => ({ start: new Date(o.starts_at), end: new Date(o.ends_at) }));

  const booked: Slot[] = bookings.map((b) => {
    const start = new Date(b.scheduled_at);
    return { start, end: addMinutes(start, b.duration_minutes) };
  });

  const conflicts = [...blocks, ...booked];
  const now = new Date();
  const slots: Slot[] = [];

  for (const window of windows) {
    let cursor = window.start;
    while (isBefore(addMinutes(cursor, serviceDurationMinutes), window.end) ||
           +addMinutes(cursor, serviceDurationMinutes) === +window.end) {
      const slotEnd = addMinutes(cursor, serviceDurationMinutes);
      const isPast = isBefore(slotEnd, now);
      const overlaps = conflicts.some((c) => cursor < c.end && slotEnd > c.start);
      if (!isPast && !overlaps) slots.push({ start: new Date(cursor), end: slotEnd });
      cursor = addMinutes(cursor, SLOT_GRANULARITY_MINUTES);
    }
  }

  return slots.sort((a, b) => +a.start - +b.start);
}
