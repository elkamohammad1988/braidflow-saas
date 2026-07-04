import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-4 h-9 w-64" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-8 grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-card" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
