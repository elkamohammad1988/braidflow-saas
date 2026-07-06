import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, defaultLocale, normalizeLocale } from './config';

type Messages = Record<string, unknown>;

// Recursively overlay `override` on top of `base`, returning a new object.
// Objects are merged key-by-key; leaf values and arrays from `override` replace
// those in `base`. Neither input is mutated (so the cached English module stays
// pristine across requests).
function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const key of Object.keys(override)) {
    const b = out[key];
    const o = override[key];
    out[key] =
      b && o && typeof b === 'object' && typeof o === 'object' &&
      !Array.isArray(b) && !Array.isArray(o)
        ? deepMerge(b as Messages, o as Messages)
        : o;
  }
  return out;
}

async function load(locale: string): Promise<Messages> {
  return (await import(`../messages/${locale}.json`)).default as Messages;
}

// Resolves the active locale + messages for every server render. Preference
// order: the persisted cookie, else the browser's Accept-Language, else the
// default. Messages live in one JSON file per locale under /messages.
//
// English is the source of truth: for every other locale we deep-merge its
// file on top of English, so any key not yet translated falls back to the
// English copy instead of throwing MISSING_MESSAGE. Translations remain a
// safe, incremental add — a partial locale file never breaks a page.
export default getRequestConfig(async () => {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const locale = cookieLocale
    ? normalizeLocale(cookieLocale)
    : normalizeLocale(headers().get('accept-language')?.split(',')[0]);

  const messages =
    locale === defaultLocale
      ? await load(defaultLocale)
      : deepMerge(await load(defaultLocale), await load(locale));

  return {
    locale,
    messages,
    // Belt-and-suspenders: with English as a universal fallback base there
    // should be no missing keys, but never let a stray one crash a render or
    // flood the console — swallow MISSING_MESSAGE, surface anything else.
    onError(error) {
      if (error.code === 'MISSING_MESSAGE') return;
      console.error(error);
    },
    getMessageFallback({ key }) {
      return key;
    }
  };
});
