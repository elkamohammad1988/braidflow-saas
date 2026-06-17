import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Star } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { BraiderReviews } from '@/components/braider/reviews';
import { JsonLd } from '@/components/shared/json-ld';
import { formatDuration, formatMoney } from '@/lib/utils';

export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = supabaseServer();
  const { data: braider } = await supabase
    .from('braiders')
    .select('business_name, bio, city, hero_image_url')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!braider) return { title: 'Braider not found' };

  const title = `${braider.business_name} — Book braids${braider.city ? ` in ${braider.city}` : ''}`;
  const description =
    braider.bio?.slice(0, 155) ??
    `Book ${braider.business_name} for braids and protective styles. Real-time availability — a deposit holds your slot.`;

  return {
    title,
    description,
    alternates: { canonical: `/braiders/${params.slug}` },
    openGraph: {
      title,
      description,
      type: 'profile',
      images: braider.hero_image_url ? [{ url: braider.hero_image_url }] : undefined
    }
  };
}

export default async function BraiderProfile({ params }: { params: { slug: string } }) {
  const supabase = supabaseServer();
  const { data: braider, error } = await supabase
    .from('braiders')
    .select(
      'id, slug, business_name, bio, city, hero_image_url, instagram_handle, accepting_bookings, charges_enabled, services(id, name, description, duration_minutes, price_cents, deposit_cents, is_active)'
    )
    .eq('slug', params.slug)
    .maybeSingle();

  if (error) throw error;
  if (!braider) notFound();

  const services = (braider.services ?? []).filter((s) => s.is_active);
  // Bookable only when accepting AND Stripe can take charges for them.
  const open = braider.accepting_bookings && braider.charges_enabled;

  const { data: ratingRows } = await supabase
    .from('reviews')
    .select('rating')
    .eq('braider_id', braider.id);
  const ratings = ratingRows ?? [];
  const reviewCount = ratings.length;
  const avgRating = reviewCount
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  const prices = services.map((s) => s.price_cents);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://braidflow.app';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HairSalon',
        name: braider.business_name,
        url: `${base}/braiders/${braider.slug}`,
        ...(braider.hero_image_url ? { image: braider.hero_image_url } : {}),
        ...(braider.bio ? { description: braider.bio } : {}),
        ...(braider.city
          ? { address: { '@type': 'PostalAddress', addressLocality: braider.city } }
          : {}),
        ...(prices.length
          ? { priceRange: `${formatMoney(Math.min(...prices))}–${formatMoney(Math.max(...prices))}` }
          : {}),
        ...(reviewCount
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: avgRating.toFixed(1),
                reviewCount
              }
            }
          : {})
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: base },
          { '@type': 'ListItem', position: 2, name: 'Find a braider', item: `${base}/braiders` },
          {
            '@type': 'ListItem',
            position: 3,
            name: braider.business_name,
            item: `${base}/braiders/${braider.slug}`
          }
        ]
      }
    ]
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <JsonLd data={jsonLd} />
      <div className="grid gap-10 md:grid-cols-[1fr_320px]">
        <div>
          {braider.hero_image_url && (
            <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-card bg-ink/5">
              <Image
                src={braider.hero_image_url}
                alt={braider.business_name}
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                priority
                className="object-cover"
              />
            </div>
          )}

          <h1 className="font-display text-4xl text-ink">{braider.business_name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
            {reviewCount > 0 && (
              <a href="#reviews" className="flex items-center gap-1 text-ink hover:text-clay">
                <Star className="h-4 w-4 fill-clay text-clay" />
                <span className="font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-ink-muted">
                  · {reviewCount} review{reviewCount === 1 ? '' : 's'}
                </span>
              </a>
            )}
            {braider.city && (
              <>
                {reviewCount > 0 && <span aria-hidden>·</span>}
                <span>{braider.city}</span>
              </>
            )}
            {braider.instagram_handle && (
              <>
                {(reviewCount > 0 || braider.city) && <span aria-hidden>·</span>}
                <a
                  href={`https://instagram.com/${braider.instagram_handle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink"
                >
                  @{braider.instagram_handle}
                </a>
              </>
            )}
          </div>

          {braider.bio && (
            <p className="mt-6 max-w-prose text-ink-muted">{braider.bio}</p>
          )}

          <section className="mt-10">
            <h2 className="font-display text-2xl text-ink">Services</h2>
            <ul className="mt-4 divide-y divide-ink/5 border-y border-ink/5">
              {services.map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium text-ink">{s.name}</p>
                    {s.description && (
                      <p className="mt-1 text-sm text-ink-muted">{s.description}</p>
                    )}
                    <p className="mt-1 text-xs text-ink-muted">
                      {formatDuration(s.duration_minutes)} · deposit {formatMoney(s.deposit_cents)}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-lg text-ink">
                    {formatMoney(s.price_cents)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <BraiderReviews braiderId={braider.id} avg={avgRating} count={reviewCount} />
        </div>

        <aside className="md:sticky md:top-6 md:self-start">
          <div className="rounded-card border border-ink/5 bg-white p-6 shadow-soft">
            <p className="font-display text-xl text-ink">Book an appointment</p>
            <p className="mt-1 text-sm text-ink-muted">
              Pick a service and a time that works. Deposit holds your slot.
            </p>
            <div className="mt-5">
              {open ? (
                <Link href={`/braiders/${braider.slug}/book`}>
                  <Button className="w-full">See available times</Button>
                </Link>
              ) : (
                <div className="rounded-lg border border-ink/10 bg-cream px-4 py-4 text-center">
                  <p className="text-sm text-ink-muted">
                    {braider.business_name} isn&rsquo;t taking online bookings right now.
                  </p>
                  {braider.instagram_handle && (
                    <a
                      href={`https://instagram.com/${braider.instagram_handle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-clay"
                    >
                      Reach out on Instagram
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
