import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { db } from '@/lib/db/server';
import { cn } from '@/lib/utils';

const MAX_VISIBLE = 6;

// `avg`/`count` are computed once by the profile page (it also needs them for
// the header and structured data) and passed in, so the aggregate isn't queried
// twice. This component only fetches the most-recent slice it actually renders.
export async function BraiderReviews({
  braiderId,
  avg,
  count
}: {
  braiderId: string;
  avg: number;
  count: number;
}) {
  if (count === 0) return null;

  const t = await getTranslations('profile');
  const database = db();
  const avgDisplay = avg.toFixed(1);

  const { data: reviews } = await database
    .from('reviews')
    .select('id, rating, body, created_at, client:profiles!reviews_client_id_fkey(full_name)')
    .eq('braider_id', braiderId)
    .order('created_at', { ascending: false })
    .limit(MAX_VISIBLE);

  const all = reviews ?? [];

  return (
    <section id="reviews" className="mt-8 scroll-mt-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-ink">{t('reviewsHeading')}</h2>
        <p className="text-sm text-ink-muted">
          <span className="font-medium text-ink">{avgDisplay}</span> · {t('reviewCount', { count })}
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {all.map((r) => (
          <figure
            key={r.id}
            className="rounded-card border border-line bg-paper p-5 shadow-soft"
          >
            <Stars rating={r.rating} />
            {r.body && (
              <blockquote className="mt-3 text-sm text-ink">&ldquo;{r.body}&rdquo;</blockquote>
            )}
            <figcaption className="mt-4 text-xs text-ink-muted">
              {r.client?.full_name?.split(' ')[0] ?? t('clientFallback')} ·{' '}
              {format(new Date(r.created_at), 'MMM yyyy')}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  const t = useTranslations('profile');
  return (
    <div role="img" aria-label={t('starsAriaLabel', { rating })} className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          strokeWidth={1.5}
          className={cn('h-4 w-4', i < rating ? 'fill-gold text-gold' : 'fill-transparent text-ink/25')}
        />
      ))}
    </div>
  );
}
