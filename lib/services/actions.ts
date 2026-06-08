'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { serviceSchema, type ServiceInput } from './validation';

async function requireBraiderId() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return { supabase, userId: user.id };
}

export async function createServiceAction(input: ServiceInput) {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { supabase, userId } = await requireBraiderId();
  const { error } = await supabase.from('services').insert({
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

  const { supabase, userId } = await requireBraiderId();
  const { error } = await supabase
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
    .eq('braider_id', userId);

  if (error) return { error: 'Could not update that service.' };

  revalidatePath('/dashboard/services');
  redirect('/dashboard/services');
}

export async function archiveServiceAction(id: string) {
  const { supabase, userId } = await requireBraiderId();
  await supabase
    .from('services')
    .update({ is_active: false })
    .eq('id', id)
    .eq('braider_id', userId);
  revalidatePath('/dashboard/services');
}
