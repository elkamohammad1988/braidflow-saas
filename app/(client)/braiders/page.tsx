import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
import { BraiderCard } from '@/components/braider/braider-card';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Find a braider',
  description:
    'Browse vetted braiders and protective-style stylists with real-time availability. Pick a service, choose a time, and a deposit holds your slot.',
  alternates: { canonical: '/braiders' }
};

export default async function BraidersIndex({
  searchParams
}: {
  searchParams: { city?: string };
}) {
  const supabase = supabaseServer();
  const query = supabase
    .from('braiders')
    .select('slug, business_name, city, hero_image_url, services(price_cents, is_active)')
    .eq('accepting_bookings', true);

  if (searchParams.city) query.ilike('city', `%${searchParams.city}%`);

  const { data: braiders, error } = await query;
  if (error) throw error;

  const enriched =
    braiders?.map((b) => {
      const activePrices = (b.services ?? [])
        .filter((s) => s.is_active)
        .map((s) => s.price_cents);
      return {
        slug: b.slug,
        businessName: b.business_name,
        city: b.city,
        heroImageUrl: b.hero_image_url,
        startingFromCents: activePrices.length ? Math.min(...activePrices) : null
      };
    }) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <PageHeader
        title="Find a braider"
        description="Hand-picked stylists. Real availability. Book in a minute."
      />

      <div className="mt-8">
        {enriched.length === 0 ? (
          <EmptyState
            title="No braiders here yet"
            description="We're onboarding the first cohort. Check back in a few days."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {enriched.map((b) => (
              <BraiderCard key={b.slug} {...b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
