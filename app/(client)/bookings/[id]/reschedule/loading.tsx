import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-6 h-4 w-20" />
      <Skeleton className="mt-2 h-10 w-64" />
      <Skeleton className="mt-3 h-4 w-80" />
      <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
