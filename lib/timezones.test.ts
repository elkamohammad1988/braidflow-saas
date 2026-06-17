import { describe, it, expect } from 'vitest';
import { isValidTimeZone, COMMON_TIMEZONES, DEFAULT_TIMEZONE } from './timezones';

describe('isValidTimeZone', () => {
  it('accepts real IANA zones', () => {
    expect(isValidTimeZone('America/New_York')).toBe(true);
    expect(isValidTimeZone('Europe/London')).toBe(true);
    expect(isValidTimeZone('Africa/Lagos')).toBe(true);
  });

  it('rejects nonsense and empty values', () => {
    expect(isValidTimeZone('Mars/Phobos')).toBe(false);
    expect(isValidTimeZone('Not A Zone')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
    expect(isValidTimeZone(null)).toBe(false);
    expect(isValidTimeZone(undefined)).toBe(false);
  });

  it('every curated dropdown option is a valid zone', () => {
    for (const tz of COMMON_TIMEZONES) {
      expect(isValidTimeZone(tz.value), tz.value).toBe(true);
    }
  });

  it('the default zone is valid', () => {
    expect(isValidTimeZone(DEFAULT_TIMEZONE)).toBe(true);
  });
});
