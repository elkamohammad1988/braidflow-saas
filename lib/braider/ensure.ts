import 'server-only';
import { dbAdmin } from '@/lib/db/server';

// Mirror of the SQL public.slugify() function so the app can mint slugs without
// a round-trip. Keep the two in sync.
function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

type EnsureResult = { ok: true } | { error: string };

// Guarantee a braiders row exists for a braider-role user. The DB trigger
// (handle_new_user) covers new signups; this is the defensive net for accounts
// created before that trigger existed, or any case where the row is missing.
// Idempotent and safe to call on every dashboard load.
export async function ensureBraiderRecord(
  userId: string,
  fallbackName: string
): Promise<EnsureResult> {
  const admin = dbAdmin();

  const { data: existing, error: lookupError } = await admin
    .from('braiders')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (lookupError) return { error: 'Could not load your braider profile.' };
  if (existing) return { ok: true };

  const businessName = fallbackName.trim() || 'My studio';
  const root = slugify(fallbackName) || 'braider';

  // Insert with an incrementing slug suffix on collision. A unique-violation can
  // mean either a slug clash (retry with the next suffix) or that the id row was
  // created concurrently (already done) — re-check to tell them apart.
  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = attempt === 0 ? root : `${root}-${attempt + 1}`;
    const { error } = await admin
      .from('braiders')
      .insert({ id: userId, slug, business_name: businessName });

    if (!error) return { ok: true };

    if (error.code === '23505') {
      const { data: now } = await admin
        .from('braiders')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      if (now) return { ok: true };
      continue;
    }

    return { error: 'Could not set up your braider profile.' };
  }

  return { error: 'Could not generate a unique booking link. Try again.' };
}
