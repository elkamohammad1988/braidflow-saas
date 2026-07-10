// Structured application logger.
// -----------------------------------------------------------------------------
// Emits ONE JSON object per line in production so log aggregators (Datadog, Loki,
// CloudWatch, Vercel log drains) can parse `level`/`scope`/fields and correlate a
// line to a booking, payment, or Sentry event. In development it prints a compact
// human-readable line instead. Never pass secrets or raw PII — pass ids, and run
// emails through `maskEmail`. Edge-safe (Web-standard APIs only).

type Level = 'info' | 'warn' | 'error';
type Fields = Record<string, unknown>;

function write(level: Level, line: string) {
  // eslint-disable-next-line no-console -- this module is the single sanctioned console sink
  const sink = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  sink(line);
}

function emit(level: Level, scope: string, message: string, fields?: Fields) {
  if (process.env.NODE_ENV === 'production') {
    write(level, JSON.stringify({ level, scope, msg: message, ts: new Date().toISOString(), ...fields }));
  } else {
    const suffix = fields && Object.keys(fields).length ? ' ' + JSON.stringify(fields) : '';
    write(level, `[${scope}] ${message}${suffix}`);
  }
}

export type Logger = {
  info: (message: string, fields?: Fields) => void;
  warn: (message: string, fields?: Fields) => void;
  error: (message: string, fields?: Fields) => void;
};

/** A logger bound to a `scope` (subsystem tag), e.g. `createLogger('stripe.webhook')`. */
export function createLogger(scope: string): Logger {
  return {
    info: (message, fields) => emit('info', scope, message, fields),
    warn: (message, fields) => emit('warn', scope, message, fields),
    error: (message, fields) => emit('error', scope, message, fields)
  };
}

/** Redact an email for logs: keep the first char + domain (e.g. `a***@example.com`). */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '<none>';
  const at = email.indexOf('@');
  if (at < 1) return '<redacted>';
  return `${email[0]}***${email.slice(at)}`;
}

/** Coerce an unknown thrown value into a stable, loggable shape (no PII, no stack noise). */
export function errorInfo(err: unknown): Fields {
  if (err instanceof Error) return { error: err.message, errorName: err.name };
  return { error: String(err) };
}
