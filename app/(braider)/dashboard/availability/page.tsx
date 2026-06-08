import { requireBraider } from '@/lib/auth/session';
import { supabaseServer } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { WeeklyEditor } from './weekly-editor';
import { OverridesEditor } from './overrides-editor';

export default async function AvailabilityPage() {
  const { user } = await requireBraider();
  const supabase = supabaseServer();

  const [{ data: rules }, { data: overrides }] = await Promise.all([
    supabase
      .from('availability_rules')
      .select('id, day_of_week, start_minute, end_minute')
      .eq('braider_id', user.id)
      .order('day_of_week'),
    supabase
      .from('availability_overrides')
      .select('id, starts_at, ends_at, note')
      .eq('braider_id', user.id)
      .eq('kind', 'block')
      .gte('ends_at', new Date().toISOString())
      .order('starts_at')
  ]);

  return (
    <div>
      <PageHeader
        title="Availability"
        description="The hours you take appointments each week. Block off specific dates separately."
      />

      <Card className="mt-8">
        <CardBody>
          <WeeklyEditor rules={rules ?? []} />
        </CardBody>
      </Card>

      <div className="mt-10">
        <OverridesEditor overrides={overrides ?? []} />
      </div>
    </div>
  );
}
