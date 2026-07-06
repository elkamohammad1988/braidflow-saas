import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = { title: 'Set a new password' };

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{t('reset.title')}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {t('reset.subtitle')}
      </p>
      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
