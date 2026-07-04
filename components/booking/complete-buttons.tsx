'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [confirming, setConfirming] = useState<Outcome | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(outcome: Outcome) {
    setError(null);
    startTransition(async () => {
      const result =
        outcome === 'completed'
          ? await markBookingCompletedAction(bookingId)
          : await markBookingNoShowAction(bookingId);
      if (result && 'error' in result) {
        setError(result.error ?? 'Something went wrong.');
        setConfirming(null);
        return;
      }
      router.refresh();
    });
  }

  if (confirming) {
    const isComplete = confirming === 'completed';
    return (
      <div className="motion-safe:animate-fade-in-up flex flex-col items-end gap-1">
        <div className="inline-flex items-center gap-3 text-sm">
          <span className="text-ink-muted">
            {isComplete ? 'Mark as completed?' : 'Mark as a no-show?'}
          </span>
          <button
            type="button"
            onClick={() => run(confirming)}
            disabled={pending}
            className={cn(
              'inline-flex items-center font-medium disabled:opacity-50',
              isComplete
                ? 'text-moss hover:text-moss/80'
                : 'text-red-600 hover:text-red-700'
            )}
          >
            {pending && <Spinner className="mr-1.5 h-3 w-3" />}
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setConfirming(null)}
            disabled={pending}
            className="text-ink-muted hover:text-ink disabled:opacity-50"
          >
            Back
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

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="inline-flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => setConfirming('completed')}
          className="font-medium text-ink-muted hover:text-moss"
        >
          Mark completed
        </button>
        <span aria-hidden className="text-ink/20">·</span>
        <button
          type="button"
          onClick={() => setConfirming('no_show')}
          className="font-medium text-ink-muted hover:text-red-600"
        >
          No-show
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
