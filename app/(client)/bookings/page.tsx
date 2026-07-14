import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { CalendarHeart } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/server';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CancelBookingButton } from '@/components/booking/cancel-button';
import { ReviewForm } from '@/components/review/review-form';
import { formatMoney } from '@/lib/utils';
import { formatAppointment } from '@/lib/format-date';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';
import { depositStateFromPayments, DEPOSIT_LABEL_KEY } from '@/lib/payments/status';

const STATUS_TONE = {
  pending_payment: { label: 'statusPendingPayment', tone: 'warning' as const },
  confirmed: { label: 'statusConfirmed', tone: 'success' as const },
  completed: { label: 'statusCompleted', tone: 'neutral' as const },
  cancelled: { label: 'statusCancelled', tone: 'neutral' as const },
  no_show: { label: 'statusNoShow', tone: 'danger' as const }
};

export default async function MyBookings() {
  const t = await getTranslations('bookings');
  const td = await getTranslations('deposit');
  const locale = await getLocale();
  const { user } = await requireSession();
  const database = db();

  const { data: bookings, error: bookingsError } = await database
    .from('bookings')
    .select(
      `id, scheduled_at, duration_minutes, status, price_cents, deposit_cents,
       services(name), braiders(business_name, slug, timezone),
       payments(kind, status, amount_cents)`
    )
    .eq('client_id', user.id)
    .order('scheduled_at', { ascending: false });

  // Surface a real failure as an error (caught by the segment error boundary)
  // rather than silently rendering the "no bookings yet" empty state.
  if (bookingsError) throw bookingsError;

  // Which completed bookings has this client already reviewed? Drives the
  // "Leave a review" prompt below.
  const { data: myReviews, error: reviewsError } = await database
    .from('reviews')
    .select('booking_id')
    .eq('client_id', user.id);
  if (reviewsError) throw reviewsError;
  const reviewedBookingIds = new Set((myReviews ?? []).map((r) => r.booking_id));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          <Link href="/braiders">
            <Button variant="secondary" size="sm">{t('bookAnother')}</Button>
          </Link>
        }
      />

      <div className="mt-6">
        {(!bookings || bookings.length === 0) && (
          <EmptyState
            icon={CalendarHeart}
            title={t('emptyTitle')}
            description={t('emptyDescription')}
            action={
              <Link href="/braiders">
                <Button>{t('browseBraiders')}</Button>
              </Link>
            }
          />
        )}

        {bookings && bookings.length > 0 && (
          <ul className="space-y-3">
            {bookings.map((b) => {
          const status = STATUS_TONE[b.status as keyof typeof STATUS_TONE];
          const deposit = depositStateFromPayments(b.payments);
          const showDepositBadge =
            b.status === 'cancelled' &&
            (deposit === 'refund_pending' || deposit === 'refunded' || deposit === 'refund_failed');
          return (
            <li
              key={b.id}
              className="rounded-card border border-line bg-paper p-5 shadow-soft transition-colors duration-300 hover:border-clay/25"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{b.services?.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {t('with')}{' '}
                    <Link
                      href={`/braiders/${b.braiders?.slug}`}
                      className="text-ink hover:underline underline-offset-4"
                    >
                      {b.braiders?.business_name}
                    </Link>
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">
                    {formatAppointment(b.scheduled_at, b.braiders?.timezone ?? DEFAULT_TIMEZONE, locale)}
                  </p>
                </div>
                <div className="text-start sm:text-end">
                  <Badge tone={status.tone}>{t(status.label)}</Badge>
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
                        {td(DEPOSIT_LABEL_KEY[deposit])}
                      </Badge>
                    </div>
                  )}
                  <p className="mt-2 text-sm tabular-nums text-ink-muted">{formatMoney(b.price_cents, locale)}</p>
                  {b.status === 'pending_payment' && (
                    <Link
                      href={`/bookings/${b.id}/pay`}
                      className="mt-2 inline-block text-sm font-medium text-ink hover:underline underline-offset-4"
                    >
                      {t('completeDeposit')}
                    </Link>
                  )}
                  {(b.status === 'pending_payment' || b.status === 'confirmed') &&
                    new Date(b.scheduled_at) > new Date() && (
                      <div className="mt-3 flex items-center justify-start gap-3 text-sm sm:justify-end">
                        <Link
                          href={`/bookings/${b.id}/reschedule`}
                          className="inline-flex min-h-[44px] items-center font-medium text-ink-muted hover:text-ink"
                        >
                          {t('reschedule')}
                        </Link>
                        <span aria-hidden className="text-ink/20">·</span>
                        <CancelBookingButton bookingId={b.id} />
                      </div>
                    )}
                  {b.status === 'completed' && reviewedBookingIds.has(b.id) && (
                    <p className="mt-2 text-sm text-ink-muted">{t('reviewed')}</p>
                  )}
                </div>
              </div>
              {/* Full-width so the star row + comment box never crush the details
                  column on a narrow phone (they used to share the right cell). */}
              {b.status === 'completed' && !reviewedBookingIds.has(b.id) && (
                <ReviewForm bookingId={b.id} />
              )}
            </li>
          );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
