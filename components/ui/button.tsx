import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-cream shadow-sm hover:bg-ink/90 active:translate-y-px disabled:bg-ink/40 disabled:shadow-none',
  secondary:
    'bg-paper text-ink border border-line shadow-card hover:border-ink/25 hover:bg-cream active:translate-y-px',
  ghost: 'text-ink hover:bg-ink/[0.06]',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:translate-y-px'
};

const sizes: Record<Size, string> = {
  sm: 'h-9 gap-1.5 px-3.5 text-sm [&_svg]:h-4 [&_svg]:w-4',
  md: 'h-11 gap-2 px-5 text-sm [&_svg]:h-4 [&_svg]:w-4',
  lg: 'h-12 gap-2 px-6 text-base [&_svg]:h-[18px] [&_svg]:w-[18px]'
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'primary', size = 'md', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        'disabled:cursor-not-allowed [&_svg]:shrink-0',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    />
  );
});
