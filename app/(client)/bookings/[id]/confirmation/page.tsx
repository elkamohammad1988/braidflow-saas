import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SuccessCheck } from '@/components/motion/success-check';
import { formatAppointment } from '@/lib/format-date';
import { dbAdmin } from '@/lib/db/server';
import { resolveBookingViewer } from '@/lib/bookings/access';
import { ensureBookingFromSnapshot } from '@/lib/bookings/demo-snapshot';
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
  searchParams: { redirect_status?: string; t?: string; d?: string };
}) {
  const t = await getTranslations('confirmation');
  const token = searchParams.t;
  // Demo: rebuild + confirm the booking onto this instance from the signed
  // snapshot if it was created/confirmed on another. No-op with real Stripe.
  await ensureBookingFromSnapshot(params.id, searchParams.d);
  const { viewer } = await resolveBookingViewer(params.id, token);
  const isGuest = viewer.kind === 'guest';
  const tokenQuery = isGuest && token ? `?t=${encodeURIComponent(token)}` : '';

  const { data: booking } = await dbAdmin()
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
            <SuccessCheck />
          </div>
          <p className="label mx-auto mt-6 w-fit text-moss">{t('bookingConfirmed')}</p>
          <h1 className="mt-3 font-display text-[2.5rem] font-medium leading-[1.03] tracking-[-0.03em] text-ink">
            {t('onTheBooks')}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-muted">
            {isGuest ? t('guestEmailNote') : ''}{t('remindBefore')}
          </p>

          {/* Receipt — a violet-topped ticket for the moment they paid. */}
          <dl className="mx-auto mt-8 w-full max-w-sm overflow-hidden rounded-xl2 border border-line bg-paper text-start text-sm tabular-nums shadow-lifted">
            <div className="h-1 bg-gradient-to-r from-gold-bright via-gold to-clay" aria-hidden />
            <div className="divide-y divide-line px-6">
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-ink-muted">{t('braider')}</dt>
                <dd className="font-medium text-ink">{booking.braiders?.business_name}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-ink-muted">{t('service')}</dt>
                <dd className="text-end font-medium text-ink">{booking.services?.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-ink-muted">{t('when')}</dt>
                <dd className="text-end font-medium text-ink">
                  {formatAppointment(
                    booking.scheduled_at,
                    booking.braiders?.timezone ?? DEFAULT_TIMEZONE
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="flex items-center gap-1.5 text-ink-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-moss-bright" />
                  {t('depositPaid')}
                </dt>
                <dd className="font-display text-base font-medium text-ink">
                  {formatMoney(booking.deposit_cents)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-ink-muted">{t('balanceAtAppointment')}</dt>
                <dd className="text-ink">
                  {formatMoney(booking.price_cents - booking.deposit_cents)}
                </dd>
              </div>
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
                    {t('reschedule')}
                  </Link>
                  <span aria-hidden className="text-ink/20">·</span>
                  <CancelBookingButton bookingId={booking.id} token={token} />
                </div>
              )}
              <p className="mt-6 text-xs text-ink-muted">
                {t('guestKeepEmail')}
              </p>
              <div className="mt-6">
                <Link href={`/braiders/${booking.braiders?.slug}`}>
                  <Button variant="ghost" className="w-full">{t('backToBraider')}</Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/bookings">
                <Button className="w-full">{t('seeAllBookings')}</Button>
              </Link>
              <Link href={`/braiders/${booking.braiders?.slug}`}>
                <Button variant="ghost" className="w-full">{t('backToBraider')}</Button>
              </Link>
            </div>
          )}
        </>
      )}

      {stillProcessing && (
        <>
          <div className="flex justify-center">
            <Badge tone="warning">{t('justASec')}</Badge>
          </div>
          <h1 className="mt-4 font-display text-3xl text-ink">{t('finalizing')}</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {t('finalizingBody')}
          </p>
          <ConfirmationPoller
            fallbackHref={isGuest ? `/braiders/${booking.braiders?.slug}` : '/bookings'}
            fallbackLabel={isGuest ? t('backToBraider') : t('goToMyBookings')}
          />
        </>
      )}

      {failed && (
        <>
          <div className="flex justify-center">
            <Badge tone="danger">{t('paymentFailed')}</Badge>
          </div>
          <h1 className="mt-4 font-display text-3xl text-ink">{t('tryAgainTitle')}</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {t('tryAgainBody')}
          </p>
          <Link href={`/bookings/${booking.id}/pay${tokenQuery}`} className="mt-6 inline-block">
            <Button className="w-full">{t('tryDifferentCard')}</Button>
          </Link>
        </>
      )}

      {cancelled && (
        <>
          <div className="flex justify-center">
            <Badge tone="danger">{t('bookingNotActive')}</Badge>
          </div>
          <h1 className="mt-4 font-display text-3xl text-ink">{t('slotReleased')}</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {t('slotReleasedBody', { hours: CANCELLATION_REFUND_WINDOW_HOURS })}
          </p>
          <Link href={`/braiders/${booking.braiders?.slug}`} className="mt-6 inline-block">
            <Button className="w-full">{t('findAnotherTime')}</Button>
          </Link>
        </>
      )}
    </div>
  );
}
