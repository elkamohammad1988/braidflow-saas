import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/db';
import { assertRuntimeEnv } from '@/lib/env';

const BRAIDER_PREFIX = '/dashboard';
const CLIENT_GATED = ['/bookings'];

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
  const requiresAuth =
    path.startsWith(BRAIDER_PREFIX) ||
    CLIENT_GATED.some((p) => path.startsWith(p)) ||
    path.includes('/book');

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
