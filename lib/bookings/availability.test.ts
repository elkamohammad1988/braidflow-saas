import { describe, it, expect } from 'vitest';
import { TZDate } from '@date-fns/tz';
import { startOfDay } from 'date-fns';
import { computeSlotsForDay, type AvailabilityRule } from './availability';

const NY = 'America/New_York';

// Build the zoned day-start for a calendar date, the way the booking pages do.
function nyDayStart(dateIso: string) {
  return startOfDay(new TZDate(new Date(dateIso), NY));
}

// First slot for a 9:00am–5:00pm rule on the given date, returned as a UTC ISO
// string. day_of_week is derived from the date's *zoned* weekday so the test
// asserts wall-clock correctness without hard-coding weekdays.
function firstSlotUtc(dateIso: string): string | undefined {
  const day = nyDayStart(dateIso);
  const rules: AvailabilityRule[] = [
    { day_of_week: day.getDay(), start_minute: 9 * 60, end_minute: 17 * 60 }
  ];
  const slots = computeSlotsForDay(day, NY, 60, rules, [], []);
  return slots[0]?.start.toISOString();
}

describe('computeSlotsForDay — timezone correctness', () => {
  it('places the first 9:00am slot at 13:00 UTC during EDT (summer)', () => {
    // 2030-06-17 is in EDT (UTC-4): 9:00 local = 13:00Z.
    expect(firstSlotUtc('2030-06-17T12:00:00Z')).toBe('2030-06-17T13:00:00.000Z');
  });

  it('places the first 9:00am slot at 14:00 UTC during EST (winter) — DST aware', () => {
    // 2030-01-14 is in EST (UTC-5): 9:00 local = 14:00Z. The one-hour shift vs
    // summer proves the hours track the braider's wall clock across DST.
    expect(firstSlotUtc('2030-01-14T12:00:00Z')).toBe('2030-01-14T14:00:00.000Z');
  });

  it('uses the braider-zone weekday, so a rule only applies on its local day', () => {
    // 2030-06-17 (a Monday in NY). A rule for a different weekday yields nothing.
    const day = nyDayStart('2030-06-17T12:00:00Z');
    const wrongDow = (day.getDay() + 1) % 7;
    const rules: AvailabilityRule[] = [
      { day_of_week: wrongDow, start_minute: 9 * 60, end_minute: 17 * 60 }
    ];
    expect(computeSlotsForDay(day, NY, 60, rules, [], [])).toHaveLength(0);
  });

  it('respects a block override expressed as an absolute instant', () => {
    const day = nyDayStart('2030-06-17T12:00:00Z');
    const rules: AvailabilityRule[] = [
      { day_of_week: day.getDay(), start_minute: 9 * 60, end_minute: 17 * 60 }
    ];
    // Block 13:00–14:00Z (the 9:00am EDT slot). That opening should disappear.
    const blocked = computeSlotsForDay(
      day,
      NY,
      60,
      rules,
      [{ starts_at: '2030-06-17T13:00:00Z', ends_at: '2030-06-17T14:00:00Z', kind: 'block' }],
      []
    );
    expect(blocked.some((s) => s.start.toISOString() === '2030-06-17T13:00:00.000Z')).toBe(false);
    // A later opening still exists.
    expect(blocked.length).toBeGreaterThan(0);
  });

  it('treats an existing booking as a conflict and removes that slot', () => {
    const day = nyDayStart('2030-06-17T12:00:00Z');
    const rules: AvailabilityRule[] = [
      { day_of_week: day.getDay(), start_minute: 9 * 60, end_minute: 17 * 60 }
    ];
    const slots = computeSlotsForDay(
      day,
      NY,
      60,
      rules,
      [],
      [{ scheduled_at: '2030-06-17T13:00:00Z', duration_minutes: 60 }]
    );
    expect(slots.some((s) => s.start.toISOString() === '2030-06-17T13:00:00.000Z')).toBe(false);
  });
});
