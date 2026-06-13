'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

const POLL_MS = 1500;
const TIMEOUT_MS = 30_000;

export function ConfirmationPoller({ bookingId: _id }: { bookingId: string }) {
  const router = useRouter();
  const startedAt = useRef(Date.now());
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - startedAt.current > TIMEOUT_MS) {
        clearInterval(interval);
        setTimedOut(true);
        return;
      }
      router.refresh();
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [router]);

  // Don't leave the customer on a silent spinner if the webhook is delayed —
  // their payment is safe, so tell them and give a way forward.
  if (timedOut) {
    return (
      <div className="mt-8 text-sm text-ink-muted">
        <p className="mx-auto max-w-xs">
          This is taking longer than usual. Your payment is safe — we&apos;ll email your
          confirmation as soon as it clears.
        </p>
        <Link
          href="/bookings"
          className="mt-4 inline-block font-medium text-ink hover:underline underline-offset-4"
        >
          Go to my bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 inline-flex items-center justify-center text-sm text-ink-muted">
      <Spinner className="mr-2" />
      Waiting on confirmation
    </div>
  );
}
