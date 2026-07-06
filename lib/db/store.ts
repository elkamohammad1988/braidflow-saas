// In-memory data store.
// -----------------------------------------------------------------------------
// Holds the demo dataset for the lifetime of a server instance. Mutations
// (create booking, edit service, save settings, …) persist within a warm
// instance; a cold start re-seeds from the deterministic fixture, so the app
// always returns to a known-good populated state. No database, no network.

import { seed, type Store } from './seed';

export type TableName = keyof Store;

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

export function table(name: TableName): any[] {
  return store()[name];
}

// Replace a table's array wholesale (used by delete, which filters rows out).
export function setTable(name: TableName, rows: any[]): void {
  store()[name] = rows;
}
