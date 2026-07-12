import { cn } from '@/lib/utils';

/**
 * The house success mark: a moss "secured" badge with a soft violet halo and a
 * drawn check. Purely decorative (aria-hidden) and shown next to already-visible
 * confirmation copy. It renders fully formed on first paint — no spring-in,
 * self-drawing stroke, expanding rings, or sparks that would make the mark (or
 * the moment) depend on animation to be legible.
 */
export function SuccessCheck({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('relative inline-flex h-20 w-20 items-center justify-center', className)}
    >
      {/* violet halo */}
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.35),transparent_70%)] blur-xl" />

      {/* a single static ring for depth */}
      <span className="absolute inset-0 rounded-full border border-gold/40" />

      {/* the badge */}
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-moss-bright to-moss text-cream shadow-[0_10px_30px_-8px_rgba(63,92,64,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] ring-4 ring-moss/15">
        <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
          <path
            d="M6 12.5 L10.5 17 L18 7.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}
