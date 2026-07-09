import { format } from 'date-fns';
import { Users } from 'lucide-react';
import { requireBraider } from '@/lib/auth/session';
import { db } from '@/lib/db/server';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardBody } from '@/components/ui/card';
import { formatMoney, initials } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

type ClientRow = {
  id: string;
  name: string;
  phone: string | null;
  visits: number;
  lifetimeCents: number;
  lastVisit: Date | null;
  lastActivity: Date | null;
};

export default async function ClientsPage() {
  const { user } = await requireBraider();
  const database = db();
  const t = await getTranslations('dashboard');

  const { data: bookings, error } = await database
    .from('bookings')
    .select(
      'price_cents, scheduled_at, status, client_id, guest_name, guest_email, guest_phone, profiles!bookings_client_id_fkey(id, full_name, phone)'
    )
    .eq('braider_id', user.id);

  if (error) throw error;

  const map = new Map<string, ClientRow>();
  bookings?.forEach((b) => {
    // Group registered clients by their account; guests (no account) by their
    // email, so a repeat guest still rolls up into one row. Skip anything we
    // can't attribute to a person.
    let key: string;
    let name: string;
    let phone: string | null;
    if (b.client_id && b.profiles) {
      key = b.client_id;
      name = b.profiles.full_name;
      phone = b.profiles.phone;
    } else if (b.guest_email) {
      key = `guest:${b.guest_email.toLowerCase()}`;
      name = b.guest_name ?? b.guest_email;
      phone = b.guest_phone;
    } else {
      return;
    }

    const existing = map.get(key) ?? {
      id: key,
      name,
      phone,
      visits: 0,
      lifetimeCents: 0,
      lastVisit: null,
      lastActivity: null
    };
    // Count "visits" and lifetime from appointments they actually sat for, so the
    // two can never contradict (a pending/cancelled-only client reads as new, not
    // "1 visit · $0"). lastActivity tracks any booking, for a sensible sort order.
    const bookingDate = new Date(b.scheduled_at);
    if (!existing.lastActivity || bookingDate > existing.lastActivity) {
      existing.lastActivity = bookingDate;
    }
    if (b.status === 'completed') {
      existing.visits += 1;
      existing.lifetimeCents += b.price_cents;
      if (!existing.lastVisit || bookingDate > existing.lastVisit) existing.lastVisit = bookingDate;
    }
    map.set(key, existing);
  });

  const clients = Array.from(map.values()).sort(
    (a, b) => (b.lastActivity?.getTime() ?? 0) - (a.lastActivity?.getTime() ?? 0)
  );

  return (
    <div>
      <PageHeader title={t('clients.title')} description={t('clients.description')} />

      <div className="mt-6 space-y-3">
        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('clients.empty.title')}
            description={t('clients.empty.description')}
          />
        ) : (
          clients.map((c) => (
            <Card key={c.id} className="transition-colors duration-300 hover:border-clay/25">
              <CardBody className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay/12 text-sm font-semibold text-clay-text">
                  {initials(c.name) || '—'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{c.name}</p>
                  {c.phone && (
                    <p className="truncate text-sm tabular-nums text-ink-muted">{c.phone}</p>
                  )}
                </div>
                <div className="shrink-0 text-end text-sm text-ink-muted">
                  {c.visits > 0 ? (
                    <>
                      <p className="tabular-nums">
                        {t('clients.visits', { count: c.visits })} ·{' '}
                        <span className="font-medium text-ink">
                          {formatMoney(c.lifetimeCents)}
                        </span>{' '}
                        {t('clients.lifetime')}
                      </p>
                      {c.lastVisit && (
                        <p className="mt-0.5 text-xs tabular-nums">
                          {t('clients.lastSeen', { date: format(c.lastVisit, 'MMM d, yyyy') })}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="font-medium text-ink">{t('clients.newClient')}</p>
                  )}
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
