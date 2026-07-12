import { cn } from '@/lib/utils';

/**
 * Loading placeholder — a recessed violet base with a light sweeping across it.
 * Falls back to a soft pulse when motion is reduced.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-onyx-soft motion-reduce:animate-pulse',
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-clay/15 to-transparent motion-safe:animate-shimmer-fast motion-reduce:hidden" />
    </div>
  );
}
