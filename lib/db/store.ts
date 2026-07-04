// In-memory data store.
// -----------------------------------------------------------------------------
// Holds the demo dataset for the lifetime of a server instance. Mutations
// (create booking, edit service, save settings, …) persist within a warm
// instance; a cold start re-seeds from the deterministic fixture, so the app
// always returns to a known-good populated state. No database, no network.

import { seed, type Store } from './seed';

export type TableName = keyof Store;

let data: Store | null = null;

export function store(): Store {
  if (!data) data = seed();
  return data;
}

export function table(name: TableName): any[] {
  return store()[name];
}

// Replace a table's array wholesale (used by delete, which filters rows out).
export function setTable(name: TableName, rows: any[]): void {
  store()[name] = rows;
}
