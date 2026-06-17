import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/db';
import { assertRuntimeEnv } from '@/lib/env';

const BRAIDER_PREFIX = '/dashboard';

export async function updateSession(request: NextRequest) {
  // Fail fast on a misconfigured deploy rather than crashing opaquely below.
  assertRuntimeEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // The booking page (`/book`) is public — guests must be able to book without an
  // account. The `/bookings` LIST is owner-only, but the per-booking pages
  // (`/bookings/<id>/pay|confirmation|reschedule`) self-authorize via the owner's
  // session OR a guest capability token, so they're not gated here.
  const isBookingsList = path === '/bookings' || path === '/bookings/';
  const requiresAuth = path.startsWith(BRAIDER_PREFIX) || isBookingsList;

  if (requiresAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  if (path.startsWith(BRAIDER_PREFIX) && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.role !== 'braider') {
      const url = request.nextUrl.clone();
      url.pathname = '/braiders';
      return NextResponse.redirect(url);
    }
  }

  return response;
}
