import { Skeleton } from '@/components/ui/skeleton';

// Mirrors book/page.tsx: max-w-3xl container, and the booking-flow's
// main-column + 340px summary rail grid, so nothing shifts when data lands.
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-6 md:py-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-9 w-64" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] w-full rounded-card" />
          ))}
          <div className="grid grid-cols-3 gap-2 pt-4 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <Skeleton className="hidden h-64 w-full rounded-card md:block" />
      </div>
    </div>
  );
}
