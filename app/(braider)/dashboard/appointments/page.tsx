import Link from 'next/link';
import { format, isPast } from 'date-fns';
import { requireBraider } from '@/lib/auth/session';
import { supabaseServer } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { CancelBookingButton } from '@/components/booking/cancel-button';
import { RefundDepositButton } from '@/components/booking/refund-button';
import { FinalizeBookingButtons } from '@/components/booking/complete-buttons';
import { formatMoney } from '@/lib/utils';
import { relativeDayLabel } from '@/lib/format-date';
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

export default async function AppointmentsPage() {
  const { user } = await requireBraider();
  const supabase = supabaseServer();

  const { data: appointments, error } = await supabase
    .from('bookings')
    .select(
      `id, scheduled_at, duration_minutes, status, price_cents, deposit_cents,
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
        {(!appointments || appointments.length === 0) ? (
          <EmptyState
            title="No appointments yet"
            description="When clients book, they'll show up here."
          />
        ) : (
          <div className="overflow-hidden rounded-card border border-ink/5 bg-white shadow-soft">
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
              <tbody className="divide-y divide-ink/5">
                {appointments.map((a) => {
                  const status = a.status as keyof typeof LABEL;
                  const scheduled = new Date(a.scheduled_at);
                  const upcoming = !isPast(scheduled);
                  const deposit = depositStateFromPayments(a.payments);

                  return (
                    <tr key={a.id} className="transition-colors hover:bg-cream/40">
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">{relativeDayLabel(scheduled)}</p>
                        <p className="text-xs text-ink-muted">{format(scheduled, 'h:mm a')}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-ink">{a.profiles?.full_name}</p>
                        {a.profiles?.phone && (
                          <p className="text-xs text-ink-muted">{a.profiles.phone}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-ink-muted">{a.services?.name}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col items-start gap-1">
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
                      </td>
                      <td className="px-5 py-3 text-right text-ink">
                        {formatMoney(a.price_cents)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {(status === 'pending_payment' || status === 'confirmed') && upcoming && (
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
                        )}
                        {status === 'confirmed' && !upcoming && (
                          <FinalizeBookingButtons bookingId={a.id} />
                        )}
                        {status === 'cancelled' &&
                          (deposit === 'deposit_held' || deposit === 'refund_failed') && (
                            <RefundDepositButton
                              bookingId={a.id}
                              depositCents={a.deposit_cents}
                              label={deposit === 'refund_failed' ? 'Retry refund' : 'Refund deposit'}
                            />
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
