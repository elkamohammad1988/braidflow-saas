// In-memory data store.
// -----------------------------------------------------------------------------
// Holds the demo dataset for the lifetime of a server instance. Mutations
// (create booking, edit service, save settings, …) persist within a warm
// instance; a cold start re-seeds from the deterministic fixture, so the app
// always returns to a known-good populated state. No database, no network.

import { seed, type Store } from './seed';
import type { TableName } from '@/types/db';

export type { TableName };
type StoredRow = Record<string, unknown>;

// Pin the store to globalThis so it's a single instance for the whole server
// process — not a per-route-bundle copy. Next.js can bundle this module into each
// route's server chunk separately; a plain module-level `let` would then give
// each route its OWN store, so a booking written by the create action wouldn't be
// visible to the pay/confirmation pages or the braider dashboard (reads of the
// deterministic seed still match, which is why that masked the bug). A cold start
// (fresh process / serverless instance) re-seeds from the deterministic fixture.
const globalRef = globalThis as typeof globalThis & { __braidflowStore?: Store };

export function store(): Store {
  if (!globalRef.__braidflowStore) globalRef.__braidflowStore = seed();
  return globalRef.__braidflowStore;
}

// The engine works on rows as untyped bags (it interprets column names at
// runtime). This is the single, deliberate seam between the fully-typed fixture
// store and the dynamic query engine — the same reference, just re-viewed as
// `Record<string, unknown>`. Feature code never touches this; it gets typed rows
// back through the query builder.
// One dynamic view of the whole store — the single, deliberate seam between the
// fully-typed fixture store and the query engine (which interprets column names
// at runtime). Same references, just re-viewed as `Record<string, unknown>`.
function dynamicStore(): Record<TableName, StoredRow[]> {
  return store() as unknown as Record<TableName, StoredRow[]>;
}

export function table(name: TableName): StoredRow[] {
  return dynamicStore()[name];
}

// Replace a table's array wholesale (used by delete, which filters rows out).
export function setTable(name: TableName, rows: StoredRow[]): void {
  dynamicStore()[name] = rows;
}

// Force a fresh seed. A cold start does this implicitly; the test suite calls it
// between cases to isolate mutations from one another.
export function resetStore(): void {
  globalRef.__braidflowStore = seed();
}
