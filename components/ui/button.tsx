import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  // Gold, lit from within — the signature action.
  primary:
    'bg-gradient-to-b from-gold-bright to-gold text-night shadow-glow-gold hover:-translate-y-[1px] hover:brightness-[1.04] active:translate-y-0 active:brightness-95 disabled:from-clay-soft disabled:to-clay-soft disabled:text-ink-subtle disabled:shadow-none disabled:hover:translate-y-0',
  secondary:
    'bg-paper text-ink border border-line-strong shadow-card hover:-translate-y-[1px] hover:border-ink/25 hover:shadow-lifted active:translate-y-0',
  ghost: 'text-ink hover:bg-ink/[0.06]',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_1px_0_rgba(255,235,230,0.3)_inset,0_8px_24px_-8px_rgba(198,90,60,0.5),0_2px_8px_-2px_rgba(160,60,40,0.4)] hover:-translate-y-[1px] hover:brightness-105 active:translate-y-0'
};

const sizes: Record<Size, string> = {
  sm: 'h-9 gap-1.5 px-4 text-sm [&_svg]:h-4 [&_svg]:w-4',
  md: 'h-11 gap-2 px-5 text-sm [&_svg]:h-4 [&_svg]:w-4',
  lg: 'h-[52px] gap-2.5 px-7 text-[15px] [&_svg]:h-[18px] [&_svg]:w-[18px]'
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'primary', size = 'md', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'group/btn inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 ease-spring',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        'disabled:cursor-not-allowed [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200',
        // The arrow used in CTAs nudges forward on hover.
        'hover:[&_svg:last-child]:translate-x-0.5',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    />
  );
});
