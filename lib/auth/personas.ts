// Local demo identities.
// -----------------------------------------------------------------------------
// The app ships as a self-contained product demo with no external auth provider.
// Sign-in accepts any credentials and maps the visitor onto one of two fixed
// personas whose data is seeded into the in-memory store (see lib/db/seed.ts).
// Because the ids are constants and the seed is deterministic, every persona's
// dashboard/bookings are always populated, even across serverless cold starts.

export const SESSION_COOKIE = 'bf_session';
// 30 days, in seconds.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type Role = 'braider' | 'client';

export type Persona = {
  id: string;
  email: string;
  role: Role;
  full_name: string;
};

// The braider persona owns the seeded studio ("Amara Braids") — services,
// availability, bookings, revenue and reviews all hang off this id.
export const BRAIDER_PERSONA: Persona = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'amara@braidflow.app',
  role: 'braider',
  full_name: 'Amara Johnson'
};

// The client persona has a couple of real bookings with the braider above, so
// the "my bookings" screens are populated too.
export const CLIENT_PERSONA: Persona = {
  id: '00000000-0000-4000-8000-000000000010',
  email: 'zoe@braidflow.app',
  role: 'client',
  full_name: 'Zoe Adams'
};

// Map a sign-in to a persona. Any credentials are accepted:
//   - an explicit role (from the signup toggle) wins;
//   - otherwise a known persona email maps to that persona;
//   - anything else defaults to the client experience.
export function resolveIdentity(email: string, roleHint?: Role): Persona {
  if (roleHint === 'braider') return BRAIDER_PERSONA;
  if (roleHint === 'client') return CLIENT_PERSONA;

  const normalized = email.trim().toLowerCase();
  if (normalized === BRAIDER_PERSONA.email) return BRAIDER_PERSONA;
  if (normalized === CLIENT_PERSONA.email) return CLIENT_PERSONA;
  return CLIENT_PERSONA;
}
