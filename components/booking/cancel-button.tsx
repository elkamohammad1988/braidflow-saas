'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cancelBookingAction } from '@/lib/bookings/cancel';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type Props = {
  bookingId: string;
  label?: string;
  className?: string;
};

export function CancelBookingButton({ bookingId, label = 'Cancel', className }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId);
      if (result && 'error' in result) {
        setError(result.error ?? 'Something went wrong.');
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
        {label}
      </button>
    );
  }

  return (
    <div className="motion-safe:animate-fade-in-up flex flex-col items-end gap-1">
      <div className="inline-flex items-center gap-3 text-sm">
        <span className="text-ink-muted">Cancel this booking?</span>
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="inline-flex items-center font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {pending && <Spinner className="mr-1.5 h-3 w-3" />}
          Yes, cancel
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
