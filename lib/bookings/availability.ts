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
// A slot must START far enough ahead to actually be bookable. Mirrors the
// server-side guard in create.ts/reschedule.ts (a start at/under `now + 60s` is
// rejected), so the picker never offers a slot the create action would refuse.
const MIN_LEAD_MS = 60_000;

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
      // Gate on the START, not the end: a slot whose start is already in the past
      // (or under the booking lead) must not be offered even if it hasn't finished.
      const tooSoon = +cursor <= now.getTime() + MIN_LEAD_MS;
      const overlaps = conflicts.some((c) => cursor < c.end && slotEnd > c.start);
      // Normalize to a plain Date so callers serialize a clean UTC instant.
      if (!tooSoon && !overlaps) slots.push({ start: new Date(+cursor), end: new Date(+slotEnd) });
      cursor = addMinutes(cursor, SLOT_GRANULARITY_MINUTES);
    }
  }

  // Overlapping weekly rules or an `open` override that overlaps working hours can
  // emit the same start twice; collapse to one slot per start instant.
  const unique = new Map<number, Slot>();
  for (const slot of slots) if (!unique.has(+slot.start)) unique.set(+slot.start, slot);
  return [...unique.values()].sort((a, b) => +a.start - +b.start);
}
