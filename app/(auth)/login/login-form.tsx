'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next');
  const [pending, setPending] = useState(false);
  // Surface a failed email verification / expired recovery link — /auth/callback
  // redirects here with ?error=verification when it can't establish a session.
  const [error, setError] = useState<string | null>(
    search.get('error') === 'verification'
      ? 'That link is invalid or has expired. Try signing in, or reset your password.'
      : null
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get('email')),
      password: String(fd.get('password'))
    });
    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }
    router.push(next ?? '/');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input name="email" type="email" label="Email" autoComplete="email" required />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
      />
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-ink hover:underline underline-offset-4"
        >
          Forgot password?
        </Link>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
