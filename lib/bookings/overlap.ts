import 'server-only';
import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';
import type { dbAdmin } from '@/lib/db/server';

type Admin = ReturnType<typeof dbAdmin>;

/** The slot-occupying bookings the overlap check needs: start + length only. */
export type OverlapBooking = { scheduled_at: string; duration_minutes: number };

/**
 * Fetch a braider's active (slot-occupying) bookings around the instant `at`,
 * padded a full day on each side. The day bounds are computed in the runtime zone
 * (UTC on Vercel) but a braider's day is in their own zone, so an evening booking
 * can fall past UTC midnight — the padding guarantees such rows are still fetched.
 * isSlotBookable does the precise per-slot overlap, so over-fetching is free;
 * under-fetching would false-accept an already-taken slot.
 *
 * `excludeBookingId` drops the row being rescheduled so a booking can't block
 * itself. Shared by createBookingAction and rescheduleBookingAction so the two
 * money-path validations stay identical.
 */
export async function fetchOverlapBookings(
  admin: Admin,
  braiderId: string,
  at: Date,
  excludeBookingId?: string
): Promise<OverlapBooking[]> {
  const windowStart = subDays(startOfDay(at), 1).toISOString();
  const windowEnd = endOfDay(addDays(at, 1)).toISOString();

  const base = admin
    .from('bookings')
    .select('scheduled_at, duration_minutes')
    .eq('braider_id', braiderId)
    .in('status', ['pending_payment', 'confirmed']);
  const scoped = excludeBookingId ? base.neq('id', excludeBookingId) : base;

  const { data } = await scoped.gte('scheduled_at', windowStart).lt('scheduled_at', windowEnd);
  return data ?? [];
}
