'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { captureException } from '@/lib/monitoring';

export default function ClientError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    captureException(error, { boundary: 'client' });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl text-ink">{t('client.title')}</h1>
      <p className="mt-3 text-sm text-ink-muted">
        {t('client.description')}
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ink-muted/70">{t('reference', { digest: error.digest })}</p>
      )}
      <div className="mt-6 flex items-center gap-4">
        <Button onClick={() => reset()}>{t('tryAgain')}</Button>
        <Link href="/" className="text-sm font-medium text-ink hover:underline underline-offset-4">
          {t('home')}
        </Link>
      </div>
    </div>
  );
}
