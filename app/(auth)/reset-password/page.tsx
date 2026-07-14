import type { Metadata } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { KeyRound } from 'lucide-react';
import { GlassIcon } from '@/components/ui/glass-icon';
import { isEmailConfigured } from '@/lib/email/config';
import { ResetPasswordForm } from './reset-password-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: t('resetPasswordTitle'),
    robots: { index: false, follow: false }
  };
}

export default function ResetPasswordPage() {
  const t = useTranslations('auth');

  // In the self-contained demo no reset link is ever emailed, so offering to
  // "set a new password" here would be theater. Say so plainly. When an email
  // provider is configured, render the real form.
  if (!isEmailConfigured()) {
    return (
      <div>
        <h1 className="font-display text-3xl text-ink">{t('reset.title')}</h1>
        <div className="mt-6 space-y-4">
          <GlassIcon icon={KeyRound} tone="accent" size="lg" />
          <p className="text-sm text-ink-muted">{t('reset.demo.body')}</p>
          <Link
            href="/login"
            className="inline-flex text-sm font-medium text-ink hover:underline underline-offset-4"
          >
            {t('forgot.backToSignIn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{t('reset.title')}</h1>
      <p className="mt-1 text-sm text-ink-muted">{t('reset.subtitle')}</p>
      <div className="mt-6">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
