import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="border-b border-line pb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-3 h-4 w-72" />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-11 flex-1 rounded-full" />
        <Skeleton className="h-11 w-32 rounded-full" />
        <Skeleton className="h-11 w-24 rounded-full" />
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-card border border-line bg-paper">
            <Skeleton className="aspect-[4/5] rounded-none" />
            <div className="px-5 py-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
