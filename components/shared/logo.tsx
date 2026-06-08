import { cn } from '@/lib/utils';

/**
 * Braid-inspired mark: three interwoven strands. Pairs with the Fraunces
 * wordmark. Uses currentColor so it inherits ink / cream depending on context.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn('h-6 w-6', className)}
    >
      <path
        d="M7 2c0 3.5 10 5 10 10S7 18.5 7 22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 2c0 3.5-10 5-10 10s10 6.5 10 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  wordmark = true
}: {
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-cream">
        <LogoMark className={cn('h-[18px] w-[18px]', markClassName)} />
      </span>
      {wordmark && (
        <span className="font-display text-xl tracking-tight text-ink">BraidFlow</span>
      )}
    </span>
  );
}
