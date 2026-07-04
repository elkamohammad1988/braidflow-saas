import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { readSessionToken } from './session-token';
import { SESSION_COOKIE } from './personas';

// The session is derived entirely from the signed cookie — no database lookup —
// so it survives serverless cold starts and never makes a network call. The
// shape is `{ user, profile }`, matching what server components and actions read.
export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const payload = await readSessionToken(token);
  if (!payload) return null;
  return {
    user: { id: payload.sub, email: payload.email },
    profile: { id: payload.sub, role: payload.role, full_name: payload.name }
  };
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireBraider() {
  const session = await requireSession();
  if (session.profile.role !== 'braider') redirect('/braiders');
  return session;
}
