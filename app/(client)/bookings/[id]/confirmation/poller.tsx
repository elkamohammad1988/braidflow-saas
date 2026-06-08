'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

const POLL_MS = 1500;
const TIMEOUT_MS = 30_000;

export function ConfirmationPoller({ bookingId: _id }: { bookingId: string }) {
  const router = useRouter();
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - startedAt.current > TIMEOUT_MS) {
        clearInterval(interval);
        return;
      }
      router.refresh();
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="mt-8 inline-flex items-center justify-center text-sm text-ink-muted">
      <Spinner className="mr-2" />
      Waiting on confirmation
    </div>
  );
}
