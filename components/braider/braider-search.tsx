'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const SORTS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'price', label: 'Price: low to high' },
  { value: 'newest', label: 'Newest' }
];

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
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or city"
          aria-label="Search braiders by name or city"
          className="h-11 w-full rounded-full border border-line bg-paper pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted/70 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
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
          className="h-11 rounded-full border border-line bg-paper px-4 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center rounded-full bg-ink px-5 text-sm font-medium text-cream transition-colors hover:bg-ink/90"
        >
          Search
        </button>
      </div>
    </form>
  );
}
