'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/server';
import { rateLimit } from '@/lib/rate-limit';
import { submitReviewSchema, type SubmitReviewInput } from './validation';

type Result = { ok: true } | { error: string };

export async function submitReviewAction(input: SubmitReviewInput): Promise<Result> {
  const parsed = submitReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid review.' };
  }

  // Authorization is enforced here in code: the review must be for the caller's
  // own booking, the appointment must be completed, and each booking can be
  // reviewed only once (a duplicate booking_id is rejected with a 23505).
  const database = db();
  const { data: { user } } = await database.auth.getUser();
  if (!user) return { error: 'You need to be signed in to leave a review.' };

  // Defense-in-depth throttle. Ownership + the one-review-per-booking constraint
  // already bound abuse, but this caps write churn on the path per signed-in user.
  const limit = rateLimit(`review:submit:${user.id}`, { limit: 10, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return { error: 'You\'re submitting reviews very quickly. Please wait a moment and try again.' };
  }

  const { data: booking } = await database
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
  const { error } = await database.from('reviews').insert({
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

  const { data: braider } = await database
    .from('braiders')
    .select('slug')
    .eq('id', booking.braider_id)
    .maybeSingle();
  if (braider?.slug) revalidatePath(`/braiders/${braider.slug}`);
  // A new review moves the braider's average rating, shown on the directory card too.
  revalidatePath('/braiders');
  revalidatePath('/bookings');

  return { ok: true };
}
