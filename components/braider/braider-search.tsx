'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SORTS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'price', label: 'Price: low to high' },
  { value: 'newest', label: 'Newest' }
];

const pillFocus =
  'focus-visible:border-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/50';

export function BraiderSearch({
  defaultQuery,
  defaultSort
}: {
  defaultQuery: string;
  defaultSort: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [sort, setSort] = useState(defaultSort);

  function push(q: string, s: string) {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (s && s !== 'rating') params.set('sort', s);
    const qs = params.toString();
    router.push(qs ? `/braiders?${qs}` : '/braiders');
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        push(query, sort);
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-clay"
        />
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or city"
          aria-label="Search braiders by name or city"
          className={`h-12 w-full rounded-full border border-line-strong bg-paper pl-11 pr-4 text-sm text-ink shadow-card placeholder:text-ink-subtle transition-colors ${pillFocus}`}
        />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="sr-only">
          Sort braiders
        </label>
        <select
          id="sort"
          name="sort"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            push(query, e.target.value);
          }}
          className={`h-12 rounded-full border border-line-strong bg-paper px-4 text-sm text-ink shadow-card transition-colors ${pillFocus}`}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <Button type="submit" size="lg" className="h-12 shrink-0 rounded-full px-6">
          Search
        </Button>
      </div>
    </form>
  );
}
