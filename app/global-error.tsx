'use client';

import { useEffect } from 'react';
import { captureException } from '@/lib/monitoring';

// Last-resort boundary for errors thrown in the root layout itself, where the
// normal app/error.tsx can't render. It must provide its own <html>/<body>.
// Kept deliberately minimal (no design-system imports, which could also be the
// thing that failed) and reports to monitoring.
export default function GlobalError({
  error
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#f5eee3',
          color: '#231810',
          textAlign: 'center',
          padding: '0 1.5rem',
          margin: 0
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ marginTop: '0.5rem', color: '#6d5c4e', maxWidth: '28rem' }}>
          We&apos;ve been notified. Please refresh the page or try again in a moment.
        </p>
        <a
          href="/"
          style={{
            marginTop: '1.5rem',
            color: '#231810',
            textDecoration: 'underline',
            fontWeight: 500
          }}
        >
          Back to home
        </a>
      </body>
    </html>
  );
}
