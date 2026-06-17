import type { Metadata } from 'next';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { BraiderCard } from '@/components/braider/braider-card';
import { BraiderSearch } from '@/components/braider/braider-search';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export const metadata: Metadata = {
  title: 'Find a braider',
  description:
    'Browse braiders and protective-style stylists with real-time availability. Search your city, compare, and a deposit holds your slot.',
  alternates: { canonical: '/braiders' }
};

type Sort = 'rating' | 'price' | 'newest';

export default async function BraidersIndex({
  searchParams
}: {
  searchParams: { q?: string; sort?: string };
}) {
  const supabase = supabaseServer();
  const q = (searchParams.q ?? '').trim();
  const sort: Sort =
    searchParams.sort === 'price' || searchParams.sort === 'newest'
      ? searchParams.sort
      : 'rating';

  let query = supabase
    .from('braiders')
    .select(
      'id, slug, business_name, city, hero_image_url, created_at, services(price_cents, is_active)'
    )
    .eq('accepting_bookings', true);

  if (q) {
    // Strip characters that would break the PostgREST or() filter grammar.
    const safe = q.replace(/[,()*%\\]/g, ' ').trim();
    if (safe) query = query.or(`business_name.ilike.*${safe}*,city.ilike.*${safe}*`);
  }

  const { data: braiders, error } = await query;
  if (error) throw error;

  const rows = braiders ?? [];

  // One round-trip for every rating across the listed braiders, aggregated in
  // memory — avoids an N+1 of a reviews query per card.
  const ratings = new Map<string, { sum: number; count: number }>();
  if (rows.length > 0) {
    const { data: reviewRows } = await supabase
      .from('reviews')
      .select('braider_id, rating')
      .in(
        'braider_id',
        rows.map((b) => b.id)
      );
    for (const r of reviewRows ?? []) {
      const agg = ratings.get(r.braider_id) ?? { sum: 0, count: 0 };
      agg.sum += r.rating;
      agg.count += 1;
      ratings.set(r.braider_id, agg);
    }
  }

  const enriched = rows.map((b) => {
    const activePrices = (b.services ?? [])
      .filter((s) => s.is_active)
      .map((s) => s.price_cents);
    const agg = ratings.get(b.id);
    return {
      slug: b.slug,
      businessName: b.business_name,
      city: b.city,
      heroImageUrl: b.hero_image_url,
      createdAt: b.created_at,
      startingFromCents: activePrices.length ? Math.min(...activePrices) : null,
      rating: agg ? agg.sum / agg.count : null,
      reviewCount: agg?.count ?? 0
    };
  });

  enriched.sort((a, b) => {
    if (sort === 'price') {
      // Cheapest first; braiders with no priced service sink to the bottom.
      if (a.startingFromCents == null) return b.startingFromCents == null ? 0 : 1;
      if (b.startingFromCents == null) return -1;
      return a.startingFromCents - b.startingFromCents;
    }
    if (sort === 'newest') {
      return b.createdAt.localeCompare(a.createdAt);
    }
    // Top rated: reviewed braiders first (by average, then volume), rest after.
    const aReviewed = a.reviewCount > 0;
    const bReviewed = b.reviewCount > 0;
    if (aReviewed !== bReviewed) return aReviewed ? -1 : 1;
    if (a.rating != null && b.rating != null && b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return b.reviewCount - a.reviewCount;
  });

  const hasQuery = q.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <PageHeader
        title="Find a braider"
        description="Real stylists, real availability. Search your city, compare, and book in a minute."
      />

      <div className="mt-6">
        <BraiderSearch defaultQuery={q} defaultSort={sort} />
      </div>

      {enriched.length > 0 && (
        <p className="mt-5 text-sm text-ink-muted">
          {enriched.length} {enriched.length === 1 ? 'braider' : 'braiders'}
          {hasQuery ? ` for “${q}”` : ' available'}
        </p>
      )}

      <div className="mt-5">
        {enriched.length === 0 ? (
          hasQuery ? (
            <EmptyState
              title={`No braiders match “${q}”`}
              description="Try a different name or city, or clear the search to see everyone."
              action={
                <Link
                  href="/braiders"
                  className="text-sm font-medium text-ink underline underline-offset-4 hover:text-clay"
                >
                  Clear search
                </Link>
              }
            />
          ) : (
            <EmptyState
              title="No braiders here yet"
              description="We're onboarding the first stylists now. Check back soon."
            />
          )
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
