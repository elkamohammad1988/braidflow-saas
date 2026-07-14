import type { Metadata } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ForgotPasswordForm } from './forgot-password-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: t('forgotPasswordTitle'),
    robots: { index: false, follow: false }
  };
}

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{t('forgot.title')}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {t('forgot.subtitle')}
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-sm text-ink-muted">
        {t('forgot.remembered')}{' '}
        <Link href="/login" className="font-medium text-ink hover:underline underline-offset-4">
          {t('forgot.backToSignIn')}
        </Link>
      </p>
    </div>
  );
}
