import { PageHeader } from '@/components/shared/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { ServiceForm } from '../service-form';

export default function NewServicePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Services"
        title="New service"
        description="Add a style you offer. You can edit it anytime."
      />
      <div className="mt-8 max-w-xl">
        <Card>
          <CardBody>
            <ServiceForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
