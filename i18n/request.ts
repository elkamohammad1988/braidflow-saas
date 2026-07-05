import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, normalizeLocale } from './config';

// Resolves the active locale + messages for every server render. Preference
// order: the persisted cookie, else the browser's Accept-Language, else the
// default. Messages live in one JSON file per locale under /messages.
export default getRequestConfig(async () => {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const locale = cookieLocale
    ? normalizeLocale(cookieLocale)
    : normalizeLocale(headers().get('accept-language')?.split(',')[0]);

  const messages = (await import(`../messages/${locale}.json`)).default;
  return { locale, messages };
});
