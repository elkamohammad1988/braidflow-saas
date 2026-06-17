import { TZDate } from '@date-fns/tz';
import { format, isToday, isTomorrow } from 'date-fns';

// All appointment times are displayed in the BRAIDER's timezone — that's where
// the appointment physically happens — regardless of where the viewer is. These
// helpers take an absolute instant + the braider's IANA zone and render its wall
// clock in that zone.

function zoned(instant: Date | string, timeZone: string): TZDate {
  const d = instant instanceof Date ? instant : new Date(instant);
  return new TZDate(d, timeZone);
}

/** Format an absolute instant using a specific IANA zone's wall clock. */
export function formatInZone(instant: Date | string, timeZone: string, fmt: string): string {
  return format(zoned(instant, timeZone), fmt);
}

/** Short zone abbreviation for an instant, DST-aware (e.g. "EST", "PDT"). */
export function zoneAbbreviation(instant: Date | string, timeZone: string): string {
  const d = instant instanceof Date ? instant : new Date(instant);
  const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
    .formatToParts(d)
    .find((p) => p.type === 'timeZoneName');
  return part?.value ?? '';
}

export function relativeDayLabel(instant: Date | string, timeZone: string) {
  const d = zoned(instant, timeZone);
  // isToday/isTomorrow compare against "now" in the same (zoned) context.
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'EEE, MMM d');
}

export function formatAppointment(instant: Date | string, timeZone: string) {
  const d = zoned(instant, timeZone);
  return `${relativeDayLabel(instant, timeZone)} · ${format(d, 'h:mm a')} ${zoneAbbreviation(
    instant,
    timeZone
  )}`;
}
