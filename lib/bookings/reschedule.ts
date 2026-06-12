'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { notifyReschedule } from '@/lib/email/notifications';
import { recordAuditLog } from '@/lib/audit/log';

type Result =
  | { ok: true }
  | { error: string };

export async function rescheduleBookingAction(
  bookingId: string,
  newScheduledAt: string
): Promise<Result> {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You need to be signed in.' };

  const newTime = new Date(newScheduledAt);
  if (Number.isNaN(+newTime)) return { error: 'Invalid time.' };
  if (newTime < new Date()) return { error: 'Pick a time in the future.' };

  const admin = supabaseAdmin();
  const { data: booking } = await admin
    .from('bookings')
    .select('id, client_id, braider_id, status, scheduled_at')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) return { error: 'Booking not found.' };

  const isClient = booking.client_id === user.id;
  const isBraider = booking.braider_id === user.id;
  if (!isClient && !isBraider) return { error: 'Not your booking.' };

  if (booking.status !== 'pending_payment' && booking.status !== 'confirmed') {
    return { error: 'That booking can\'t be rescheduled.' };
  }

  if (+new Date(booking.scheduled_at) === +newTime) {
    return { error: "That's the same time as now." };
  }

  const previousScheduledAt = booking.scheduled_at;

  const { error } = await admin
    .from('bookings')
    .update({
      scheduled_at: newTime.toISOString(),
      // Reset so the cron re-arms both reminders for the new time.
      reminder_sent_at: null,
      final_reminder_sent_at: null
    })
    .eq('id', bookingId);

  if (error) {
    if (error.code === '23P01') {
      return { error: 'Someone just grabbed that slot. Pick another time.' };
    }
    return { error: 'Could not reschedule that booking.' };
  }

  await recordAuditLog({
    actorId: user.id,
    action: 'booking.rescheduled',
    entityType: 'booking',
    entityId: bookingId,
    metadata: {
      previous_scheduled_at: previousScheduledAt,
      new_scheduled_at: newTime.toISOString(),
      moved_by: isClient ? 'client' : 'braider'
    }
  });

  await notifyReschedule(bookingId, {
    previousScheduledAt,
    movedBy: isClient ? 'client' : 'braider'
  });

  revalidatePath('/bookings');
  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/calendar');
  return { ok: true };
}
