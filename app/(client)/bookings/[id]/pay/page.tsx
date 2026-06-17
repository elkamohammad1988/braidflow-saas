import { notFound, redirect } from 'next/navigation';
import { format } from 'date-fns';
import { Clock, Lock, Check } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getDepositClientSecret } from '@/lib/stripe/get-client-secret';
import { resolveBookingViewer } from '@/lib/bookings/access';
import { CANCELLATION_REFUND_WINDOW_HOURS } from '@/lib/constants';
import { Checkout } from './checkout';
import { formatMoney } from '@/lib/utils';

export default async function PayPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { t?: string };
}) {
  const token = searchParams.t;
  // Owner (session) or guest (token) — redirects to /login or 404s as appropriate.
  const { viewer } = await resolveBookingViewer(params.id, token);

  const { data: booking } = await supabaseAdmin()
    .from('bookings')
    .select(
      'id, client_id, scheduled_at, duration_minutes, status, price_cents, deposit_cents, services(name), braiders(business_name, slug)'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!booking) notFound();

  // Carry the guest token through every onward link so the guest never hits a
  // login wall mid-flow. Empty for authenticated owners.
  const tokenQuery = viewer.kind === 'guest' && token ? `?t=${encodeURIComponent(token)}` : '';

  if (booking.status === 'confirmed' || booking.status === 'completed') {
    redirect(`/bookings/${booking.id}/confirmation${tokenQuery}`);
  }

  if (booking.status === 'cancelled') {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-ink">This booking was cancelled</h1>
        <p className="mt-2 text-sm text-ink-muted">
          If that was a mistake, you can book again from the braider's page.
        </p>
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

  if (!secret?.clientSecret) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-ink">We can't load this payment</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Try again in a moment. If it keeps happening, get in touch.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 md:py-10">
      <p className="text-sm text-ink-muted">
        Booking with <span className="text-ink">{booking.braiders?.business_name}</span>
      </p>
      <h1 className="mt-1 font-display text-3xl text-ink md:text-4xl">Pay your deposit</h1>

      <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-clay/20 bg-clay/[0.07] px-4 py-2.5 text-sm text-ink">
        <Clock className="h-4 w-4 shrink-0 text-clay" strokeWidth={2} />
        Your slot is held while you finish — it only takes a minute.
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <Checkout
          clientSecret={secret.clientSecret}
          bookingId={booking.id}
          depositCents={booking.deposit_cents}
          returnQuery={tokenQuery}
        />

        <aside className="space-y-4 md:sticky md:top-6 md:self-start">
          <div className="rounded-card border border-line bg-paper p-6 shadow-soft">
            <p className="font-medium text-ink">{booking.services?.name}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {format(new Date(booking.scheduled_at), 'EEEE, MMMM d')}
            </p>
            <p className="text-sm text-ink-muted">
              {format(new Date(booking.scheduled_at), 'h:mm a')}
            </p>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between text-ink-muted">
                <dt>Service total</dt>
                <dd>{formatMoney(booking.price_cents)}</dd>
              </div>
              <div className="flex items-baseline justify-between font-medium text-ink">
                <dt>Deposit due now</dt>
                <dd className="font-display text-lg">{formatMoney(booking.deposit_cents)}</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt>Balance at appointment</dt>
                <dd>{formatMoney(booking.price_cents - booking.deposit_cents)}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2.5 rounded-card border border-line bg-paper/60 p-4 text-xs text-ink-muted">
            <p className="flex items-start gap-2">
              <Lock className="mt-px h-3.5 w-3.5 shrink-0 text-ink-subtle" strokeWidth={2} />
              Card secured by Stripe — we never see your details.
            </p>
            <p className="flex items-start gap-2">
              <Check className="mt-px h-3.5 w-3.5 shrink-0 text-moss" strokeWidth={2.5} />
              Free cancellation up to {CANCELLATION_REFUND_WINDOW_HOURS} hours before — full deposit
              back.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
