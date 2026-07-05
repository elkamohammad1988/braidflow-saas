'use server';

import { cookies } from 'next/headers';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, normalizeLocale } from './config';

// Persist the visitor's language choice. The caller triggers a refresh so the
// server re-renders in the new locale (and flips `dir` for RTL).
export async function setLocale(locale: string) {
  cookies().set(LOCALE_COOKIE, normalizeLocale(locale), {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax'
  });
}
