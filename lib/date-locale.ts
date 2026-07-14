import { enUS, fr, ar, es, zhCN } from 'date-fns/locale';

// Maps a next-intl locale string to the matching date-fns `Locale` object, so
// date-fns `format` localizes month/weekday/AM-PM names while the format strings
// stay the same. Any unknown locale falls back to English.
const DATE_FNS_LOCALES: Record<string, typeof enUS> = {
  en: enUS,
  fr,
  ar,
  es,
  'zh-CN': zhCN
};

export function dateFnsLocale(locale: string): typeof enUS {
  return DATE_FNS_LOCALES[locale] ?? enUS;
}
