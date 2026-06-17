import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
  return (
    <Link href={`/braiders/${slug}`} className="group block">
      <Card interactive className="overflow-hidden">
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-clay/15 via-cream-deep to-moss/10">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt={businessName}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-5xl text-clay/50">{businessName[0]}</span>
            </div>
          )}
          {startingFromCents != null && (
            <span className="absolute right-3 top-3 rounded-full bg-paper/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-card backdrop-blur">
              from {formatMoney(startingFromCents)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate font-display text-lg text-ink">{businessName}</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
              {reviewCount > 0 && rating != null ? (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-clay text-clay" />
                  <span className="font-medium text-ink">{rating.toFixed(1)}</span>
                  <span>({reviewCount})</span>
                </span>
              ) : (
                <span className="rounded-full bg-moss-soft px-2 py-0.5 text-xs font-medium text-moss">
                  New
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
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.05] text-ink-muted transition-colors group-hover:bg-ink group-hover:text-cream">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
