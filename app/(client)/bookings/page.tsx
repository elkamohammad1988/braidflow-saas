import Link from 'next/link';
import { requireSession } from '@/lib/auth/session';
import { supabaseServer } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CancelBookingButton } from '@/components/booking/cancel-button';
import { formatMoney } from '@/lib/utils';
import { formatAppointment } from '@/lib/format-date';
import { depositStateFromPayments, DEPOSIT_LABEL } from '@/lib/payments/status';

const STATUS_TONE = {
  pending_payment: { label: 'Awaiting deposit', tone: 'warning' as const },
  confirmed: { label: 'Confirmed', tone: 'success' as const },
  completed: { label: 'Completed', tone: 'neutral' as const },
  cancelled: { label: 'Cancelled', tone: 'neutral' as const },
  no_show: { label: 'No-show', tone: 'danger' as const }
};

export default async function MyBookings() {
  const { user } = await requireSession();
  const supabase = supabaseServer();

  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      `id, scheduled_at, duration_minutes, status, price_cents, deposit_cents,
       services(name), braiders(business_name, slug),
       payments(kind, status, amount_cents)`
    )
    .eq('client_id', user.id)
    .order('scheduled_at', { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader
        title="My bookings"
        description="Upcoming and past appointments."
        action={
          <Link href="/braiders">
            <Button variant="secondary" size="sm">Book another</Button>
          </Link>
        }
      />

      <div className="mt-8 space-y-3">
        {(!bookings || bookings.length === 0) && (
          <EmptyState
            title="No bookings yet"
            description="Find a braider near you and lock in your first appointment."
            action={
              <Link href="/braiders">
                <Button>Browse braiders</Button>
              </Link>
            }
          />
        )}

        {bookings?.map((b) => {
          const status = STATUS_TONE[b.status as keyof typeof STATUS_TONE];
          const deposit = depositStateFromPayments(b.payments);
          const showDepositBadge =
            b.status === 'cancelled' &&
            (deposit === 'refund_pending' || deposit === 'refunded' || deposit === 'refund_failed');
          return (
            <div
              key={b.id}
              className="flex items-start justify-between gap-4 rounded-card border border-ink/5 bg-white p-5 shadow-soft"
            >
              <div>
                <p className="font-medium text-ink">{b.services?.name}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  with{' '}
                  <Link
                    href={`/braiders/${b.braiders?.slug}`}
                    className="text-ink hover:underline underline-offset-4"
                  >
                    {b.braiders?.business_name}
                  </Link>
                </p>
                <p className="mt-2 text-sm text-ink-muted">
                  {formatAppointment(new Date(b.scheduled_at))}
                </p>
              </div>
              <div className="text-right">
                <Badge tone={status.tone}>{status.label}</Badge>
                {showDepositBadge && (
                  <div className="mt-1">
                    <Badge
                      tone={
                        deposit === 'refunded'
                          ? 'success'
                          : deposit === 'refund_failed'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {DEPOSIT_LABEL[deposit]}
                    </Badge>
                  </div>
                )}
                <p className="mt-2 text-sm text-ink-muted">{formatMoney(b.price_cents)}</p>
                {b.status === 'pending_payment' && (
                  <Link
                    href={`/bookings/${b.id}/pay`}
                    className="mt-2 inline-block text-sm font-medium text-ink hover:underline underline-offset-4"
                  >
                    Complete deposit →
                  </Link>
                )}
                {(b.status === 'pending_payment' || b.status === 'confirmed') &&
                  new Date(b.scheduled_at) > new Date() && (
                    <div className="mt-3 flex items-center justify-end gap-3 text-sm">
                      <Link
                        href={`/bookings/${b.id}/reschedule`}
                        className="font-medium text-ink-muted hover:text-ink"
                      >
                        Reschedule
                      </Link>
                      <span aria-hidden className="text-ink/20">·</span>
                      <CancelBookingButton bookingId={b.id} />
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
