import { format } from 'date-fns';
import { requireBraider } from '@/lib/auth/session';
import { supabaseServer } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardBody } from '@/components/ui/card';
import { formatMoney } from '@/lib/utils';

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
  const supabase = supabaseServer();

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(
      'price_cents, scheduled_at, status, client_id, profiles!bookings_client_id_fkey(id, full_name, phone)'
    )
    .eq('braider_id', user.id);

  if (error) throw error;

  const map = new Map<string, ClientRow>();
  bookings?.forEach((b) => {
    if (!b.profiles) return;
    const existing = map.get(b.client_id) ?? {
      id: b.client_id,
      name: b.profiles.full_name,
      phone: b.profiles.phone,
      visits: 0,
      lifetimeCents: 0,
      lastVisit: null
    };
    existing.visits += 1;
    if (b.status === 'completed') existing.lifetimeCents += b.price_cents;
    const visitDate = new Date(b.scheduled_at);
    if (!existing.lastVisit || visitDate > existing.lastVisit) existing.lastVisit = visitDate;
    map.set(b.client_id, existing);
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
            title="No clients yet"
            description="As soon as someone books, they'll show up here."
          />
        ) : (
          clients.map((c) => (
            <Card key={c.id}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink">{c.name}</p>
                  {c.phone && <p className="text-sm text-ink-muted">{c.phone}</p>}
                </div>
                <div className="text-right text-sm text-ink-muted">
                  <p>
                    {c.visits} {c.visits === 1 ? 'visit' : 'visits'} ·{' '}
                    {formatMoney(c.lifetimeCents)} lifetime
                  </p>
                  {c.lastVisit && (
                    <p className="mt-0.5 text-xs">
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
