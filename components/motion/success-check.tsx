import { cn } from '@/lib/utils';

/**
 * The house success mark: a moss "secured" badge that springs in, a check that
 * draws itself on, gold rings breathing outward, and a scatter of sparks. Used
 * at the peak moments — a booking confirmed, a payout connected. Purely
 * decorative; motion collapses to a static drawn check when motion is reduced.
 */
export function SuccessCheck({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('relative inline-flex h-20 w-20 items-center justify-center', className)}
    >
      {/* warm halo */}
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(224,163,63,0.35),transparent_70%)] blur-xl" />

      {/* breathing gold rings */}
      <span className="absolute inset-0 rounded-full border border-gold/50 motion-safe:animate-ring-out" />
      <span className="absolute inset-0 rounded-full border border-gold/40 motion-safe:animate-ring-out [animation-delay:400ms]" />

      {/* sparks */}
      {[
        'left-0 top-1 h-1 w-1 [animation-delay:420ms]',
        'right-1 top-2 h-1.5 w-1.5 [animation-delay:560ms]',
        'bottom-2 left-2 h-1 w-1 [animation-delay:660ms]',
        'bottom-1 right-3 h-1 w-1 [animation-delay:500ms]'
      ].map((pos) => (
        <span
          key={pos}
          className={cn(
            'absolute rounded-full bg-gold-bright shadow-[0_0_6px_rgba(242,196,100,0.9)] motion-safe:animate-spark-out',
            pos
          )}
        />
      ))}

      {/* the badge */}
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-moss-bright to-moss text-cream shadow-[0_10px_30px_-8px_rgba(63,92,64,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] ring-4 ring-moss/15 motion-safe:animate-pop-in">
        <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
          <path
            d="M6 12.5 L10.5 17 L18 7.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 30 }}
            className="motion-safe:animate-check-draw"
          />
        </svg>
      </span>
    </span>
  );
}
