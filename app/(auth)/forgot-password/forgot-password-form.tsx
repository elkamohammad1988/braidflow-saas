'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MailCheck, KeyRound } from 'lucide-react';
import { requestPasswordReset } from '@/lib/auth/password-reset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassIcon } from '@/components/ui/glass-icon';

type Sent = { delivery: 'email' | 'demo'; email: string };

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once the request succeeds. `delivery` decides which screen shows: a
  // generic "check your inbox" when an email provider is configured, or an
  // honest "reset isn't part of the demo" note otherwise — never a fake inbox.
  const [sent, setSent] = useState<Sent | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email'));
    const res = await requestPasswordReset(email);
    if (!res.ok) {
      setError(res.error);
      setPending(false);
      return;
    }
    setSent({ delivery: res.delivery, email });
    setPending(false);
  }

  if (sent?.delivery === 'demo') {
    return (
      <div className="space-y-4" role="status">
        <GlassIcon icon={KeyRound} tone="accent" size="lg" />
        <div>
          <h2 className="font-display text-xl text-ink">{t('forgot.demo.title')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('forgot.demo.body')}</p>
        </div>
        <Link
          href="/login"
          className="inline-flex text-sm font-medium text-ink hover:underline underline-offset-4"
        >
          {t('forgot.backToSignIn')}
        </Link>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="space-y-4" role="status">
        <GlassIcon icon={MailCheck} tone="success" size="lg" />
        <div>
          <h2 className="font-display text-xl text-ink">{t('forgot.sent.title')}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {t.rich('forgot.sent.body', {
              address: sent.email,
              email: (chunks) => <span className="font-medium text-ink">{chunks}</span>
            })}
          </p>
        </div>
        <p className="text-sm text-ink-muted">
          {t.rich('forgot.sent.retry', {
            retry: (chunks) => (
              <button
                type="button"
                onClick={() => {
                  setSent(null);
                  setError(null);
                }}
                className="font-medium text-ink hover:underline underline-offset-4"
              >
                {chunks}
              </button>
            )
          })}
        </p>
        <p className="text-sm text-ink-muted">
          <Link href="/login" className="font-medium text-ink hover:underline underline-offset-4">
            {t('forgot.backToSignIn')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-busy={pending} className="space-y-4">
      {/* Announce the in-flight submit to screen readers — the disabled button
          drops focus and the label swap lives in no live region. */}
      <span role="status" className="sr-only">
        {pending ? t('forgot.sendingLink') : ''}
      </span>
      <Input name="email" type="email" label={t('forgot.form.email')} autoComplete="email" required />
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t('forgot.sendingLink') : t('forgot.sendResetLink')}
      </Button>
    </form>
  );
}
