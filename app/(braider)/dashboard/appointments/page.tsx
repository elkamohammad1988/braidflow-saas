import Link from 'next/link';
import type { ReactNode } from 'react';
import { isPast } from 'date-fns';
import { CalendarPlus } from 'lucide-react';
import { requireBraider } from '@/lib/auth/session';
import { db } from '@/lib/db/server';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { CancelBookingButton } from '@/components/booking/cancel-button';
import { RefundDepositButton } from '@/components/booking/refund-button';
import { FinalizeBookingButtons } from '@/components/booking/complete-buttons';
import { formatMoney } from '@/lib/utils';
import { relativeDayLabel, formatInZone } from '@/lib/format-date';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';
import { depositStateFromPayments, DEPOSIT_LABEL } from '@/lib/payments/status';

const TONE = {
  pending_payment: 'warning',
  confirmed: 'success',
  completed: 'neutral',
  cancelled: 'neutral',
  no_show: 'danger'
} as const;

const LABEL = {
  pending_payment: 'Awaiting deposit',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show'
} as const;

type Status = keyof typeof LABEL;
type DepositState = ReturnType<typeof depositStateFromPayments>;

// Status + optional deposit badge, shared by the desktop table and mobile cards.
function statusBadges(status: Status, deposit: DepositState): ReactNode {
  return (
    <div className="flex flex-wrap items-start gap-1.5">
      <Badge tone={TONE[status]}>{LABEL[status]}</Badge>
      {status === 'cancelled' && deposit !== 'deposit_held' && (
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
      )}
    </div>
  );
}

// The row's contextual actions (reschedule/cancel, finalize, refund). Returns
// null when no action applies — same logic for both layouts.
function bookingActions(
  a: { id: string; deposit_cents: number },
  status: Status,
  upcoming: boolean,
  deposit: DepositState
): ReactNode {
  if ((status === 'pending_payment' || status === 'confirmed') && upcoming) {
    return (
      <div className="inline-flex items-center gap-3 text-sm">
        <Link
          href={`/bookings/${a.id}/reschedule`}
          className="font-medium text-ink-muted hover:text-ink"
        >
          Reschedule
        </Link>
        <span aria-hidden className="text-ink/20">·</span>
        <CancelBookingButton bookingId={a.id} />
      </div>
    );
  }
  if (status === 'confirmed' && !upcoming) {
    return <FinalizeBookingButtons bookingId={a.id} />;
  }
  if (status === 'cancelled' && (deposit === 'deposit_held' || deposit === 'refund_failed')) {
    return (
      <RefundDepositButton
        bookingId={a.id}
        depositCents={a.deposit_cents}
        label={deposit === 'refund_failed' ? 'Retry refund' : 'Refund deposit'}
      />
    );
  }
  return null;
}

export default async function AppointmentsPage() {
  const { user } = await requireBraider();
  const database = db();

  const { data: braiderRow } = await database
    .from('braiders')
    .select('timezone')
    .eq('id', user.id)
    .maybeSingle();
  const tz = braiderRow?.timezone ?? DEFAULT_TIMEZONE;

  const { data: appointments, error } = await database
    .from('bookings')
    .select(
      `id, scheduled_at, duration_minutes, status, price_cents, deposit_cents,
       guest_name, guest_phone,
       services(name),
       profiles!bookings_client_id_fkey(full_name, phone),
       payments(kind, status, amount_cents)`
    )
    .eq('braider_id', user.id)
    .order('scheduled_at', { ascending: false });

  // A query failure must read as an error, not "no appointments yet".
  if (error) throw error;

  return (
    <div>
      <PageHeader title="Appointments" description="Every booking, past and upcoming." />

      <div className="mt-8">
        {!appointments || appointments.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="No appointments yet"
            description="When clients book your page, every appointment — past and upcoming — lands here."
          />
        ) : (
          <>
            {/* Desktop: table */}
            <div className="hidden overflow-hidden rounded-card border border-line bg-paper shadow-soft md:block">
              <table className="w-full text-sm">
                <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="px-5 py-3">When</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {appointments.map((a) => {
                    const status = a.status as Status;
                    const upcoming = !isPast(new Date(a.scheduled_at));
                    const deposit = depositStateFromPayments(a.payments);

                    return (
                      <tr key={a.id} className="transition-colors hover:bg-cream/40">
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink">
                            {relativeDayLabel(a.scheduled_at, tz)}
                          </p>
                          <p className="text-xs tabular-nums text-ink-muted">
                            {formatInZone(a.scheduled_at, tz, 'h:mm a')}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-ink">{a.profiles?.full_name ?? a.guest_name}</p>
                          {(a.profiles?.phone ?? a.guest_phone) && (
                            <p className="text-xs text-ink-muted">
                              {a.profiles?.phone ?? a.guest_phone}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3 text-ink-muted">{a.services?.name}</td>
                        <td className="px-5 py-3">{statusBadges(status, deposit)}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-ink">
                          {formatMoney(a.price_cents)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {bookingActions(a, status, upcoming, deposit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards */}
            <ul className="space-y-3 md:hidden">
              {appointments.map((a) => {
                const status = a.status as Status;
                const upcoming = !isPast(new Date(a.scheduled_at));
                const deposit = depositStateFromPayments(a.payments);
                const actions = bookingActions(a, status, upcoming, deposit);

                return (
                  <li
                    key={a.id}
                    className="rounded-card border border-line bg-paper p-4 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-ink">
                          {relativeDayLabel(a.scheduled_at, tz)}
                        </p>
                        <p className="text-xs tabular-nums text-ink-muted">
                          {formatInZone(a.scheduled_at, tz, 'h:mm a')}
                        </p>
                      </div>
                      <p className="shrink-0 font-medium tabular-nums text-ink">
                        {formatMoney(a.price_cents)}
                      </p>
                    </div>

                    <div className="mt-3 text-sm">
                      <p className="text-ink">{a.profiles?.full_name ?? a.guest_name}</p>
                      {(a.profiles?.phone ?? a.guest_phone) && (
                        <p className="text-xs text-ink-muted">
                          {a.profiles?.phone ?? a.guest_phone}
                        </p>
                      )}
                      <p className="mt-0.5 text-ink-muted">{a.services?.name}</p>
                    </div>

                    <div className="mt-3">{statusBadges(status, deposit)}</div>

                    {actions && (
                      <div className="mt-4 border-t border-line pt-3">{actions}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
