// Next.js instrumentation hook — runs once when the server boots, on each
// runtime. We use it to load the matching Sentry config so server- and
// edge-side errors are captured. The browser config is wired by the Sentry
// webpack plugin separately. Enabled via `experimental.instrumentationHook`.
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Fail fast on misconfiguration at boot rather than mid-request.
    const { assertRuntimeEnv } = await import('./lib/env');
    assertRuntimeEnv();
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Capture errors thrown inside route handlers, server actions, server
// components, and crons. Without this hook those server-side throws are NOT
// reported to Sentry (only client-boundary errors and explicit captureException
// calls are) — so a webhook or cron that silently fails would be invisible.
export const onRequestError = Sentry.captureRequestError;
