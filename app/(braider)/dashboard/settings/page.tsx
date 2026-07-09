import { getTranslations } from 'next-intl/server';
import { requireBraider } from '@/lib/auth/session';
import { db } from '@/lib/db/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
  const { user, profile } = await requireBraider();
  const database = db();
  const t = await getTranslations('dashboard');

  const [braiderRes, profileRes] = await Promise.all([
    database
      .from('braiders')
      .select(
        'slug, business_name, bio, city, instagram_handle, accepting_bookings, timezone, charges_enabled'
      )
      .eq('id', user.id)
      .maybeSingle(),
    database.from('profiles').select('phone').eq('id', user.id).maybeSingle()
  ]);

  const braider = braiderRes.data;
  const phone = profileRes.data?.phone ?? '';

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://braidflow.app';
  const bookingUrl = braider ? `${baseUrl}/braiders/${braider.slug}` : null;

  return (
    <div>
      <PageHeader title={t('settings.title')} description={t('settings.description')} />

      {bookingUrl && (
        <Card className="mt-6">
          <CardBody className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-ink-muted">{t('settings.bookingLinkLabel')}</p>
              <p className="mt-1 truncate text-sm text-ink">{bookingUrl}</p>
            </div>
            <CopyButton value={bookingUrl} label={t('settings.copyLink')} />
          </CardBody>
        </Card>
      )}

      <div className="mt-6">
        <SettingsForm
          initial={{
            fullName: profile.full_name ?? '',
            phone,
            businessName: braider?.business_name ?? '',
            bio: braider?.bio ?? '',
            city: braider?.city ?? '',
            instagramHandle: braider?.instagram_handle ?? '',
            acceptingBookings: braider?.accepting_bookings ?? true,
            timezone: braider?.timezone ?? DEFAULT_TIMEZONE,
            chargesEnabled: braider?.charges_enabled ?? false
          }}
        />
      </div>
    </div>
  );
}
