import Link from 'next/link';
import { requireBraider } from '@/lib/auth/session';
import { supabaseServer } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDuration, formatMoney } from '@/lib/utils';

export default async function ServicesPage() {
  const { user } = await requireBraider();
  const supabase = supabaseServer();

  const { data: services, error } = await supabase
    .from('services')
    .select('id, name, description, duration_minutes, price_cents, deposit_cents, is_active')
    .eq('braider_id', user.id)
    .order('created_at');

  if (error) throw error;

  return (
    <div>
      <PageHeader
        title="Services"
        description="The styles you offer. Clients pick from this list."
        action={
          <Link href="/dashboard/services/new">
            <Button size="sm">Add service</Button>
          </Link>
        }
      />

      <div className="mt-8 space-y-3">
        {(!services || services.length === 0) ? (
          <EmptyState
            title="No services yet"
            description="Add the styles you offer with prices and how long they take."
            action={
              <Link href="/dashboard/services/new">
                <Button>Add your first service</Button>
              </Link>
            }
          />
        ) : (
          services.map((s) => (
            <Card key={s.id}>
              <CardBody className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{s.name}</p>
                    {!s.is_active && <Badge>Hidden</Badge>}
                  </div>
                  {s.description && (
                    <p className="mt-1 text-sm text-ink-muted">{s.description}</p>
                  )}
                  <p className="mt-2 text-xs text-ink-muted">
                    {formatDuration(s.duration_minutes)} · deposit {formatMoney(s.deposit_cents)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg text-ink">{formatMoney(s.price_cents)}</p>
                  <Link
                    href={`/dashboard/services/${s.id}`}
                    className="mt-2 inline-block text-sm text-ink-muted hover:text-ink"
                  >
                    Edit
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
