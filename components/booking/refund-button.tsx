'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
  label = 'Refund deposit',
  className
}: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await refundDepositAction(bookingId);
      if (result && 'error' in result) {
        setError(result.error);
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
          'text-sm font-medium text-ink-muted hover:text-ink',
          className
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="motion-safe:animate-fade-in-up flex flex-col items-end gap-1">
      <div className="inline-flex items-center gap-3 text-sm">
        <span className="text-ink-muted">
          Refund {formatMoney(depositCents)} to the client?
        </span>
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="inline-flex items-center font-medium text-ink hover:text-ink/80 disabled:opacity-50"
        >
          {pending && <Spinner className="mr-1.5 h-3 w-3" />}
          Yes, refund
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="text-ink-muted hover:text-ink disabled:opacity-50"
        >
          Keep it
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
