// Relationship registry for the in-memory query layer.
// -----------------------------------------------------------------------------
// PostgREST resolves embedded resources (e.g. `bookings.select('services(name)')`)
// from foreign keys. We don't have a database, so this table encodes the same
// relationships the app relies on. Keyed by parent table, then by the embed's
// base relation name (the token before any `!fk` hint or `alias:` prefix).

export type Cardinality = 'one' | 'many';

export type Relationship = {
  target: string;
  card: Cardinality;
  // Column on the parent row and column on the target row that must be equal.
  localKey: string;
  targetKey: string;
};

export const RELATIONSHIPS: Record<string, Record<string, Relationship>> = {
  bookings: {
    services: { target: 'services', card: 'one', localKey: 'service_id', targetKey: 'id' },
    // `profiles!bookings_client_id_fkey` — the client who made the booking.
    profiles: { target: 'profiles', card: 'one', localKey: 'client_id', targetKey: 'id' },
    braiders: { target: 'braiders', card: 'one', localKey: 'braider_id', targetKey: 'id' },
    payments: { target: 'payments', card: 'many', localKey: 'id', targetKey: 'booking_id' }
  },
  braiders: {
    services: { target: 'services', card: 'many', localKey: 'id', targetKey: 'braider_id' },
    availability_rules: {
      target: 'availability_rules',
      card: 'many',
      localKey: 'id',
      targetKey: 'braider_id'
    },
    availability_overrides: {
      target: 'availability_overrides',
      card: 'many',
      localKey: 'id',
      targetKey: 'braider_id'
    },
    // `profiles!braiders_id_fkey` — the braider's own profile (shared id).
    profiles: { target: 'profiles', card: 'one', localKey: 'id', targetKey: 'id' }
  },
  reviews: {
    profiles: { target: 'profiles', card: 'one', localKey: 'client_id', targetKey: 'id' },
    braiders: { target: 'braiders', card: 'one', localKey: 'braider_id', targetKey: 'id' }
  },
  payments: {
    bookings: { target: 'bookings', card: 'one', localKey: 'booking_id', targetKey: 'id' }
  }
};

export function findRelationship(parentTable: string, base: string): Relationship | undefined {
  return RELATIONSHIPS[parentTable]?.[base];
}
