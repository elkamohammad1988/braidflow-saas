'use client';

import { useTranslations } from 'next-intl';
import {
  markBookingCompletedAction,
  markBookingNoShowAction
} from '@/lib/bookings/complete';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useConfirmAction } from './use-confirm-action';

type Outcome = 'completed' | 'no_show';

// Shown on past, still-confirmed appointments so the braider can close them out.
// Marking `completed` is what makes the booking review-eligible for the client
// and counts it toward lifetime revenue; `no_show` records the missed visit.
export function FinalizeBookingButtons({ bookingId }: { bookingId: string }) {
  const t = useTranslations('bookingActions');
  const { confirming, setConfirming, pending, error, run, triggerRef, confirmRef } =
    useConfirmAction<Outcome>((outcome) =>
      outcome === 'completed'
        ? markBookingCompletedAction(bookingId)
        : markBookingNoShowAction(bookingId)
    );

  if (confirming !== null) {
    const isComplete = confirming === 'completed';
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm">
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
                : 'text-danger hover:text-danger'
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
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setConfirming('completed')}
          className="inline-flex min-h-[44px] items-center font-medium text-ink-muted hover:text-moss"
        >
          {t('markCompleted')}
        </button>
        <span aria-hidden className="text-ink/20">·</span>
        <button
          type="button"
          onClick={() => setConfirming('no_show')}
          className="inline-flex min-h-[44px] items-center font-medium text-ink-muted hover:text-danger"
        >
          {t('noShow')}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
