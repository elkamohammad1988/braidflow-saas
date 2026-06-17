import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { formatAppointment } from '@/lib/format-date';
import { supabaseAdmin } from '@/lib/supabase/server';
import { resolveBookingViewer } from '@/lib/bookings/access';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CancelBookingButton } from '@/components/booking/cancel-button';
import { formatMoney } from '@/lib/utils';
import { CANCELLATION_REFUND_WINDOW_HOURS } from '@/lib/constants';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';
import { ConfirmationPoller } from './poller';

export default async function ConfirmationPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { redirect_status?: string; t?: string };
}) {
  const token = searchParams.t;
  const { viewer } = await resolveBookingViewer(params.id, token);
  const isGuest = viewer.kind === 'guest';
  const tokenQuery = isGuest && token ? `?t=${encodeURIComponent(token)}` : '';

  const { data: booking } = await supabaseAdmin()
    .from('bookings')
    .select(
      'id, client_id, scheduled_at, status, price_cents, deposit_cents, services(name), braiders(business_name, slug, timezone)'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!booking) notFound();

  const failed = searchParams.redirect_status === 'failed';
  const isConfirmed = booking.status === 'confirmed' || booking.status === 'completed';
  const stillProcessing = !isConfirmed && !failed && booking.status === 'pending_payment';
  // The hold may have been released (expiry cron) or otherwise cancelled — give
  // that an explicit state instead of rendering a blank page.
  const cancelled = booking.status === 'cancelled' || booking.status === 'no_show';

  const upcoming = new Date(booking.scheduled_at) > new Date();
  const canManage = isConfirmed && upcoming;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16 text-center">
      {isConfirmed && (
        <>
          <div className="flex justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-moss/10 text-moss ring-1 ring-inset ring-moss/20 motion-safe:animate-fade-in-up">
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </span>
          </div>
          <h1 className="mt-5 font-display text-3xl text-ink">You're on the books.</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {isGuest ? 'Your confirmation is on its way by email. ' : ''}We&rsquo;ll remind you
            before your appointment.
          </p>

          <dl className="mx-auto mt-8 w-full max-w-sm space-y-1 rounded-card border border-line bg-paper px-6 py-5 text-left text-sm shadow-soft">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Braider</dt>
              <dd className="text-ink">{booking.braiders?.business_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Service</dt>
              <dd className="text-ink">{booking.services?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">When</dt>
              <dd className="text-ink">
                {formatAppointment(
                  booking.scheduled_at,
                  booking.braiders?.timezone ?? DEFAULT_TIMEZONE
                )}
              </dd>
            </div>
            <div className="flex justify-between pt-2">
              <dt className="text-ink-muted">Deposit paid</dt>
              <dd className="text-ink">{formatMoney(booking.deposit_cents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Balance at appointment</dt>
              <dd className="text-ink">
                {formatMoney(booking.price_cents - booking.deposit_cents)}
              </dd>
            </div>
          </dl>

          {isGuest ? (
            <>
              {canManage && (
                <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                  <Link
                    href={`/bookings/${booking.id}/reschedule${tokenQuery}`}
                    className="font-medium text-ink hover:underline underline-offset-4"
                  >
                    Reschedule
                  </Link>
                  <span aria-hidden className="text-ink/20">·</span>
                  <CancelBookingButton bookingId={booking.id} token={token} />
                </div>
              )}
              <p className="mt-6 text-xs text-ink-muted">
                Keep the email we sent you — it has the link to manage this booking anytime.
              </p>
              <div className="mt-6">
                <Link href={`/braiders/${booking.braiders?.slug}`}>
                  <Button variant="ghost" className="w-full">Back to braider</Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-8 flex flex-col gap-2">
              <Link href="/bookings">
                <Button className="w-full">See all my bookings</Button>
              </Link>
              <Link href={`/braiders/${booking.braiders?.slug}`}>
                <Button variant="ghost" className="w-full">Back to braider</Button>
              </Link>
            </div>
          )}
        </>
      )}

      {stillProcessing && (
        <>
          <div className="flex justify-center">
            <Badge tone="warning">Just a sec</Badge>
          </div>
          <h1 className="mt-4 font-display text-3xl text-ink">Finalizing your booking…</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Your card went through. We're confirming with the braider's schedule.
          </p>
          <ConfirmationPoller
            bookingId={booking.id}
            fallbackHref={isGuest ? `/braiders/${booking.braiders?.slug}` : '/bookings'}
            fallbackLabel={isGuest ? 'Back to braider' : 'Go to my bookings'}
          />
        </>
      )}

      {failed && (
        <>
          <div className="flex justify-center">
            <Badge tone="danger">Payment didn't go through</Badge>
          </div>
          <h1 className="mt-4 font-display text-3xl text-ink">Let's try that again.</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Your card was declined. Your slot is held for a few more minutes.
          </p>
          <Link href={`/bookings/${booking.id}/pay${tokenQuery}`} className="mt-6 inline-block">
            <Button className="w-full">Try a different card</Button>
          </Link>
        </>
      )}

      {cancelled && (
        <>
          <div className="flex justify-center">
            <Badge tone="danger">Booking not active</Badge>
          </div>
          <h1 className="mt-4 font-display text-3xl text-ink">This slot was released.</h1>
          <p className="mt-2 text-sm text-ink-muted">
            The hold expired or the booking was cancelled. Any deposit refund follows the
            cancellation policy — a full refund if cancelled at least{' '}
            {CANCELLATION_REFUND_WINDOW_HOURS} hours before the appointment. You can book
            again anytime.
          </p>
          <Link href={`/braiders/${booking.braiders?.slug}`} className="mt-6 inline-block">
            <Button className="w-full">Find another time</Button>
          </Link>
        </>
      )}
    </div>
  );
}
