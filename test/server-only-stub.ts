// Stub for the `server-only` package under vitest. The real package throws when
// imported outside a React Server Component bundle; in unit tests we just want a
// no-op so server-only modules (e.g. capability-token helpers) are importable.
export {};
