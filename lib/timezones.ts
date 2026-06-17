// Curated IANA timezones for the braider settings dropdown (US-first, plus a
// few common zones for diaspora braiders), and a runtime validator that accepts
// any real IANA zone the platform happens to receive.

export const DEFAULT_TIMEZONE = 'America/New_York';

export const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: 'America/New_York', label: 'Eastern Time — New York' },
  { value: 'America/Chicago', label: 'Central Time — Chicago' },
  { value: 'America/Denver', label: 'Mountain Time — Denver' },
  { value: 'America/Phoenix', label: 'Mountain (no DST) — Phoenix' },
  { value: 'America/Los_Angeles', label: 'Pacific Time — Los Angeles' },
  { value: 'America/Anchorage', label: 'Alaska Time — Anchorage' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time — Honolulu' },
  { value: 'America/Toronto', label: 'Eastern Time — Toronto' },
  { value: 'America/Vancouver', label: 'Pacific Time — Vancouver' },
  { value: 'Europe/London', label: 'London — GMT/BST' },
  { value: 'Europe/Paris', label: 'Central European — Paris' },
  { value: 'Africa/Lagos', label: 'West Africa — Lagos' },
  { value: 'Africa/Nairobi', label: 'East Africa — Nairobi' },
  { value: 'Africa/Johannesburg', label: 'South Africa — Johannesburg' }
];

/** True if `tz` is a real IANA zone the JS runtime understands. */
export function isValidTimeZone(tz: string | null | undefined): boolean {
  if (!tz) return false;
  try {
    // Throws RangeError for an unknown time zone.
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
