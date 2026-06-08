import { format } from 'date-fns';
import { supabaseServer } from '@/lib/supabase/server';

const MAX_VISIBLE = 6;

export async function BraiderReviews({ braiderId }: { braiderId: string }) {
  const supabase = supabaseServer();
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, body, created_at, client:profiles!reviews_client_id_fkey(full_name)')
    .eq('braider_id', braiderId)
    .order('created_at', { ascending: false })
    .limit(MAX_VISIBLE);

  const all = reviews ?? [];
  if (all.length === 0) return null;

  const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
  const avgDisplay = avg.toFixed(1);

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-ink">What clients say</h2>
        <p className="text-sm text-ink-muted">
          <span className="font-medium text-ink">{avgDisplay}</span> · {all.length} review
          {all.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {all.map((r) => (
          <figure
            key={r.id}
            className="rounded-card border border-ink/5 bg-white p-5 shadow-soft"
          >
            <Stars rating={r.rating} />
            {r.body && (
              <blockquote className="mt-3 text-sm text-ink">&ldquo;{r.body}&rdquo;</blockquote>
            )}
            <figcaption className="mt-4 text-xs text-ink-muted">
              {r.client?.full_name?.split(' ')[0] ?? 'Client'} ·{' '}
              {format(new Date(r.created_at), 'MMM yyyy')}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div
      aria-label={`Rated ${rating} out of 5`}
      className="flex gap-0.5 text-clay"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden className={i < rating ? 'opacity-100' : 'opacity-25'}>
          ★
        </span>
      ))}
    </div>
  );
}
