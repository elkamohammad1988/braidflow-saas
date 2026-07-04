import { Skeleton } from '@/components/ui/skeleton';

// Neutral dashboard skeleton — a header plus generic rows. Kept layout-agnostic
// so it reads correctly for every dashboard section (overview, appointments,
// calendar, clients, services, availability, settings) rather than any one.
export default function Loading() {
  return (
    <div>
      <div className="border-b border-line pb-7">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2.5 h-9 w-52" />
        <Skeleton className="mt-2.5 h-4 w-64" />
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-card border border-line bg-paper p-5 shadow-card">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-2.5 h-3 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
