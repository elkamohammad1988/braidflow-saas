'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { captureException } from '@/lib/monitoring';

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { boundary: 'dashboard' });
  }, [error]);

  return (
    <div className="rounded-card border border-line bg-paper p-10 text-center shadow-soft">
      <h1 className="font-display text-2xl text-ink">We couldn&apos;t load this</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Something went wrong fetching your data. This is usually temporary.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ink-muted/70">Reference: {error.digest}</p>
      )}
      <Button className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
