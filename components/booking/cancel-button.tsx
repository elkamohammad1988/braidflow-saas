'use client';

import { useTranslations } from 'next-intl';
import { cancelBookingAction } from '@/lib/bookings/cancel';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useConfirmAction } from './use-confirm-action';

type Props = {
  bookingId: string;
  label?: string;
  className?: string;
  // Guest capability token; passed through to authorize a guest's cancellation.
  token?: string;
};

export function CancelBookingButton({ bookingId, label, className, token }: Props) {
  const t = useTranslations('bookingActions');
  const { confirming, setConfirming, pending, error, run, triggerRef, confirmRef } =
    useConfirmAction<true>(() => cancelBookingAction(bookingId, token));

  if (confirming === null) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setConfirming(true)}
        className={cn(
          'inline-flex min-h-[44px] items-center text-sm font-medium text-ink-muted hover:text-danger',
          className
        )}
      >
        {label ?? t('cancel')}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm">
        <span className="text-ink-muted">{t('cancelConfirm')}</span>
        <button
          ref={confirmRef}
          type="button"
          onClick={() => run(true)}
          disabled={pending}
          className="inline-flex items-center font-medium text-danger hover:text-danger disabled:opacity-50"
        >
          {pending && <Spinner className="me-1.5 h-3 w-3" />}
          {t('yesCancel')}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(null)}
          disabled={pending}
          className="text-ink-muted hover:text-ink disabled:opacity-50"
        >
          {t('keepIt')}
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
