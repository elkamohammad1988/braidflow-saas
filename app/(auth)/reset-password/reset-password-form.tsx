'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 'checking' — confirming the recovery session set by /auth/callback exists.
// 'ready'    — session present, the user may set a new password.
// 'invalid'  — no session (link expired, already used, or opened directly).
type SessionState = 'checking' | 'ready' | 'invalid';

export function ResetPasswordForm() {
  const router = useRouter();
  const [state, setState] = useState<SessionState>('checking');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // updateUser() requires the recovery session that /auth/callback established
  // from the email link. Confirm it's present before showing the form, and keep
  // listening in case the SDK finishes restoring it just after mount.
  useEffect(() => {
    const supabase = supabaseBrowser();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) setState(data.session ? 'ready' : 'invalid');
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setState('ready');
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const password = String(fd.get('password'));
    const confirm = String(fd.get('confirm'));
    if (password !== confirm) {
      setError('Those passwords don\'t match.');
      setPending(false);
      return;
    }

    const supabase = supabaseBrowser();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    // Password changed and the user is now signed in — route to their home.
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
    router.push(dest);
    router.refresh();
  }

  if (state === 'checking') {
    return <p className="text-sm text-ink-muted">Verifying your reset link…</p>;
  }

  if (state === 'invalid') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">
          This reset link is invalid or has expired. Reset links can only be used once and
          last about an hour.
        </p>
        <Link
          href="/forgot-password"
          className="font-medium text-ink hover:underline underline-offset-4"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        name="password"
        type="password"
        label="New password"
        autoComplete="new-password"
        minLength={8}
        required
        hint="At least 8 characters."
      />
      <Input
        name="confirm"
        type="password"
        label="Confirm new password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.9} />
        {pending ? 'Saving…' : 'Save new password'}
      </Button>
    </form>
  );
}
