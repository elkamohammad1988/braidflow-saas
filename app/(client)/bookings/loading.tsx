import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="mt-3 h-4 w-60" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-card border border-line bg-paper p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="ml-auto h-5 w-20" />
                <Skeleton className="ml-auto h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
