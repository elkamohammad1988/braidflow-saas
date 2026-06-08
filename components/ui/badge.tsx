import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, string> = {
  neutral: 'bg-ink/[0.06] text-ink ring-1 ring-inset ring-ink/[0.06]',
  success: 'bg-moss/10 text-moss ring-1 ring-inset ring-moss/15',
  warning: 'bg-clay/15 text-clay ring-1 ring-inset ring-clay/20',
  danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15'
};

const dotTones: Record<Tone, string> = {
  neutral: 'bg-ink-muted',
  success: 'bg-moss',
  warning: 'bg-clay',
  danger: 'bg-red-600'
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
