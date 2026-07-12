import type { Metadata } from 'next';
import Image from 'next/image';
import { IMAGE_BLUR, galleryForBraider } from '@/lib/media';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db/server';
import { Button } from '@/components/ui/button';
import { BraiderReviews } from '@/components/braider/reviews';
import { JsonLd } from '@/components/shared/json-ld';
import { formatDuration, formatMoney } from '@/lib/utils';

// Intent: ISR this public profile every 60s. Note it is currently INERT — the
// app resolves locale from a cookie in the root layout (i18n/request.ts reads
// cookies()), which opts the whole tree into dynamic rendering, so this route is
// served fresh per request regardless. Kept so ISR activates automatically if the
// app ever moves to URL-based locales (which would make these pages static-eligible).
export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const database = db();
  const { data: braider } = await database
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
  const t = await getTranslations('profile');
  const database = db();
  const { data: braider, error } = await database
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

  const { data: ratingRows } = await database
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
    <div className="mx-auto max-w-5xl px-6 py-10">
      <JsonLd data={jsonLd} />
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-xl2 shadow-lifted ring-1 ring-line">
            {braider.hero_image_url ? (
              <>
                <Image
                  src={braider.hero_image_url}
                  alt={braider.business_name}
                  fill
                  sizes="(min-width: 768px) 60vw, 100vw"
                  priority
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR}
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/30 via-transparent to-transparent" />
              </>
            ) : (
              <div className="relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-br from-clay/25 via-cream-deep to-plum/15">
                <svg
                  className="absolute inset-0 h-full w-full text-clay/25"
                  viewBox="0 0 160 100"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden
                >
                  <g fill="none" stroke="currentColor" strokeWidth="0.6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <path
                        key={i}
                        d={`M-10 ${14 + i * 15} C 40 ${2 + i * 15}, 60 ${28 + i * 15}, 100 ${14 + i * 15} S 170 ${2 + i * 15}, 190 ${16 + i * 15}`}
                      />
                    ))}
                  </g>
                </svg>
                <span className="relative font-display text-7xl font-medium text-clay/60">
                  {braider.business_name[0]}
                </span>
              </div>
            )}
          </div>

          <h1 className="font-display text-[2.5rem] font-medium leading-[1.03] tracking-[-0.03em] text-ink md:text-[3rem]">
            {braider.business_name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-ink-muted">
            {reviewCount > 0 && (
              <a href="#reviews" className="flex items-center gap-1 text-ink transition-colors hover:text-clay">
                <Star aria-hidden strokeWidth={1.5} className="h-4 w-4 fill-gold text-gold" />
                <span className="font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-ink-muted">
                  · {t('reviewCount', { count: reviewCount })}
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
                  rel="noopener noreferrer"
                  className="hover:text-ink"
                >
                  @{braider.instagram_handle}
                  <span className="sr-only"> {t('opensInNewTab')}</span>
                </a>
              </>
            )}
          </div>

          {braider.bio && (
            <p className="mt-6 max-w-prose text-[17px] leading-relaxed text-ink-muted">{braider.bio}</p>
          )}

          <section className="mt-8" aria-label={t('workHeading')}>
            <h2 className="label mb-4 flex items-center gap-2 text-clay-text">
              <span className="h-1 w-1 rounded-full bg-clay" />
              {t('workHeading')}
            </h2>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {galleryForBraider(params.slug).slice(0, 3).map((src, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-line"
                >
                  <Image
                    src={src}
                    alt={t('galleryAlt', { name: braider.business_name })}
                    fill
                    sizes="(min-width: 768px) 18vw, 30vw"
                    placeholder="blur"
                    blurDataURL={IMAGE_BLUR}
                    className="object-cover transition-transform duration-300 ease-spring group-hover:scale-[1.06]"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="label mb-4 flex items-center gap-2 text-clay-text">
              <span className="h-1 w-1 rounded-full bg-clay" />
              {t('servicesHeading')}
            </h2>
            <ul className="divide-y divide-line border-y border-line">
              {services.map((s) => (
                <li
                  key={s.id}
                  className="group flex items-start justify-between gap-4 py-5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="break-words font-display text-lg font-medium text-ink">{s.name}</p>
                    {s.description && (
                      <p className="mt-1 break-words text-sm leading-relaxed text-ink-muted">{s.description}</p>
                    )}
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                      {t('durationDeposit', {
                        duration: formatDuration(s.duration_minutes),
                        deposit: formatMoney(s.deposit_cents)
                      })}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-xl font-medium text-ink">
                    {formatMoney(s.price_cents)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <BraiderReviews braiderId={braider.id} avg={avgRating} count={reviewCount} />
        </div>

        <aside className="md:sticky md:top-24 md:self-start">
          <div className="relative overflow-hidden rounded-xl2 border border-line bg-paper p-6 shadow-lifted">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16),transparent_70%)]" />
            <p className="relative font-display text-xl font-medium text-ink">{t('bookHeading')}</p>
            <p className="relative mt-1.5 text-sm leading-relaxed text-ink-muted">
              {t('bookSubtitle')}
            </p>
            <div className="relative mt-5">
              {open ? (
                <Link href={`/braiders/${braider.slug}/book`}>
                  <Button size="lg" className="w-full">
                    {t('seeAvailableTimes')}
                  </Button>
                </Link>
              ) : (
                <div className="rounded-xl border border-line bg-cream-deep/40 px-4 py-4 text-center">
                  <p className="text-sm text-ink-muted">
                    {t('notBookingOnline', { name: braider.business_name })}
                  </p>
                  {braider.instagram_handle && (
                    <a
                      href={`https://instagram.com/${braider.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-clay"
                    >
                      {t('reachInstagram')}
                      <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                      <span className="sr-only"> {t('opensInNewTab')}</span>
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
