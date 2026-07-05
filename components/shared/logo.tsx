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
  wordmark = true,
  tone = 'ink'
}: {
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
  tone?: 'ink' | 'cream';
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-onyx-soft to-night text-gold shadow-[0_2px_10px_-3px_rgba(35,24,16,0.5),inset_0_1px_0_rgba(242,196,100,0.18)] ring-1 ring-gold/25">
        <LogoMark className={cn('h-[19px] w-[19px]', markClassName)} />
      </span>
      {wordmark && (
        <span
          className={cn(
            'font-display text-[1.35rem] font-medium tracking-[-0.03em]',
            tone === 'cream' ? 'text-ivory' : 'text-ink'
          )}
        >
          Braid<span className="text-clay">flow</span>
        </span>
      )}
    </span>
  );
}
