import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Clock, Lock, Check } from 'lucide-react';
import { dbAdmin } from '@/lib/db/server';
import { getDepositClientSecret } from '@/lib/stripe/get-client-secret';
import { ensureBookingFromSnapshot } from '@/lib/bookings/demo-snapshot';
import { resolveBookingViewer } from '@/lib/bookings/access';
import { CANCELLATION_REFUND_WINDOW_HOURS } from '@/lib/constants';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';
import { formatInZone } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { Checkout } from './checkout';
import { DemoCheckout } from './demo-checkout';
import { formatMoney } from '@/lib/utils';

export default async function PayPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { t?: string; d?: string };
}) {
  const t = await getTranslations('pay');
  const token = searchParams.t;
  // Demo: rebuild the booking onto this instance if it was created on another
  // (serverless instances don't share the in-memory store). No-op with real Stripe.
  await ensureBookingFromSnapshot(params.id, searchParams.d);
  // Owner (session) or guest (token) — redirects to /login or 404s as appropriate.
  const { viewer } = await resolveBookingViewer(params.id, token);

  const { data: booking } = await dbAdmin()
    .from('bookings')
    .select(
      'id, client_id, scheduled_at, duration_minutes, status, price_cents, deposit_cents, services(name), braiders(business_name, slug, timezone)'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!booking) notFound();

  // Appointment times are shown in the braider's zone — where it happens — so the
  // client sees the exact time they picked, not the server's UTC.
  const tz = booking.braiders?.timezone ?? DEFAULT_TIMEZONE;
  const braiderHref = `/braiders/${booking.braiders?.slug}`;

  // Carry the guest token through every onward link so the guest never hits a
  // login wall mid-flow. Empty for authenticated owners.
  const tokenQuery = viewer.kind === 'guest' && token ? `?t=${encodeURIComponent(token)}` : '';

  if (booking.status === 'confirmed' || booking.status === 'completed') {
    redirect(`/bookings/${booking.id}/confirmation${tokenQuery}`);
  }

  if (booking.status === 'cancelled') {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-ink">{t('cancelledTitle')}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {t('cancelledBody')}
        </p>
        <Link href={braiderHref} className="mt-6 inline-block">
          <Button>{t('findAnotherTime')}</Button>
        </Link>
      </div>
    );
  }

  const secret = await getDepositClientSecret(
    booking.id,
    viewer.kind === 'guest' ? { guestToken: token! } : { userId: viewer.userId }
  );

  if (secret?.alreadyPaid) {
    redirect(`/bookings/${booking.id}/confirmation${tokenQuery}`);
  }

  // Demo mode (no Stripe keys) renders a simulated checkout; real mode needs the
  // PaymentIntent client secret. Either way, no viable payment → the fallback.
  const demo = secret != null && 'demo' in secret && secret.demo === true;
  const clientSecret = secret && 'clientSecret' in secret ? secret.clientSecret : null;

  if (!demo && !clientSecret) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-ink">{t('cantLoadTitle')}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {t('cantLoadBody')}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href={`/bookings/${booking.id}/pay${tokenQuery}`}>
            <Button>{t('tryAgain')}</Button>
          </Link>
          <Link href={braiderHref}>
            <Button variant="ghost">{t('backToBraider')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6 md:py-8">
      <p className="text-sm text-ink-muted">
        {t('bookingWith')} <span className="text-ink">{booking.braiders?.business_name}</span>
      </p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-[-0.02em] text-ink md:text-4xl">
        {t('payYourDeposit')}
      </h1>

      <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-clay/20 bg-clay/[0.07] px-4 py-2.5 text-sm text-ink">
        <Clock className="h-4 w-4 shrink-0 text-clay-text" strokeWidth={2} />
        {t('slotHeld')}
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
        {demo ? (
          <DemoCheckout
            bookingId={booking.id}
            depositCents={booking.deposit_cents}
            token={token}
            snapshot={searchParams.d}
          />
        ) : (
          <Checkout
            clientSecret={clientSecret!}
            bookingId={booking.id}
            depositCents={booking.deposit_cents}
            returnQuery={tokenQuery}
          />
        )}

        <aside className="space-y-4 md:sticky md:top-6 md:self-start">
          <div className="rounded-card border border-line bg-paper p-6 shadow-soft">
            <p className="font-medium text-ink">{booking.services?.name}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {formatInZone(booking.scheduled_at, tz, 'EEEE, MMMM d')}
            </p>
            <p className="text-sm text-ink-muted">
              {formatInZone(booking.scheduled_at, tz, 'h:mm a')}
            </p>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm tabular-nums">
              <div className="flex justify-between text-ink-muted">
                <dt>{t('serviceTotal')}</dt>
                <dd>{formatMoney(booking.price_cents)}</dd>
              </div>
              <div className="flex items-baseline justify-between font-medium text-ink">
                <dt>{t('depositDueNow')}</dt>
                <dd className="font-display text-lg">{formatMoney(booking.deposit_cents)}</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt>{t('balanceAtAppointment')}</dt>
                <dd>{formatMoney(booking.price_cents - booking.deposit_cents)}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2.5 rounded-card border border-line bg-paper/60 p-4 text-xs text-ink-muted">
            <p className="flex items-start gap-2">
              <Lock className="mt-px h-3.5 w-3.5 shrink-0 text-ink-subtle" strokeWidth={2} />
              {t('cardSecured')}
            </p>
            <p className="flex items-start gap-2">
              <Check className="mt-px h-3.5 w-3.5 shrink-0 text-moss" strokeWidth={2.5} />
              {t('freeCancellation', { hours: CANCELLATION_REFUND_WINDOW_HOURS })}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
