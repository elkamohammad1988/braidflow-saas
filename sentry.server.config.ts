// Sentry initialization for the Node.js server runtime (server components,
// route handlers, server actions, crons). Loaded by instrumentation.ts.
//
// With no DSN set, `enabled` is false and the SDK is a complete no-op — the app
// runs exactly as it did before Sentry was added. Configure the DSN in
// production to start receiving errors.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  // Performance tracing is sampled; default low so it's cheap. Override with
  // SENTRY_TRACES_SAMPLE_RATE.
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  // We log our own request/response detail; keep Sentry's logger quiet.
  debug: false
});
