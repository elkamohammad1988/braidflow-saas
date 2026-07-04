// Runtime environment checks.
// -----------------------------------------------------------------------------
// The app runs fully self-contained — local session auth plus an in-memory data
// layer — so it has no required backend environment variables and deploys with
// zero configuration. This hook is kept as the single place to assert any future
// required config (and is still called by the API routes); today it is a no-op.

export function assertRuntimeEnv(): void {
  // Nothing to validate: there is no external database or auth provider.
}
