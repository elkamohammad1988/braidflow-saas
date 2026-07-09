import { type HTMLAttributes, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'danger' | 'info' | 'success' | 'warning';

/**
 * Inline banner for errors and contextual notices. One tone map, one padding,
 * one radius — so the same "callout" role never renders five different ways
 * across the app, and every tone flips correctly in dark mode (the hand-rolled
 * `bg-red-50` boxes did not). Mirrors the semantics of `Badge`'s tone map.
 */
const tones: Record<Tone, string> = {
  danger:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
  info: 'border-clay/25 bg-clay/[0.07] text-ink',
  success: 'border-moss/30 bg-moss/[0.07] text-ink',
  warning: 'border-gold/30 bg-gold/[0.08] text-ink'
};

const iconTones: Record<Tone, string> = {
  danger: 'text-red-700 dark:text-red-300',
  info: 'text-clay-text',
  success: 'text-moss',
  warning: 'text-clay-text'
};

type Props = HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
  icon?: LucideIcon;
  title?: ReactNode;
  children?: ReactNode;
};

export function Alert({ tone = 'danger', icon: Icon, title, children, className, role, ...rest }: Props) {
  return (
    <div
      // Errors announce themselves; neutral notices don't hijack the SR queue.
      role={role ?? (tone === 'danger' ? 'alert' : undefined)}
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-relaxed',
        tones[tone],
        className
      )}
      {...rest}
    >
      {Icon && <Icon aria-hidden className={cn('mt-0.5 h-4 w-4 shrink-0', iconTones[tone])} strokeWidth={2} />}
      <div className="min-w-0">
        {title && <span className="font-medium">{title} </span>}
        {children}
      </div>
    </div>
  );
}
