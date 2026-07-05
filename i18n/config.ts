// i18n configuration — cookie-driven locale (no URL locale segment), so the
// existing route tree is untouched. The active locale is resolved per request
// from the `NEXT_LOCALE` cookie (see i18n/request.ts), with browser-language
// detection for first-time visitors (see middleware.ts).

export const locales = ['en', 'ar', 'fr', 'es', 'zh-CN'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// Locales that render right-to-left. The document `dir` flips for these.
export const rtlLocales: readonly Locale[] = ['ar'];

// Native names for the language switcher (each in its own script).
export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  es: 'Español',
  'zh-CN': '简体中文'
};

export const LOCALE_COOKIE = 'NEXT_LOCALE';
// One year — the preference should stick.
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isRtl(locale: string): boolean {
  return (rtlLocales as readonly string[]).includes(locale);
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Coerce any incoming value (cookie, Accept-Language tag) to a supported locale.
 * Exact match wins; otherwise fall back to the primary subtag (e.g. `fr-CA` →
 * `fr`, `zh` → `zh-CN`); otherwise the default.
 */
export function normalizeLocale(input?: string | null): Locale {
  if (!input) return defaultLocale;
  const value = input.trim();
  if (isLocale(value)) return value;
  const base = value.split('-')[0]!.toLowerCase();
  const match = locales.find((l) => l === base || l.split('-')[0] === base);
  return match ?? defaultLocale;
}
