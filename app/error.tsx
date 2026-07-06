'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusScreen } from '@/components/shared/status-screen';
import { captureException } from '@/lib/monitoring';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    captureException(error, { boundary: 'app/error' });
  }, [error]);

  return (
    <StatusScreen
      code={t('boundary.code')}
      title={t('boundary.title')}
      description={t('boundary.description')}
      reference={error.digest ? t('reference', { digest: error.digest }) : undefined}
    >
      <Button size="lg" onClick={() => reset()}>
        {t('tryAgain')}
      </Button>
      <Link
        href="/"
        className="text-sm font-medium text-ink-muted transition-colors hover:text-clay"
      >
        {t('backToHome')}
      </Link>
    </StatusScreen>
  );
}
