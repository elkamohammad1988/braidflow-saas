'use client';

import { useTranslations } from 'next-intl';
import { refundDepositAction } from '@/lib/bookings/refund';
import { Spinner } from '@/components/ui/spinner';
import { formatMoney, cn } from '@/lib/utils';
import { useConfirmAction } from './use-confirm-action';

type Props = {
  bookingId: string;
  depositCents: number;
  label?: string;
  className?: string;
};

export function RefundDepositButton({
  bookingId,
  depositCents,
  label,
  className
}: Props) {
  const t = useTranslations('bookingActions');
  const { confirming, setConfirming, pending, error, run, triggerRef, confirmRef } =
    useConfirmAction<true>(() => refundDepositAction(bookingId));

  if (confirming === null) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setConfirming(true)}
        className={cn(
          'inline-flex min-h-[44px] items-center text-sm font-medium text-ink-muted hover:text-ink',
          className
        )}
      >
        {label ?? t('refundDeposit')}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm">
        <span className="text-ink-muted">
          {t('refundConfirm', { amount: formatMoney(depositCents) })}
        </span>
        <button
          ref={confirmRef}
          type="button"
          onClick={() => run(true)}
          disabled={pending}
          className="inline-flex items-center font-medium text-ink hover:text-ink/80 disabled:opacity-50"
        >
          {pending && <Spinner className="me-1.5 h-3 w-3" />}
          {t('yesRefund')}
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
