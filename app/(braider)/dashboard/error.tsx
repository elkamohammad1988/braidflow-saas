'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { captureException } from '@/lib/monitoring';

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('dashboard');

  useEffect(() => {
    captureException(error, { boundary: 'dashboard' });
  }, [error]);

  return (
    <div className="rounded-card border border-line bg-paper p-10 text-center shadow-soft">
      <h1 className="font-display text-2xl text-ink">{t('error.title')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('error.description')}</p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ink-muted/70">
          {t('error.reference', { digest: error.digest })}
        </p>
      )}
      <Button className="mt-6" onClick={() => reset()}>
        {t('error.retry')}
      </Button>
    </div>
  );
}
