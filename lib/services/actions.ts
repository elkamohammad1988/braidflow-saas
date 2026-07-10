'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/server';
import { getSession } from '@/lib/auth/session';
import { serviceSchema, type ServiceInput } from './validation';

// Enforce the braider ROLE in the action, not just authentication — and not only
// in middleware. A server action can be POSTed to any (unprotected) route by its
// id, so the `/dashboard` middleware guard is not a substitute for checking here.
// Without the role check a client-role session could write services under its own
// id (see the sibling check in lib/braider/actions.ts).
async function requireBraiderId() {
  const session = await getSession();
  if (!session) throw new Error('Not signed in');
  if (session.profile.role !== 'braider') throw new Error('Not authorized');
  return { database: db(), userId: session.user.id };
}

// A service change moves the public profile's service list + "from" price, the
// directory card's starting price, and the dashboard activation/service count —
// not just the services editor. Bust all of them (mirrors lib/braider/actions.ts).
async function revalidateServiceSurfaces(database: ReturnType<typeof db>, userId: string) {
  revalidatePath('/dashboard/services');
  revalidatePath('/dashboard');
  revalidatePath('/braiders');
  const { data: braider } = await database
    .from('braiders')
    .select('slug')
    .eq('id', userId)
    .maybeSingle();
  if (braider?.slug) revalidatePath(`/braiders/${braider.slug}`);
}

export async function createServiceAction(input: ServiceInput) {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { database, userId } = await requireBraiderId();
  const { error } = await database.from('services').insert({
    braider_id: userId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    duration_minutes: parsed.data.durationMinutes,
    price_cents: parsed.data.priceCents,
    deposit_cents: parsed.data.depositCents,
    is_active: parsed.data.isActive
  });

  if (error) return { error: 'Could not save that service.' };

  await revalidateServiceSurfaces(database, userId);
  redirect('/dashboard/services');
}

export async function updateServiceAction(id: string, input: ServiceInput) {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { database, userId } = await requireBraiderId();
  const { data: updated, error } = await database
    .from('services')
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      duration_minutes: parsed.data.durationMinutes,
      price_cents: parsed.data.priceCents,
      deposit_cents: parsed.data.depositCents,
      is_active: parsed.data.isActive
    })
    .eq('id', id)
    .eq('braider_id', userId)
    .select('id');

  if (error) return { error: 'Could not update that service.' };
  // A 0-row update isn't an error in SQL (or the in-memory store), so a wrong-id
  // or wrong-owner edit would otherwise report false success. Verify a row
  // actually matched before claiming the change stuck.
  if (!updated || updated.length === 0) {
    return { error: 'That service isn\'t in your studio.' };
  }

  await revalidateServiceSurfaces(database, userId);
  redirect('/dashboard/services');
}

export async function archiveServiceAction(id: string) {
  const { database, userId } = await requireBraiderId();
  const { data: archived } = await database
    .from('services')
    .update({ is_active: false })
    .eq('id', id)
    .eq('braider_id', userId)
    .select('id');
  // Only touch the cache if a row we own was actually archived.
  if (archived && archived.length > 0) await revalidateServiceSurfaces(database, userId);
}
