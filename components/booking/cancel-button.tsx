'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cancelBookingAction } from '@/lib/bookings/cancel';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type Props = {
  bookingId: string;
  label?: string;
  className?: string;
  // Guest capability token; passed through to authorize a guest's cancellation.
  token?: string;
};

export function CancelBookingButton({ bookingId, label, className, token }: Props) {
  const t = useTranslations('bookingActions');
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId, token);
      if (result && 'error' in result) {
        setError(result.error ?? t('genericError'));
        setConfirming(false);
        return;
      }
      router.refresh();
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={cn(
          'text-sm font-medium text-ink-muted hover:text-red-600',
          className
        )}
      >
        {label ?? t('cancel')}
      </button>
    );
  }

  return (
    <div className="motion-safe:animate-fade-in-up flex flex-col items-end gap-1">
      <div className="inline-flex items-center gap-3 text-sm">
        <span className="text-ink-muted">{t('cancelConfirm')}</span>
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="inline-flex items-center font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {pending && <Spinner className="me-1.5 h-3 w-3" />}
          {t('yesCancel')}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="text-ink-muted hover:text-ink disabled:opacity-50"
        >
          {t('keepIt')}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
