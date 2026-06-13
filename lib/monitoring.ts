import * as Sentry from '@sentry/nextjs';

// Single choke-point for reporting unexpected errors to our monitoring backend
// (Sentry). When no DSN is configured, Sentry.init runs with `enabled: false`
// (see sentry.*.config.ts), so every call here is a safe no-op that still emits
// a structured server/console log. Import this instead of @sentry/nextjs
// directly so the rest of the app stays decoupled from the SDK.

type Context = Record<string, unknown>;

export function captureException(error: unknown, context?: Context): void {
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

export function captureMessage(message: string, context?: Context): void {
  Sentry.captureMessage(message, context ? { extra: context } : undefined);
}
