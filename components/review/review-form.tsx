'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { fieldSurface } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { submitReviewAction } from '@/lib/reviews/actions';

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const t = useTranslations('profile');
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-sm font-medium text-ink hover:underline underline-offset-4"
      >
        {t('leaveReview')}
      </button>
    );
  }

  function submit() {
    if (rating < 1) {
      setError(t('pickRating'));
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitReviewAction({
        bookingId,
        rating,
        body: body.trim() || undefined
      });
      if ('error' in result) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  const active = hover || rating;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="mt-3 rounded-card border border-line bg-cream/50 p-4 text-start"
    >
      <p className="text-sm font-medium text-ink">{t('howWasAppointment')}</p>

      <div className="mt-2 flex gap-1.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={t('starAria', { count: star })}
            aria-pressed={rating === star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            className="rounded-md transition-transform duration-150 ease-spring hover:scale-110 active:scale-95"
          >
            <Star
              strokeWidth={1.5}
              className={cn(
                'h-7 w-7 transition-colors duration-150',
                star <= active
                  ? 'fill-gold text-gold [filter:drop-shadow(0_1px_6px_rgba(224,163,63,0.5))]'
                  : 'fill-transparent text-ink/25'
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder={t('reviewPlaceholder')}
        className={cn(fieldSurface, 'mt-3 min-h-[80px] w-full resize-y px-3.5 py-2.5 leading-relaxed')}
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? (
            <>
              <Spinner className="me-2" />
              {t('posting')}
            </>
          ) : (
            t('postReview')
          )}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="text-sm text-ink-muted hover:text-ink disabled:opacity-50"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
