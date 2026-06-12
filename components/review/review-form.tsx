'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { submitReviewAction } from '@/lib/reviews/actions';

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
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
        Leave a review
      </button>
    );
  }

  function submit() {
    if (rating < 1) {
      setError('Pick a star rating.');
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
      className="mt-3 rounded-lg border border-ink/10 bg-cream/40 p-4 text-left"
    >
      <p className="text-sm font-medium text-ink">How was your appointment?</p>

      <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            aria-pressed={rating === star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            className={cn(
              'text-2xl leading-none transition-colors',
              star <= active ? 'text-clay' : 'text-ink/20'
            )}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Share what stood out (optional)."
        className="mt-3 w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? (
            <>
              <Spinner className="mr-2" />
              Posting…
            </>
          ) : (
            'Post review'
          )}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="text-sm text-ink-muted hover:text-ink disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
