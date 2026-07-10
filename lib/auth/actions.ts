'use server';

// Local authentication actions.
// -----------------------------------------------------------------------------
// Login, signup and logout run entirely inside the app: they validate input,
// mint a signed session token and set it as a secure, httpOnly cookie. No
// external provider, no fetch. Any credentials are accepted and mapped onto a
// seeded persona (see lib/auth/personas.ts).

import { cookies } from 'next/headers';
import { rateLimit, clientIpKey } from '@/lib/rate-limit';
import { createSessionToken } from './session-token';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  resolveIdentity,
  type Persona,
  type Role
} from './personas';

export type AuthResult = { ok: true; role: Role } | { error: string };

// Throttle credential submissions per client IP. Each one mints a signed session
// cookie, so an unthrottled loop is a session-spam / abuse vector — and this is
// the hook real password verification would slot into. Generous enough that a
// human correcting a typo never trips it. Mirrors requestPasswordReset's limit.
function throttleAuth(scope: 'login' | 'signup'): AuthResult | null {
  const limit = rateLimit(`auth:${scope}:${clientIpKey()}`, { limit: 10, windowMs: 5 * 60_000 });
  return limit.ok ? null : { error: 'Too many attempts. Please wait a moment and try again.' };
}

async function establishSession(persona: Persona, name: string): Promise<void> {
  const token = await createSessionToken(
    { sub: persona.id, email: persona.email, role: persona.role, name },
    SESSION_MAX_AGE
  );
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE
  });
}

export async function loginAction(input: { email: string; password: string }): Promise<AuthResult> {
  const throttled = throttleAuth('login');
  if (throttled) return throttled;

  const email = (input.email ?? '').trim();
  const password = input.password ?? '';
  if (!email || !password) {
    return { error: 'Enter your email and password.' };
  }
  const persona = resolveIdentity(email);
  await establishSession(persona, persona.full_name);
  return { ok: true, role: persona.role };
}

export async function signupAction(input: {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}): Promise<AuthResult> {
  const throttled = throttleAuth('signup');
  if (throttled) return throttled;

  const email = (input.email ?? '').trim();
  const password = input.password ?? '';
  const fullName = (input.fullName ?? '').trim();
  if (!email || !password || !fullName) {
    return { error: 'Fill in your name, email and a password.' };
  }
  if (password.length < 8) {
    return { error: 'Use at least 8 characters for your password.' };
  }
  const persona = resolveIdentity(email, input.role);
  // Keep the typed name for a personal greeting; data still hangs off the persona.
  await establishSession(persona, fullName || persona.full_name);
  return { ok: true, role: persona.role };
}

export async function logoutAction(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
}
