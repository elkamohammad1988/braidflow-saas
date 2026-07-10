import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <Skeleton className="mx-auto h-14 w-14 rounded-full" />
      <Skeleton className="mx-auto mt-6 h-8 w-56" />
      <Skeleton className="mx-auto mt-3 h-4 w-72" />
      <div className="mt-8 rounded-card border border-line bg-paper p-6 text-start shadow-soft">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-2 h-6 w-48" />
        <div className="mt-5 space-y-2 border-t border-line pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <Skeleton className="mx-auto mt-6 h-11 w-40" />
    </div>
  );
}
