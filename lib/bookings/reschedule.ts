'use server';

import { revalidatePath } from 'next/cache';
import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';
import { db, dbAdmin } from '@/lib/db/server';
import { notifyReschedule } from '@/lib/email/notifications';
import { recordAuditLog } from '@/lib/audit/log';
import { isSlotBookable } from './slot-check';
import { authorizeBookingMutation } from './access';

type Result =
  | { ok: true }
  | { error: string };

export async function rescheduleBookingAction(
  bookingId: string,
  newScheduledAt: string,
  token?: string
): Promise<Result> {
  const database = db();
  const { data: { user } } = await database.auth.getUser();

  const newTime = new Date(newScheduledAt);
  if (Number.isNaN(newTime.getTime())) return { error: 'Invalid time.' };
  // Same future guard as createBookingAction — a small skew allowance for clock
  // drift, rather than a bare `< now` that would let a booking land on "now".
  if (newTime.getTime() <= Date.now() + 60_000) {
    return { error: 'Pick a time in the future.' };
  }

  const admin = dbAdmin();
  const { data: booking } = await admin
    .from('bookings')
    .select('id, client_id, braider_id, guest_token, status, scheduled_at, duration_minutes')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) return { error: 'Booking not found.' };

  // Owner (session) or guest (capability token). A guest reschedules as the
  // client party; a braider rescheduling their own booking is allowed even while
  // paused (handled below).
  const actor = await authorizeBookingMutation(booking, user?.id ?? null, token);
  if ('error' in actor) return { error: actor.error };
  const isClient = actor.role === 'client' || actor.role === 'guest';

  if (booking.status !== 'pending_payment' && booking.status !== 'confirmed') {
    return { error: 'That booking can\'t be rescheduled.' };
  }

  if (+new Date(booking.scheduled_at) === +newTime) {
    return { error: "That's the same time as now." };
  }

  // Re-validate the requested slot against the braider's live availability. The
  // request is fully untrusted — exactly as in createBookingAction — so we
  // re-derive bookable slots from scratch. Slot re-derivation excludes existing
  // bookings (preventing double-booking) and keeps a booking from being moved
  // outside working hours, onto a blocked day, or off the slot grid.
  const { data: braider } = await admin
    .from('braiders')
    .select(
      'accepting_bookings, timezone, availability_rules(day_of_week, start_minute, end_minute), availability_overrides(starts_at, ends_at, kind)'
    )
    .eq('id', booking.braider_id)
    .maybeSingle();

  if (!braider) return { error: 'Could not reschedule that booking.' };
  // A client may only land on times the braider is currently accepting; a
  // braider moving their own booking may do so even while paused.
  if (isClient && !braider.accepting_bookings) {
    return { error: 'This braider isn\'t accepting bookings right now.' };
  }

  // Pad the window a full day on each side: the day boundaries are in the runtime
  // zone (UTC) but the braider's day is in their zone, so an evening booking can
  // land past UTC midnight. isSlotBookable does the precise overlap. (See create.ts.)
  const windowStart = subDays(startOfDay(newTime), 1).toISOString();
  const windowEnd = endOfDay(addDays(newTime, 1)).toISOString();
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
    braider.timezone,
    booking.duration_minutes,
    braider.availability_rules ?? [],
    braider.availability_overrides ?? [],
    dayBookings ?? []
  );
  if (!bookable) {
    return { error: 'That time isn\'t available. Pick another slot.' };
  }

  const previousScheduledAt = booking.scheduled_at;

  // Guarded transition: only move a row still in the status we read, mirroring
  // cancel/complete. Without the status guard a concurrent webhook-confirm or
  // cron-expire between the read above and this write would be silently clobbered.
  const { data: moved, error } = await admin
    .from('bookings')
    .update({
      scheduled_at: newTime.toISOString(),
      // Reset so the cron re-arms both reminders for the new time.
      reminder_sent_at: null,
      final_reminder_sent_at: null
    })
    .eq('id', bookingId)
    .eq('status', booking.status)
    .select('id');

  if (error) {
    if (error.code === '23P01') {
      return { error: 'Someone just grabbed that slot. Pick another time.' };
    }
    return { error: 'Could not reschedule that booking.' };
  }
  if (!moved || moved.length === 0) {
    return { error: 'That booking was just updated. Refresh and try again.' };
  }

  await recordAuditLog({
    actorId: actor.userId,
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
