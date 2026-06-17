import { TZDate } from '@date-fns/tz';
import {
  addMinutes,
  endOfDay,
  isBefore,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
  startOfDay
} from 'date-fns';

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

// Set a wall-clock minute-of-day on a zoned day-start. Done by setting the local
// time FIELDS (not adding absolute minutes) so the result is the correct instant
// even across a daylight-saving transition — e.g. "9:00am" is 9:00am local
// whether or not the clocks changed that day. minutes = 1440 rolls to the next
// day's midnight, which is the intended end-of-day boundary.
function atMinuteOfDay(dayStart: TZDate, minutes: number): TZDate {
  let d = setMilliseconds(dayStart, 0);
  d = setSeconds(d, 0);
  d = setHours(d, Math.floor(minutes / 60));
  d = setMinutes(d, minutes % 60);
  return d as TZDate;
}

// Compute bookable slots for one calendar day, interpreted in the braider's IANA
// timezone. `day` is any instant within the target day; the braider's weekly
// rules (minutes-of-day) are resolved against that day's wall clock in `timeZone`
// and returned as absolute UTC instants, so they render correctly for any viewer.
export function computeSlotsForDay(
  day: Date,
  timeZone: string,
  serviceDurationMinutes: number,
  rules: AvailabilityRule[],
  overrides: AvailabilityOverride[],
  bookings: ExistingBooking[]
): Slot[] {
  const dayStart = startOfDay(new TZDate(day, timeZone));
  const dayEnd = endOfDay(new TZDate(day, timeZone));
  const dow = dayStart.getDay(); // day-of-week as seen in the braider's zone

  const windows: Slot[] = rules
    .filter((r) => r.day_of_week === dow)
    .map((r) => ({
      start: atMinuteOfDay(dayStart, r.start_minute),
      end: atMinuteOfDay(dayStart, r.end_minute)
    }));

  // `open` overrides add availability; clamp them to this zoned day.
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
    while (
      isBefore(addMinutes(cursor, serviceDurationMinutes), window.end) ||
      +addMinutes(cursor, serviceDurationMinutes) === +window.end
    ) {
      const slotEnd = addMinutes(cursor, serviceDurationMinutes);
      const isPast = isBefore(slotEnd, now);
      const overlaps = conflicts.some((c) => cursor < c.end && slotEnd > c.start);
      // Normalize to a plain Date so callers serialize a clean UTC instant.
      if (!isPast && !overlaps) slots.push({ start: new Date(+cursor), end: new Date(+slotEnd) });
      cursor = addMinutes(cursor, SLOT_GRANULARITY_MINUTES);
    }
  }

  return slots.sort((a, b) => +a.start - +b.start);
}
