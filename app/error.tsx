'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="font-display text-6xl text-clay md:text-7xl">Oops</p>
      <h1 className="mt-4 font-display text-3xl text-ink md:text-4xl">
        Something snagged on our end.
      </h1>
      <p className="mt-3 max-w-md text-ink-muted">
        We&apos;ve logged it. Try again in a moment — and if it keeps happening, send us a note.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ink-muted/70">Reference: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={() => reset()}>
          Try again
        </Button>
        <Link
          href="/"
          className="text-sm font-medium text-ink hover:underline underline-offset-4"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
