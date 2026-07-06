import Link from 'next/link';
import { Scissors } from 'lucide-react';
import { requireBraider } from '@/lib/auth/session';
import { db } from '@/lib/db/server';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDuration, formatMoney } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

export default async function ServicesPage() {
  const { user } = await requireBraider();
  const database = db();
  const t = await getTranslations('dashboard');

  const { data: services, error } = await database
    .from('services')
    .select('id, name, description, duration_minutes, price_cents, deposit_cents, is_active')
    .eq('braider_id', user.id)
    .order('created_at');

  if (error) throw error;

  return (
    <div>
      <PageHeader
        title={t('services.title')}
        description={t('services.description')}
        action={
          <Link href="/dashboard/services/new">
            <Button size="sm">{t('services.addService')}</Button>
          </Link>
        }
      />

      <div className="mt-8 space-y-3">
        {(!services || services.length === 0) ? (
          <EmptyState
            icon={Scissors}
            title={t('services.emptyTitle')}
            description={t('services.emptyDescription')}
            action={
              <Link href="/dashboard/services/new">
                <Button>{t('services.addFirst')}</Button>
              </Link>
            }
          />
        ) : (
          services.map((s) => (
            <Card key={s.id} className="transition-colors duration-300 hover:border-clay/25">
              <CardBody className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{s.name}</p>
                    {!s.is_active && <Badge>{t('services.hidden')}</Badge>}
                  </div>
                  {s.description && (
                    <p className="mt-1 text-sm text-ink-muted">{s.description}</p>
                  )}
                  <p className="mt-2 text-xs text-ink-muted">
                    {formatDuration(s.duration_minutes)} · {t('services.depositLabel')} {formatMoney(s.deposit_cents)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg tabular-nums text-ink">{formatMoney(s.price_cents)}</p>
                  <Link
                    href={`/dashboard/services/${s.id}`}
                    className="mt-2 inline-block text-sm text-ink-muted hover:text-ink"
                  >
                    {t('services.edit')}
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
