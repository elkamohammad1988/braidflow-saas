// Demo mode.
// -----------------------------------------------------------------------------
// This build ships as a self-contained product demo: local session auth and an
// in-memory dataset, no backend to configure. Demo mode is therefore always on
// and is used only to surface the "sample data" badge (see components/demo).

export function isDemoMode(): boolean {
  return true;
}
