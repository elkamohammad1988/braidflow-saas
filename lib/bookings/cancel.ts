'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { notifyCancellation } from '@/lib/email/notifications';
import { recordAuditLog } from '@/lib/audit/log';

export async function cancelBookingAction(bookingId: string) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You need to be signed in.' };

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

  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return { error: 'That booking can\'t be cancelled.' };
  }

  if (new Date(booking.scheduled_at) < new Date()) {
    return { error: 'Past appointments can\'t be cancelled.' };
  }

  const { error } = await admin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);

  if (error) return { error: 'Could not cancel that booking.' };

  await recordAuditLog({
    actorId: user.id,
    action: 'booking.cancelled',
    entityType: 'booking',
    entityId: bookingId,
    metadata: {
      cancelled_by: isClient ? 'client' : 'braider',
      previous_status: booking.status,
      scheduled_at: booking.scheduled_at
    }
  });

  await notifyCancellation(bookingId, isClient ? 'client' : 'braider');

  revalidatePath('/bookings');
  revalidatePath('/dashboard/appointments');
  return { ok: true as const };
}
