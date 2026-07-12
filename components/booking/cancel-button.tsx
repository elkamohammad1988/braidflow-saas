'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  // Keyboard focus follows the interaction: into the destructive "Yes" button
  // when the confirm row opens, back to the trigger when it's dismissed —
  // otherwise focus silently falls to <body>.
  useEffect(() => {
    if (confirming && !wasConfirming.current) confirmRef.current?.focus();
    else if (!confirming && wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId, token);
      if (result && 'error' in result) {
        // Stay in confirm mode so the (announced) error stays visible to retry.
        setError(result.error ?? t('genericError'));
        return;
      }
      router.refresh();
    });
  }

  if (!confirming) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setConfirming(true)}
        className={cn(
          'text-sm font-medium text-ink-muted hover:text-red-700 dark:hover:text-red-400',
          className
        )}
      >
        {label ?? t('cancel')}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="inline-flex items-center gap-3 text-sm">
        <span className="text-ink-muted">{t('cancelConfirm')}</span>
        <button
          ref={confirmRef}
          type="button"
          onClick={run}
          disabled={pending}
          className="inline-flex items-center font-medium text-red-700 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-400"
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
        <p role="alert" className="text-xs text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
