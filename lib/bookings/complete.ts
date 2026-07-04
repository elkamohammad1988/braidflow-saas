'use server';

import { revalidatePath } from 'next/cache';
import { db, dbAdmin } from '@/lib/db/server';
import { recordAuditLog } from '@/lib/audit/log';

type Result = { ok: true } | { error: string };

// Shared end-of-lifecycle transition. After an appointment's start time has
// passed, the braider records the outcome: it either happened (`completed`) or
// the client didn't show (`no_show`). Both move the booking off `confirmed`,
// which is what unlocks review eligibility and lifetime-revenue accounting.
async function finalizeBooking(
  bookingId: string,
  to: 'completed' | 'no_show'
): Promise<Result> {
  const database = db();
  const { data: { user } } = await database.auth.getUser();
  if (!user) return { error: 'You need to be signed in.' };

  const admin = dbAdmin();
  const { data: booking } = await admin
    .from('bookings')
    .select('id, braider_id, status, scheduled_at')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) return { error: 'Booking not found.' };
  if (booking.braider_id !== user.id) {
    return { error: 'Only the braider can update this appointment.' };
  }
  if (booking.status !== 'confirmed') {
    return { error: 'Only a confirmed appointment can be marked.' };
  }
  if (new Date(booking.scheduled_at) > new Date()) {
    return { error: 'You can mark this once the appointment time has passed.' };
  }

  // Status-guarded update: only flip a row that's still `confirmed`, so a
  // concurrent mark (or double-click) can't transition twice.
  const { data: updated, error } = await admin
    .from('bookings')
    .update({ status: to })
    .eq('id', bookingId)
    .eq('status', 'confirmed')
    .select('id');

  if (error) return { error: 'Could not update that appointment.' };
  if (!updated || updated.length === 0) {
    return { error: 'That appointment was already updated.' };
  }

  await recordAuditLog({
    actorId: user.id,
    action: to === 'completed' ? 'booking.completed' : 'booking.no_show',
    entityType: 'booking',
    entityId: bookingId,
    metadata: { scheduled_at: booking.scheduled_at, previous_status: booking.status }
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard/calendar');
  revalidatePath('/dashboard/clients');
  revalidatePath('/bookings');
  return { ok: true };
}

export async function markBookingCompletedAction(bookingId: string): Promise<Result> {
  return finalizeBooking(bookingId, 'completed');
}

export async function markBookingNoShowAction(bookingId: string): Promise<Result> {
  return finalizeBooking(bookingId, 'no_show');
}
