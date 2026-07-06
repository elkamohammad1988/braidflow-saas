import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireBraider } from '@/lib/auth/session';
import { db } from '@/lib/db/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { ServiceForm } from '../service-form';

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const { user } = await requireBraider();
  const database = db();
  const t = await getTranslations('dashboard');

  const { data: service } = await database
    .from('services')
    .select('id, name, description, duration_minutes, price_cents, deposit_cents, is_active')
    .eq('id', params.id)
    .eq('braider_id', user.id)
    .maybeSingle();

  if (!service) notFound();

  return (
    <div>
      <PageHeader eyebrow={t('services.eyebrow')} title={service.name} description={t('services.editDescription')} />
      <div className="mt-8 max-w-xl">
        <Card>
          <CardBody>
            <ServiceForm
              initial={{
                id: service.id,
                name: service.name,
                description: service.description,
                durationMinutes: service.duration_minutes,
                priceCents: service.price_cents,
                depositCents: service.deposit_cents,
                isActive: service.is_active
              }}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
