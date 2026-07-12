'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/spinner';

const POLL_MS = 1500;
const TIMEOUT_MS = 30_000;

export function ConfirmationPoller({
  fallbackHref = '/bookings',
  fallbackLabel = 'Go to my bookings'
}: {
  // Where to send the customer if confirmation is slow. Guests have no /bookings
  // list, so they get a link back to the braider instead.
  fallbackHref?: string;
  fallbackLabel?: string;
}) {
  const t = useTranslations('confirmation');
  const router = useRouter();
  const startedAt = useRef(Date.now());
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - startedAt.current > TIMEOUT_MS) {
        clearInterval(interval);
        setTimedOut(true);
        return;
      }
      router.refresh();
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [router]);

  // Don't leave the customer on a silent spinner if the webhook is delayed —
  // their payment is safe, so tell them and give a way forward.
  if (timedOut) {
    return (
      <div role="status" className="mt-6 text-sm text-ink-muted">
        <p className="mx-auto max-w-xs">
          {t('pollerTimeout')}
        </p>
        <Link
          href={fallbackHref}
          className="mt-4 inline-block font-medium text-ink hover:underline underline-offset-4"
        >
          {fallbackLabel}
        </Link>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="mt-6 inline-flex items-center justify-center text-sm text-ink-muted"
    >
      <Spinner className="me-2" />
      {t('waitingConfirmation')}
    </div>
  );
}
