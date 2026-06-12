'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { ensureBraiderRecord } from './ensure';
import { braiderSettingsSchema, type BraiderSettingsInput } from './validation';

export async function updateBraiderSettingsAction(input: BraiderSettingsInput) {
  const parsed = braiderSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You need to be signed in.' };

  // Without a braiders row the UPDATE below matches nothing and reports success
  // while saving nothing. Guarantee the row exists first.
  const ensured = await ensureBraiderRecord(user.id, parsed.data.businessName);
  if ('error' in ensured) return { error: ensured.error };

  const normaliseHandle = (raw: string | undefined) => {
    const trimmed = raw?.replace(/^@/, '').trim();
    return trimmed ? trimmed : null;
  };

  const profileUpdate = supabase
    .from('profiles')
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone?.trim() ? parsed.data.phone.trim() : null
    })
    .eq('id', user.id)
    .select('id');

  const braiderUpdate = supabase
    .from('braiders')
    .update({
      business_name: parsed.data.businessName,
      bio: parsed.data.bio?.trim() ? parsed.data.bio.trim() : null,
      city: parsed.data.city?.trim() ? parsed.data.city.trim() : null,
      instagram_handle: normaliseHandle(parsed.data.instagramHandle),
      accepting_bookings: parsed.data.acceptingBookings
    })
    .eq('id', user.id)
    .select('id');

  const [profileRes, braiderRes] = await Promise.all([profileUpdate, braiderUpdate]);

  if (profileRes.error || braiderRes.error) {
    return { error: 'Could not save your settings.' };
  }

  // Defence in depth: a zero-row update means the braider record vanished
  // between the ensure and the write. Never report a silent success.
  if (!braiderRes.data || braiderRes.data.length === 0) {
    return { error: 'Your braider profile is missing — refresh and try again.' };
  }

  revalidatePath('/dashboard/settings');
  // The public-facing pages cache braider data — bust those too.
  revalidatePath('/braiders');

  const { data: braider } = await supabase
    .from('braiders')
    .select('slug')
    .eq('id', user.id)
    .maybeSingle();
  if (braider?.slug) revalidatePath(`/braiders/${braider.slug}`);

  return { ok: true as const };
}
