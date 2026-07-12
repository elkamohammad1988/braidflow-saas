import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  // The signature violet CTA — a purple gradient lit from within by the glow.
  // The gradient runs `gold`→`gold-deep` (both violet: #7C3AED→#6D28D9), tuned so
  // white label text clears WCAG AA (≥4.5:1) across the whole face.
  primary:
    'bg-gradient-to-b from-gold to-gold-deep text-on-accent shadow-glow-gold hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 active:brightness-95 disabled:from-onyx-soft disabled:to-onyx-soft disabled:text-ink-subtle disabled:shadow-none disabled:hover:translate-y-0',
  // Layered surface with an accent hairline that warms on hover.
  secondary:
    'bg-paper text-ink border border-line-strong shadow-card hover:-translate-y-[1px] hover:border-clay/45 hover:bg-onyx-soft hover:shadow-lifted active:translate-y-0',
  ghost: 'text-ink-muted hover:bg-clay/10 hover:text-ink',
  danger:
    'bg-gradient-to-b from-danger-strong to-danger-bright text-white shadow-[0_1px_0_rgba(255,235,230,0.25)_inset,0_8px_24px_-8px_rgb(var(--color-danger-bright)/0.5),0_2px_8px_-2px_rgb(var(--color-danger)/0.45)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0'
};

// Compacted ~20%: tighter horizontal padding, 40px default target.
const sizes: Record<Size, string> = {
  sm: 'h-9 gap-1.5 px-3.5 text-sm [&_svg]:h-4 [&_svg]:w-4',
  md: 'h-10 gap-2 px-4 text-sm [&_svg]:h-4 [&_svg]:w-4',
  lg: 'h-12 gap-2.5 px-6 text-[15px] [&_svg]:h-[18px] [&_svg]:w-[18px]'
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'primary', size = 'md', children, disabled, ...rest },
  ref
) {
  // The light-sweep glint sits above the label on purpose — it reads as a
  // reflection travelling across the whole face on hover. Suppressed on disabled
  // buttons and for reduced-motion users (it simply stays parked off-screen).
  const showGlint = variant !== 'ghost' && !disabled;
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'group/btn relative isolate inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-all duration-200 ease-spring',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        'disabled:cursor-not-allowed [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200',
        // The arrow used in CTAs nudges forward on hover.
        'hover:[&_svg:last-child]:translate-x-0.5',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {showGlint && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-[130%] -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[280ms] ease-spring motion-safe:group-hover/btn:translate-x-[130%]"
        />
      )}
      {children}
    </button>
  );
});
