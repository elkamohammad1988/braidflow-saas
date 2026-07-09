import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { ServiceForm } from '../service-form';

export default function NewServicePage() {
  const t = useTranslations('dashboard');
  return (
    <div>
      <PageHeader
        eyebrow={t('services.eyebrow')}
        title={t('services.newTitle')}
        description={t('services.newDescription')}
      />
      <div className="mt-6 max-w-xl">
        <Card>
          <CardBody>
            <ServiceForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
