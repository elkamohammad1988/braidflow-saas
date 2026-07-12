'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  markBookingCompletedAction,
  markBookingNoShowAction
} from '@/lib/bookings/complete';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type Outcome = 'completed' | 'no_show';

// Shown on past, still-confirmed appointments so the braider can close them out.
// Marking `completed` is what makes the booking review-eligible for the client
// and counts it toward lifetime revenue; `no_show` records the missed visit.
export function FinalizeBookingButtons({ bookingId }: { bookingId: string }) {
  const t = useTranslations('bookingActions');
  const router = useRouter();
  const [confirming, setConfirming] = useState<Outcome | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  // Focus follows the interaction: into the confirm button on open, back to the
  // trigger on dismiss — so keyboard users aren't dropped to <body>.
  useEffect(() => {
    const isConfirming = confirming !== null;
    if (isConfirming && !wasConfirming.current) confirmRef.current?.focus();
    else if (!isConfirming && wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = isConfirming;
  }, [confirming]);

  function run(outcome: Outcome) {
    setError(null);
    startTransition(async () => {
      const result =
        outcome === 'completed'
          ? await markBookingCompletedAction(bookingId)
          : await markBookingNoShowAction(bookingId);
      if (result && 'error' in result) {
        // Stay in confirm mode so the announced error stays visible to retry.
        setError(result.error ?? t('genericError'));
        return;
      }
      router.refresh();
    });
  }

  if (confirming) {
    const isComplete = confirming === 'completed';
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="inline-flex items-center gap-3 text-sm">
          <span className="text-ink-muted">
            {isComplete ? t('markCompletedConfirm') : t('markNoShowConfirm')}
          </span>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => run(confirming)}
            disabled={pending}
            className={cn(
              'inline-flex items-center font-medium disabled:opacity-50',
              isComplete
                ? 'text-moss hover:text-moss/80'
                : 'text-red-700 hover:text-red-700 dark:text-red-400 dark:hover:text-red-400'
            )}
          >
            {pending && <Spinner className="me-1.5 h-3 w-3" />}
            {t('confirm')}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(null)}
            disabled={pending}
            className="text-ink-muted hover:text-ink disabled:opacity-50"
          >
            {t('back')}
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

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="inline-flex items-center gap-3 text-sm">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setConfirming('completed')}
          className="font-medium text-ink-muted hover:text-moss"
        >
          {t('markCompleted')}
        </button>
        <span aria-hidden className="text-ink/20">·</span>
        <button
          type="button"
          onClick={() => setConfirming('no_show')}
          className="font-medium text-ink-muted hover:text-red-700 dark:hover:text-red-400"
        >
          {t('noShow')}
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
