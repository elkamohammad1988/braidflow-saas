import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Where Supabase redirects after a user clicks the email confirmation (or
// magic / recovery) link. Two link styles are supported so this works with the
// default Supabase email template (PKCE `code`) or a custom one that sends a
// `token_hash` + `type`. On success we establish the session cookie and land
// the user on the right home for their role.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const nextParam = url.searchParams.get('next');

  // Prefer the configured site URL so redirects stay correct behind a proxy.
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  // Only honour relative redirects — never an attacker-supplied absolute URL.
  const next = nextParam && nextParam.startsWith('/') ? nextParam : null;

  const supabase = supabaseServer();

  let verified = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    verified = !error;
  }

  if (!verified) {
    return NextResponse.redirect(`${origin}/login?error=verification`);
  }

  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // No explicit target — route by role.
  const { data: { user } } = await supabase.auth.getUser();
  let dest = '/';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    dest = profile?.role === 'braider' ? '/dashboard' : '/braiders';
  }
  return NextResponse.redirect(`${origin}${dest}`);
}
