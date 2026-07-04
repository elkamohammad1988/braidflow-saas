// Local data client.
// -----------------------------------------------------------------------------
// Returns the in-memory query builder off `.from(table)` plus a small `.auth`
// adapter that reads the signed session cookie. `db()` and `dbAdmin()` are
// identical here — there is no row-level security to distinguish them — but both
// names are kept so read paths and privileged writes stay legible at the call site.

import { getSession } from '@/lib/auth/session';
import { store } from './store';
import { QueryBuilder } from './query';
import type { TableName } from './store';
import { BRAIDER_PERSONA, CLIENT_PERSONA } from '@/lib/auth/personas';

function emailForUser(id: string): string | null {
  const persona = [BRAIDER_PERSONA, CLIENT_PERSONA].find((p) => p.id === id);
  if (persona) return persona.email;
  const profile = store().profiles.find((p) => p.id === id);
  return profile?.email ?? null;
}

function makeClient() {
  return {
    from(tableName: TableName) {
      return new QueryBuilder(tableName);
    },
    auth: {
      async getUser() {
        const session = await getSession();
        return {
          data: { user: session ? { id: session.user.id, email: session.user.email } : null },
          error: null
        };
      },
      admin: {
        async getUserById(id: string) {
          const email = emailForUser(id);
          return { data: { user: email ? { id, email } : null }, error: null };
        }
      }
    }
  };
}

export function db() {
  return makeClient();
}

export function dbAdmin() {
  return makeClient();
}
