import { NextResponse, type NextRequest } from 'next/server';
import { readSessionToken } from '@/lib/auth/session-token';
import { SESSION_COOKIE } from '@/lib/auth/personas';

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

  if (requiresAuth && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // Only braiders belong in the dashboard.
  if (path.startsWith(BRAIDER_PREFIX) && session && session.role !== 'braider') {
    const url = request.nextUrl.clone();
    url.pathname = '/braiders';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|api/cron).*)']
};
