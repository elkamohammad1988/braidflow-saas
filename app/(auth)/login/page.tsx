import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false }
};

export default function LoginPage() {
  const t = useTranslations('auth');
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{t('login.title')}</h1>
      <p className="mt-1 text-sm text-ink-muted">{t('login.subtitle')}</p>
      <div className="mt-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-ink-muted">
        {t('login.newHere')}{' '}
        <Link href="/signup" className="font-medium text-ink hover:underline underline-offset-4">
          {t('login.createAccount')}
        </Link>
      </p>
    </div>
  );
}
