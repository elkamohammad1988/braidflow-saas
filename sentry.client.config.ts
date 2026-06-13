// Sentry initialization for the browser. Loaded automatically by the Sentry
// webpack plugin. Only the public DSN is available client-side. Inert without it.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  // Session Replay is intentionally off — it adds bundle weight and captures
  // user sessions (a privacy consideration). Enable deliberately if you need it.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  debug: false
});
