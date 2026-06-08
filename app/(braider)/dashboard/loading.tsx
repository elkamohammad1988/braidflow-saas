import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div>
      <div className="border-b border-ink/5 pb-6">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-card border border-ink/5 bg-white p-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-8 w-20" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="mt-10 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-card border border-ink/5 bg-white p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
