import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-8 w-56" />
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="rounded-card border border-ink/5 bg-white p-6 shadow-soft">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-5 w-40" />
          <div className="mt-5 space-y-2 border-t border-ink/5 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
