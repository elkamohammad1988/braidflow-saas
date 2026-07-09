import type { Metadata } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SignupForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Create your account',
  robots: { index: false, follow: false }
};

type SearchParams = { role?: string };

export default function SignupPage({ searchParams }: { searchParams: SearchParams }) {
  const t = useTranslations('auth');
  const role = searchParams.role === 'braider' ? 'braider' : 'client';

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">
        {role === 'braider' ? t('signup.title.braider') : t('signup.title.client')}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {role === 'braider'
          ? t('signup.subtitle.braider')
          : t('signup.subtitle.client')}
      </p>
      <div className="mt-6">
        <SignupForm defaultRole={role} />
      </div>
      <p className="mt-6 text-sm text-ink-muted">
        {t('signup.haveAccount')}{' '}
        <Link href="/login" className="font-medium text-ink hover:underline underline-offset-4">
          {t('signup.signIn')}
        </Link>
      </p>
    </div>
  );
}
