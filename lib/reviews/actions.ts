'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { submitReviewSchema, type SubmitReviewInput } from './validation';

type Result = { ok: true } | { error: string };

export async function submitReviewAction(input: SubmitReviewInput): Promise<Result> {
  const parsed = submitReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid review.' };
  }

  // Use the caller's RLS-scoped client. The reviews_client_insert policy is the
  // real gate (own booking, status = completed, one per booking) — these checks
  // just turn policy rejections into friendly copy.
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You need to be signed in to leave a review.' };

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, client_id, braider_id, status')
    .eq('id', parsed.data.bookingId)
    .maybeSingle();

  if (!booking) return { error: 'We couldn\'t find that booking.' };
  if (booking.client_id !== user.id) return { error: 'That isn\'t your booking.' };
  if (booking.status !== 'completed') {
    return { error: 'You can review an appointment once it\'s completed.' };
  }

  // braider_id and client_id are taken from the booking, never from the client,
  // so a review can't be misattributed.
  const body = parsed.data.body?.trim() ? parsed.data.body.trim() : null;
  const { error } = await supabase.from('reviews').insert({
    booking_id: booking.id,
    braider_id: booking.braider_id,
    client_id: user.id,
    rating: parsed.data.rating,
    body
  });

  if (error) {
    // 23505 = the booking already has a review (booking_id is unique).
    if (error.code === '23505') {
      return { error: 'You\'ve already reviewed this appointment.' };
    }
    return { error: 'Could not save your review. Try again.' };
  }

  const { data: braider } = await supabase
    .from('braiders')
    .select('slug')
    .eq('id', booking.braider_id)
    .maybeSingle();
  if (braider?.slug) revalidatePath(`/braiders/${braider.slug}`);
  revalidatePath('/bookings');

  return { ok: true };
}
