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

// A *fresh* braider studio — seeded with an empty braider row and nothing else
// (no services, hours, bookings or Stripe). Braider sign-ups land here so a
// visitor can experience the real first-run: the activation checklist, the
// Connect-Stripe prompt and every empty state — the exact journey the populated
// Amara persona can't show. Its data is seeded (deterministic) so the empty
// studio is the same on every cold start.
export const NEW_BRAIDER_PERSONA: Persona = {
  id: '00000000-0000-4000-8000-000000000005',
  email: 'newstudio@braidflow.app',
  role: 'braider',
  full_name: 'Your Studio'
};

export const PERSONAS: Persona[] = [BRAIDER_PERSONA, CLIENT_PERSONA, NEW_BRAIDER_PERSONA];

// Map a sign-in to a persona. Any credentials are accepted:
//   - a known persona email always maps to that persona (so the documented
//     amara@braidflow.app login lands in the busy studio);
//   - otherwise the signup role toggle decides: a braider gets a fresh, empty
//     studio to onboard; a client gets the populated client experience.
export function resolveIdentity(email: string, roleHint?: Role): Persona {
  const normalized = email.trim().toLowerCase();
  const known = PERSONAS.find((p) => p.email === normalized);
  if (known) return known;

  if (roleHint === 'braider') return NEW_BRAIDER_PERSONA;
  if (roleHint === 'client') return CLIENT_PERSONA;
  return CLIENT_PERSONA;
}
