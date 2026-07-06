import { getTranslations } from 'next-intl/server';
import { requireBraider } from '@/lib/auth/session';
import { db } from '@/lib/db/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';
import { WeeklyEditor } from './weekly-editor';
import { OverridesEditor } from './overrides-editor';

export default async function AvailabilityPage() {
  const { user } = await requireBraider();
  const database = db();
  const t = await getTranslations('dashboard');

  const [{ data: rules }, { data: overrides }, { data: braiderRow }] = await Promise.all([
    database
      .from('availability_rules')
      .select('id, day_of_week, start_minute, end_minute')
      .eq('braider_id', user.id)
      .order('day_of_week'),
    database
      .from('availability_overrides')
      .select('id, starts_at, ends_at, note')
      .eq('braider_id', user.id)
      .eq('kind', 'block')
      .gte('ends_at', new Date().toISOString())
      .order('starts_at'),
    database.from('braiders').select('timezone').eq('id', user.id).maybeSingle()
  ]);

  // Time-off blocks are displayed in the braider's own zone (that's where the
  // appointment happens), so the label is identical on the server and client.
  const timeZone = braiderRow?.timezone ?? DEFAULT_TIMEZONE;

  return (
    <div>
      <PageHeader
        title={t('availability.title')}
        description={t('availability.description')}
      />

      <Card className="mt-8">
        <CardBody>
          <WeeklyEditor rules={rules ?? []} />
        </CardBody>
      </Card>

      <div className="mt-10">
        <OverridesEditor overrides={overrides ?? []} timeZone={timeZone} />
      </div>
    </div>
  );
}
