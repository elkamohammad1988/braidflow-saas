'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { refundDepositAction } from '@/lib/bookings/refund';
import { Spinner } from '@/components/ui/spinner';
import { formatMoney, cn } from '@/lib/utils';

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
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  // Focus follows the interaction: into the confirm button on open, back to the
  // trigger on dismiss — so keyboard users aren't dropped to <body>.
  useEffect(() => {
    if (confirming && !wasConfirming.current) confirmRef.current?.focus();
    else if (!confirming && wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await refundDepositAction(bookingId);
      if (result && 'error' in result) {
        // Stay in confirm mode so the (announced) error stays visible to retry.
        setError(result.error);
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
          'text-sm font-medium text-ink-muted hover:text-ink',
          className
        )}
      >
        {label ?? t('refundDeposit')}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="inline-flex items-center gap-3 text-sm">
        <span className="text-ink-muted">
          {t('refundConfirm', { amount: formatMoney(depositCents) })}
        </span>
        <button
          ref={confirmRef}
          type="button"
          onClick={run}
          disabled={pending}
          className="inline-flex items-center font-medium text-ink hover:text-ink/80 disabled:opacity-50"
        >
          {pending && <Spinner className="me-1.5 h-3 w-3" />}
          {t('yesRefund')}
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
