import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { WARM_BLUR } from '@/lib/media';
import { formatMoney } from '@/lib/utils';

type Props = {
  slug: string;
  businessName: string;
  city: string | null;
  heroImageUrl: string | null;
  startingFromCents?: number | null;
  rating?: number | null;
  reviewCount?: number;
};

export function BraiderCard({
  slug,
  businessName,
  city,
  heroImageUrl,
  startingFromCents,
  rating,
  reviewCount = 0
}: Props) {
  const t = useTranslations('directory');
  return (
    <Link href={`/braiders/${slug}`} className="group block rounded-card">
      <Card interactive className="overflow-hidden">
        <div className="relative aspect-[4/5] overflow-hidden">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt={businessName}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              placeholder="blur"
              blurDataURL={WARM_BLUR}
              className="object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.05]"
            />
          ) : (
            <div className="relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-br from-clay/25 via-cream-deep to-plum/15">
              {/* woven monogram placeholder */}
              <svg
                className="absolute inset-0 h-full w-full text-clay/25"
                viewBox="0 0 100 125"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden
              >
                <g fill="none" stroke="currentColor" strokeWidth="0.6">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <path
                      key={i}
                      d={`M-10 ${12 + i * 16} C 25 ${2 + i * 16}, 40 ${26 + i * 16}, 60 ${12 + i * 16} S 95 ${2 + i * 16}, 115 ${14 + i * 16}`}
                    />
                  ))}
                </g>
              </svg>
              <span className="relative font-display text-6xl font-medium text-clay/60">
                {businessName[0]}
              </span>
            </div>
          )}
          {/* legibility scrim on photos */}
          {heroImageUrl && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/25 via-transparent to-transparent" />
          )}
          {startingFromCents != null && (
            <span className="absolute right-3 top-3 rounded-full bg-paper/95 px-2.5 py-1 font-mono text-[11px] font-semibold text-ink shadow-card ring-1 ring-gold/20 backdrop-blur">
              {t('fromPrice', { price: formatMoney(startingFromCents) })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-medium text-ink">{businessName}</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
              {reviewCount > 0 && rating != null ? (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                  <span className="font-medium text-ink">{rating.toFixed(1)}</span>
                  <span className="font-mono text-xs text-ink-subtle">({reviewCount})</span>
                </span>
              ) : (
                <span className="rounded-full bg-moss-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-moss dark:bg-moss/20">
                  {t('new')}
                </span>
              )}
              {city && (
                <span className="flex min-w-0 items-center gap-1">
                  <span aria-hidden>·</span>
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{city}</span>
                </span>
              )}
            </div>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/[0.05] text-ink-muted transition-all duration-300 ease-spring group-hover:bg-gradient-to-b group-hover:from-gold-bright group-hover:to-gold group-hover:text-night group-hover:shadow-glow-gold">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-spring group-hover:rotate-45" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
