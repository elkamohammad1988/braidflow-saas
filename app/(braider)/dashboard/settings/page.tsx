import { requireBraider } from '@/lib/auth/session';
import { supabaseServer } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
  const { user, profile } = await requireBraider();
  const supabase = supabaseServer();

  const [braiderRes, profileRes] = await Promise.all([
    supabase
      .from('braiders')
      .select('slug, business_name, bio, city, instagram_handle, accepting_bookings')
      .eq('id', user.id)
      .maybeSingle(),
    supabase.from('profiles').select('phone').eq('id', user.id).maybeSingle()
  ]);

  const braider = braiderRes.data;
  const phone = profileRes.data?.phone ?? '';

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://braidflow.app';
  const bookingUrl = braider ? `${baseUrl}/braiders/${braider.slug}` : null;

  return (
    <div>
      <PageHeader title="Settings" description="Your public page and account." />

      {bookingUrl && (
        <Card className="mt-8">
          <CardBody className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-ink-muted">Your booking page</p>
              <p className="mt-1 truncate text-sm text-ink">{bookingUrl}</p>
            </div>
            <CopyButton value={bookingUrl} label="Copy link" />
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
            acceptingBookings: braider?.accepting_bookings ?? true
          }}
        />
      </div>
    </div>
  );
}
