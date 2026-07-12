import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, string> = {
  neutral: 'bg-onyx-soft text-ink-muted ring-1 ring-inset ring-line',
  // "Paid / secured / active" — the champagne-gold highlight.
  success: 'bg-moss-soft text-moss ring-1 ring-inset ring-moss/25',
  // "Attention / in-progress" reads in the brand violet, not a jarring amber.
  warning: 'bg-clay/15 text-clay-text ring-1 ring-inset ring-clay/25',
  danger: 'bg-danger-soft text-danger ring-1 ring-inset ring-danger/25'
};

const dotTones: Record<Tone, string> = {
  neutral: 'bg-ink-subtle',
  success: 'bg-moss-bright',
  warning: 'bg-clay',
  danger: 'bg-danger'
};

type Props = HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean };

export function Badge({ className, tone = 'neutral', dot, children, ...rest }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className
      )}
      {...rest}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotTones[tone])} />}
      {children}
    </span>
  );
}
