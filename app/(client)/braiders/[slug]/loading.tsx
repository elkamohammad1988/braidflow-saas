import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid gap-10 md:grid-cols-[1fr_340px]">
        <div>
          <Skeleton className="aspect-[16/10] w-full rounded-xl2" />
          <Skeleton className="mt-7 h-10 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <div className="mt-12 space-y-6 border-y border-line py-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-2 h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
        <aside className="md:self-start">
          <div className="rounded-xl2 border border-line bg-paper p-6 shadow-lifted">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-5 h-11 w-full rounded-xl" />
          </div>
        </aside>
      </div>
    </div>
  );
}
