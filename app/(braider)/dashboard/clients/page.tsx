import { format } from 'date-fns';
import { Users } from 'lucide-react';
import { requireBraider } from '@/lib/auth/session';
import { db } from '@/lib/db/server';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardBody } from '@/components/ui/card';
import { formatMoney, initials } from '@/lib/utils';

type ClientRow = {
  id: string;
  name: string;
  phone: string | null;
  visits: number;
  lifetimeCents: number;
  lastVisit: Date | null;
};

export default async function ClientsPage() {
  const { user } = await requireBraider();
  const database = db();

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
      lastVisit: null
    };
    existing.visits += 1;
    if (b.status === 'completed') existing.lifetimeCents += b.price_cents;
    const visitDate = new Date(b.scheduled_at);
    if (!existing.lastVisit || visitDate > existing.lastVisit) existing.lastVisit = visitDate;
    map.set(key, existing);
  });

  const clients = Array.from(map.values()).sort(
    (a, b) => (b.lastVisit?.getTime() ?? 0) - (a.lastVisit?.getTime() ?? 0)
  );

  return (
    <div>
      <PageHeader title="Clients" description="Everyone who's booked with you." />

      <div className="mt-8 space-y-3">
        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No clients yet"
            description="As soon as someone books, they'll show up here — with their history and notes in one place."
          />
        ) : (
          clients.map((c) => (
            <Card key={c.id} className="transition-colors duration-300 hover:border-clay/25">
              <CardBody className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay/12 text-sm font-semibold text-clay">
                  {initials(c.name) || '—'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{c.name}</p>
                  {c.phone && (
                    <p className="truncate text-sm tabular-nums text-ink-muted">{c.phone}</p>
                  )}
                </div>
                <div className="shrink-0 text-right text-sm text-ink-muted">
                  <p className="tabular-nums">
                    {c.visits} {c.visits === 1 ? 'visit' : 'visits'} ·{' '}
                    <span className="font-medium text-ink">{formatMoney(c.lifetimeCents)}</span>{' '}
                    lifetime
                  </p>
                  {c.lastVisit && (
                    <p className="mt-0.5 text-xs tabular-nums">
                      last seen {format(c.lastVisit, 'MMM d, yyyy')}
                    </p>
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
