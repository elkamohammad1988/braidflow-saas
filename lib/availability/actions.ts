'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import {
  availabilityRuleSchema,
  overrideSchema,
  type AvailabilityRuleInput,
  type OverrideInput
} from './validation';

async function requireBraiderId() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return { supabase, userId: user.id };
}

export async function addAvailabilityRuleAction(input: AvailabilityRuleInput) {
  const parsed = availabilityRuleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid range' };
  }

  const { supabase, userId } = await requireBraiderId();
  const { error } = await supabase.from('availability_rules').insert({
    braider_id: userId,
    day_of_week: parsed.data.dayOfWeek,
    start_minute: parsed.data.startMinute,
    end_minute: parsed.data.endMinute
  });

  if (error) return { error: 'Could not save that range.' };
  revalidatePath('/dashboard/availability');
  return { ok: true as const };
}

export async function removeAvailabilityRuleAction(id: string) {
  const { supabase, userId } = await requireBraiderId();
  await supabase.from('availability_rules').delete().eq('id', id).eq('braider_id', userId);
  revalidatePath('/dashboard/availability');
}

export async function addOverrideAction(input: OverrideInput) {
  const parsed = overrideSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid time off' };
  }

  const { supabase, userId } = await requireBraiderId();
  const { error } = await supabase.from('availability_overrides').insert({
    braider_id: userId,
    starts_at: parsed.data.startsAt,
    ends_at: parsed.data.endsAt,
    kind: 'block',
    note: parsed.data.note || null
  });

  if (error) return { error: 'Could not save that time off.' };
  revalidatePath('/dashboard/availability');
  return { ok: true as const };
}

export async function removeOverrideAction(id: string) {
  const { supabase, userId } = await requireBraiderId();
  await supabase
    .from('availability_overrides')
    .delete()
    .eq('id', id)
    .eq('braider_id', userId);
  revalidatePath('/dashboard/availability');
}
