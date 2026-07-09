'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { loginAction } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const search = useSearchParams();
  // Only honour a same-origin relative path — never an attacker-supplied absolute
  // or protocol-relative URL (open-redirect / phishing guard). Reject a leading
  // slash followed by another slash OR a backslash, since some browsers normalize
  // `/\evil.com` to `//evil.com`.
  const nextParam = search.get('next');
  const next = nextParam && /^\/(?![/\\])/.test(nextParam) ? nextParam : null;
  const [pending, setPending] = useState(false);
  // Surface a failed email verification / expired recovery link — /auth/callback
  // redirects here with ?error=verification when it can't establish a session.
  const [error, setError] = useState<string | null>(
    search.get('error') === 'verification'
      ? t('login.errors.verification')
      : null
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await loginAction({
      email: String(fd.get('email')),
      password: String(fd.get('password'))
    });
    if ('error' in result) {
      setError(result.error);
      setPending(false);
      return;
    }
    router.push(next ?? (result.role === 'braider' ? '/dashboard' : '/braiders'));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input name="email" type="email" label={t('login.form.email')} autoComplete="email" required />
      <Input
        name="password"
        type="password"
        label={t('login.form.password')}
        autoComplete="current-password"
        required
      />
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-ink hover:underline underline-offset-4"
        >
          {t('login.forgotPassword')}
        </Link>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t('login.signingIn') : t('login.signIn')}
      </Button>
    </form>
  );
}
