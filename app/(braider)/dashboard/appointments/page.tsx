import Link from 'next/link';
import type { ReactNode } from 'react';
import { isPast } from 'date-fns';
import { CalendarPlus, CalendarCheck } from 'lucide-react';
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
import { depositStateFromPayments, DEPOSIT_LABEL_KEY } from '@/lib/payments/status';
import { getLocale, getTranslations } from 'next-intl/server';

const TONE = {
  pending_payment: 'warning',
  confirmed: 'success',
  completed: 'neutral',
  cancelled: 'neutral',
  no_show: 'danger'
} as const;

// Maps each booking status to its shared `dashboard.status.*` translation key.
const STATUS_KEY = {
  pending_payment: 'awaitingDeposit',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'noShow'
} as const;

type Status = keyof typeof STATUS_KEY;
type DepositState = ReturnType<typeof depositStateFromPayments>;
type Translate = (key: string) => string;

// Status + optional deposit badge, shared by the desktop table and mobile cards.
function statusBadges(status: Status, deposit: DepositState, t: Translate, td: Translate): ReactNode {
  return (
    <div className="flex flex-wrap items-start gap-1.5">
      <Badge tone={TONE[status]}>{t(`status.${STATUS_KEY[status]}`)}</Badge>
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
          {td(DEPOSIT_LABEL_KEY[deposit])}
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
  deposit: DepositState,
  t: Translate
): ReactNode {
  if ((status === 'pending_payment' || status === 'confirmed') && upcoming) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <Link
          href={`/bookings/${a.id}/reschedule`}
          className="inline-flex min-h-[44px] items-center font-medium text-ink-muted hover:text-ink"
        >
          {t('appointments.reschedule')}
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
        label={deposit === 'refund_failed' ? t('appointments.retryRefund') : t('appointments.refundDeposit')}
      />
    );
  }
  return null;
}

export default async function AppointmentsPage() {
  const { user } = await requireBraider();
  const database = db();
  const t = await getTranslations('dashboard');
  const td = await getTranslations('deposit');
  const locale = await getLocale();

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
      <PageHeader icon={CalendarCheck} title={t('appointments.title')} description={t('appointments.description')} />

      <div className="mt-6">
        {!appointments || appointments.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title={t('appointments.empty.title')}
            description={t('appointments.empty.description')}
          />
        ) : (
          <>
            {/* Desktop (lg+): table. Below lg the 240px sidebar mounts and would
                leave the table too little room, so tablet-portrait uses the cards.
                overflow-x-auto keeps long locales scrollable inside the card. */}
            <div className="hidden overflow-x-auto rounded-card border border-line bg-paper shadow-soft lg:block">
              <table className="w-full text-sm">
                <thead className="bg-ink/[0.03] text-start text-xs uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3">{t('appointments.table.when')}</th>
                    <th scope="col" className="px-5 py-3">{t('appointments.table.client')}</th>
                    <th scope="col" className="px-5 py-3">{t('appointments.table.service')}</th>
                    <th scope="col" className="px-5 py-3">{t('appointments.table.status')}</th>
                    <th scope="col" className="px-5 py-3 text-end">{t('appointments.table.total')}</th>
                    <th scope="col" className="px-5 py-3">
                      <span className="sr-only">{t('appointments.table.actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {appointments.map((a) => {
                    const status = a.status as Status;
                    const upcoming = !isPast(new Date(a.scheduled_at));
                    const deposit = depositStateFromPayments(a.payments);

                    return (
                      <tr key={a.id} className="transition-colors hover:bg-ink/[0.04]">
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink">
                            {relativeDayLabel(a.scheduled_at, tz, locale)}
                          </p>
                          <p className="text-xs tabular-nums text-ink-muted">
                            {formatInZone(a.scheduled_at, tz, 'h:mm a', locale)}
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
                        <td className="px-5 py-3">{statusBadges(status, deposit, t, td)}</td>
                        <td className="px-5 py-3 text-end tabular-nums text-ink">
                          {formatMoney(a.price_cents, locale)}
                        </td>
                        <td className="px-5 py-3 text-end">
                          {bookingActions(a, status, upcoming, deposit, t)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tablet + mobile: stacked cards */}
            <ul className="space-y-3 lg:hidden">
              {appointments.map((a) => {
                const status = a.status as Status;
                const upcoming = !isPast(new Date(a.scheduled_at));
                const deposit = depositStateFromPayments(a.payments);
                const actions = bookingActions(a, status, upcoming, deposit, t);

                return (
                  <li
                    key={a.id}
                    className="rounded-card border border-line bg-paper p-4 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-ink">
                          {relativeDayLabel(a.scheduled_at, tz, locale)}
                        </p>
                        <p className="text-xs tabular-nums text-ink-muted">
                          {formatInZone(a.scheduled_at, tz, 'h:mm a', locale)}
                        </p>
                      </div>
                      <p className="shrink-0 font-medium tabular-nums text-ink">
                        {formatMoney(a.price_cents, locale)}
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

                    <div className="mt-3">{statusBadges(status, deposit, t, td)}</div>

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
