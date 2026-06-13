// Core env vars without which the app cannot serve a single authenticated
// request. Validated once at runtime (from middleware) so a misconfigured deploy
// fails fast with a clear message instead of an opaque crash deep inside a
// Supabase call. Stripe / webhook / cron secrets are validated lazily by the
// code paths that need them.
const REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
] as const;

let checked = false;

export function assertRuntimeEnv() {
  if (checked) return;
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Copy .env.example to .env.local (or set them in your host) and fill them in.'
    );
  }
  checked = true;
}
