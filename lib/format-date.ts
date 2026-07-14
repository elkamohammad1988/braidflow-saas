import { TZDate } from '@date-fns/tz';
import { format, isToday, isTomorrow } from 'date-fns';
import { dateFnsLocale } from './date-locale';

// All appointment times are displayed in the BRAIDER's timezone — that's where
// the appointment physically happens — regardless of where the viewer is. These
// helpers take an absolute instant + the braider's IANA zone and render its wall
// clock in that zone.

function zoned(instant: Date | string, timeZone: string): TZDate {
  const d = instant instanceof Date ? instant : new Date(instant);
  return new TZDate(d, timeZone);
}

/** Format an absolute instant using a specific IANA zone's wall clock. */
export function formatInZone(
  instant: Date | string,
  timeZone: string,
  fmt: string,
  locale: string
): string {
  return format(zoned(instant, timeZone), fmt, { locale: dateFnsLocale(locale) });
}

/** Short zone abbreviation for an instant, DST-aware (e.g. "EST", "PDT"). */
export function zoneAbbreviation(instant: Date | string, timeZone: string): string {
  const d = instant instanceof Date ? instant : new Date(instant);
  const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
    .formatToParts(d)
    .find((p) => p.type === 'timeZoneName');
  return part?.value ?? '';
}

// The literal 'Today'/'Tomorrow' words these helpers emit are the only strings
// not covered by date-fns, so they're translated here (rather than via a message
// file). Any unknown locale falls back to English.
const RELATIVE_DAY_LABELS: Record<string, { today: string; tomorrow: string }> = {
  en: { today: 'Today', tomorrow: 'Tomorrow' },
  fr: { today: "Aujourd'hui", tomorrow: 'Demain' },
  ar: { today: 'اليوم', tomorrow: 'غدًا' },
  es: { today: 'Hoy', tomorrow: 'Mañana' },
  'zh-CN': { today: '今天', tomorrow: '明天' }
};

export function relativeDayLabel(instant: Date | string, timeZone: string, locale: string) {
  const d = zoned(instant, timeZone);
  const labels = RELATIVE_DAY_LABELS[locale] ?? { today: 'Today', tomorrow: 'Tomorrow' };
  // isToday/isTomorrow compare against "now" in the same (zoned) context.
  if (isToday(d)) return labels.today;
  if (isTomorrow(d)) return labels.tomorrow;
  return format(d, 'EEE, MMM d', { locale: dateFnsLocale(locale) });
}

export function formatAppointment(instant: Date | string, timeZone: string, locale: string) {
  const d = zoned(instant, timeZone);
  return `${relativeDayLabel(instant, timeZone, locale)} · ${format(d, 'h:mm a', {
    locale: dateFnsLocale(locale)
  })} ${zoneAbbreviation(instant, timeZone)}`;
}
