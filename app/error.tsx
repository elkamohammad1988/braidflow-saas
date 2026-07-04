'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusScreen } from '@/components/shared/status-screen';
import { captureException } from '@/lib/monitoring';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { boundary: 'app/error' });
  }, [error]);

  return (
    <StatusScreen
      code="Oops"
      title="Something snagged on our end."
      description="We've logged it. Try again in a moment — and if it keeps happening, send us a note."
      reference={error.digest ? `Reference: ${error.digest}` : undefined}
    >
      <Button size="lg" onClick={() => reset()}>
        Try again
      </Button>
      <Link
        href="/"
        className="text-sm font-medium text-ink-muted transition-colors hover:text-clay"
      >
        Back to home
      </Link>
    </StatusScreen>
  );
}
