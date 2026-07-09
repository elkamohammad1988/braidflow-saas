'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/server';
import { serviceSchema, type ServiceInput } from './validation';

async function requireBraiderId() {
  const database = db();
  const { data: { user } } = await database.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return { database, userId: user.id };
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

  revalidatePath('/dashboard/services');
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

  revalidatePath('/dashboard/services');
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
  if (archived && archived.length > 0) revalidatePath('/dashboard/services');
}
