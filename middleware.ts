import { NextResponse, type NextRequest } from 'next/server';
import { readSessionToken } from '@/lib/auth/session-token';
import { SESSION_COOKIE } from '@/lib/auth/personas';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, normalizeLocale } from '@/i18n/config';

const BRAIDER_PREFIX = '/dashboard';

// Route protection runs on the Edge from the signed session cookie alone — no
// backend call. The booking page (`/book`) and per-booking pages self-authorize
// (owner session OR guest token), so only the dashboard and the bookings LIST
// are gated here.
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isBookingsList = path === '/bookings' || path === '/bookings/';
  const requiresAuth = path.startsWith(BRAIDER_PREFIX) || isBookingsList;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await readSessionToken(token);

  let response: NextResponse;
  if (requiresAuth && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    response = NextResponse.redirect(url);
  } else if (path.startsWith(BRAIDER_PREFIX) && session && session.role !== 'braider') {
    // Only braiders belong in the dashboard.
    const url = request.nextUrl.clone();
    url.pathname = '/braiders';
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }

  // First-time visitors: remember the browser's language so the next render is
  // already localized. An explicit choice (existing cookie) is never overridden.
  if (!request.cookies.get(LOCALE_COOKIE)) {
    const detected = normalizeLocale(request.headers.get('accept-language')?.split(',')[0]);
    response.cookies.set(LOCALE_COOKIE, detected, {
      path: '/',
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: 'lax'
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|api/cron|api/health).*)']
};
