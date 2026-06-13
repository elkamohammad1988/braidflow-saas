import { notFound, redirect } from 'next/navigation';
import { format } from 'date-fns';
import { requireSession } from '@/lib/auth/session';
import { supabaseServer } from '@/lib/supabase/server';
import { getDepositClientSecret } from '@/lib/stripe/get-client-secret';
import { Checkout } from './checkout';
import { formatMoney } from '@/lib/utils';

export default async function PayPage({ params }: { params: { id: string } }) {
  const { user } = await requireSession();
  const supabase = supabaseServer();

  const { data: booking } = await supabase
    .from('bookings')
    .select(
      'id, client_id, scheduled_at, duration_minutes, status, price_cents, deposit_cents, services(name), braiders(business_name, slug)'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!booking || booking.client_id !== user.id) notFound();

  if (booking.status === 'confirmed' || booking.status === 'completed') {
    redirect(`/bookings/${booking.id}/confirmation`);
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

  const secret = await getDepositClientSecret(booking.id, user.id);

  if (secret?.alreadyPaid) {
    redirect(`/bookings/${booking.id}/confirmation`);
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
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-ink-muted">
        Booking with <span className="text-ink">{booking.braiders?.business_name}</span>
      </p>
      <h1 className="mt-1 font-display text-3xl text-ink">Lock in your slot</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <Checkout
          clientSecret={secret.clientSecret}
          bookingId={booking.id}
          depositCents={booking.deposit_cents}
        />

        <aside className="md:sticky md:top-6 md:self-start">
          <div className="rounded-card border border-ink/5 bg-white p-6 shadow-soft">
            <p className="text-sm text-ink-muted">{booking.services?.name}</p>
            <p className="mt-1 font-medium text-ink">
              {format(new Date(booking.scheduled_at), 'EEE, MMM d')}
            </p>
            <p className="text-sm text-ink-muted">
              {format(new Date(booking.scheduled_at), 'h:mm a')}
            </p>

            <dl className="mt-5 space-y-2 border-t border-ink/5 pt-4 text-sm">
              <div className="flex justify-between text-ink-muted">
                <dt>Service total</dt>
                <dd>{formatMoney(booking.price_cents)}</dd>
              </div>
              <div className="flex justify-between font-medium text-ink">
                <dt>Deposit today</dt>
                <dd>{formatMoney(booking.deposit_cents)}</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt>Balance at appointment</dt>
                <dd>{formatMoney(booking.price_cents - booking.deposit_cents)}</dd>
              </div>
            </dl>
          </div>

          <p className="mt-4 px-2 text-xs text-ink-muted">
            Payments are processed securely by Stripe. We never see your card details.
          </p>
        </aside>
      </div>
    </div>
  );
}
