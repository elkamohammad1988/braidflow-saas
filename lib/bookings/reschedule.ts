'use server';

import { revalidatePath } from 'next/cache';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { notifyReschedule } from '@/lib/email/notifications';
import { recordAuditLog } from '@/lib/audit/log';
import { isSlotBookable } from './slot-check';

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
  if (Number.isNaN(newTime.getTime())) return { error: 'Invalid time.' };
  // Same future guard as createBookingAction — a small skew allowance for clock
  // drift, rather than a bare `< now` that would let a booking land on "now".
  if (newTime.getTime() <= Date.now() + 60_000) {
    return { error: 'Pick a time in the future.' };
  }

  const admin = supabaseAdmin();
  const { data: booking } = await admin
    .from('bookings')
    .select('id, client_id, braider_id, status, scheduled_at, duration_minutes')
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

  // Re-validate the requested slot against the braider's live availability. The
  // request is fully untrusted — exactly as in createBookingAction — so we
  // re-derive bookable slots from scratch. The DB exclusion constraint only
  // prevents double-booking; this is what keeps a booking from being moved
  // outside working hours, onto a blocked day, or off the slot grid.
  const { data: braider } = await admin
    .from('braiders')
    .select(
      'accepting_bookings, availability_rules(day_of_week, start_minute, end_minute), availability_overrides(starts_at, ends_at, kind)'
    )
    .eq('id', booking.braider_id)
    .maybeSingle();

  if (!braider) return { error: 'Could not reschedule that booking.' };
  // A client may only land on times the braider is currently accepting; a
  // braider moving their own booking may do so even while paused.
  if (isClient && !braider.accepting_bookings) {
    return { error: 'This braider isn\'t accepting bookings right now.' };
  }

  const windowStart = subDays(startOfDay(newTime), 1).toISOString();
  const windowEnd = endOfDay(newTime).toISOString();
  const { data: dayBookings } = await admin
    .from('bookings')
    .select('scheduled_at, duration_minutes')
    .eq('braider_id', booking.braider_id)
    .in('status', ['pending_payment', 'confirmed'])
    .neq('id', booking.id)
    .gte('scheduled_at', windowStart)
    .lt('scheduled_at', windowEnd);

  const bookable = isSlotBookable(
    newTime,
    booking.duration_minutes,
    braider.availability_rules ?? [],
    braider.availability_overrides ?? [],
    dayBookings ?? []
  );
  if (!bookable) {
    return { error: 'That time isn\'t available. Pick another slot.' };
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
