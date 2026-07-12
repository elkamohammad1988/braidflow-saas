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
          fontFamily: 'Inter, system-ui, sans-serif',
          background:
            'radial-gradient(60% 60% at 50% 0%, rgba(139,92,246,0.22), transparent 70%), #07030F',
          color: '#FFFFFF',
          textAlign: 'center',
          padding: '0 1.5rem',
          margin: 0
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
          Something went wrong
        </h1>
        <p style={{ marginTop: '0.5rem', color: '#B7B0C8', maxWidth: '28rem', lineHeight: 1.6 }}>
          We&apos;ve been notified. Please refresh the page or try again in a moment.
        </p>
        <a
          href="/"
          style={{
            marginTop: '1.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '999px',
            background: 'linear-gradient(180deg, #8B5CF6, #7C3AED)',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontWeight: 600,
            boxShadow: '0 8px 24px -8px rgba(139,92,246,0.6)'
          }}
        >
          Back to home
        </a>
      </body>
    </html>
  );
}
