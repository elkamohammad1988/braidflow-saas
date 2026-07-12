import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'accent' | 'success' | 'neutral';
type Size = 'sm' | 'md' | 'lg';

/**
 * GlassIcon — the app's one frosted-crystal icon frame.
 *
 * A Lucide glyph set into a violet-glass tile that reads as a physical object
 * lifted off the page. Five stacked layers give it real depth:
 *   1. an ambient tone glow behind it,
 *   2. a dark glass body with a lit top edge + inner floor-shadow,
 *   3. a specular gloss (light catching the top-left, like a curved lens),
 *   4. a tone-coloured refraction pooling at the base,
 *   5. the glyph, lifted with a soft drop-shadow.
 * Every feature-identity spot (dashboard stats, empty states, marketing steps)
 * renders through this so the crystal language is identical everywhere.
 */

const tileSizes: Record<Size, string> = {
  sm: 'h-9 w-9 rounded-xl',
  md: 'h-11 w-11 rounded-2xl',
  lg: 'h-14 w-14 rounded-2xl'
};

const glyphSizes: Record<Size, string> = {
  sm: 'h-[18px] w-[18px]',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

// Tone shifts the rim, the ambient glow, the base refraction and the glyph —
// the glass body itself stays a consistent violet-black so the set feels cut
// from one stone.
const toneRing: Record<Tone, string> = {
  accent: 'ring-clay/30',
  success: 'ring-moss/25',
  neutral: 'ring-line-strong'
};

// The crystal body is always the dark `night` furniture (in both themes), so every
// glyph must be light to read on it — `ivory` stays light in both (white / warm
// champagne), unlike `ink` which flips dark in the light theme and disappears.
const toneGlyph: Record<Tone, string> = {
  accent: 'text-clay-soft',
  // champagne-soft is a light gold in BOTH themes; `moss` flips to a dark gold
  // (#7A5C12) in light and vanishes on the always-dark tile — hence not used here.
  success: 'text-champagne-soft',
  neutral: 'text-ivory'
};

// Accent glow/refraction: the primary tone follows the violet --accent-glow
// channel; success pools the champagne gold; neutral a soft ink wash.
const toneGlow: Record<Tone, string> = {
  accent: 'bg-[radial-gradient(circle,rgb(var(--accent-glow)/0.38),transparent_70%)]',
  success: 'bg-[radial-gradient(circle,rgb(var(--color-champagne)/0.28),transparent_70%)]',
  neutral: 'bg-[radial-gradient(circle,rgb(var(--color-ink-subtle)/0.22),transparent_70%)]'
};

const toneRefraction: Record<Tone, string> = {
  accent: 'bg-[radial-gradient(ellipse_at_bottom,rgb(var(--accent-glow-3)/0.5),transparent_70%)]',
  success: 'bg-[radial-gradient(ellipse_at_bottom,rgb(var(--color-champagne)/0.42),transparent_70%)]',
  neutral: 'bg-[radial-gradient(ellipse_at_bottom,rgb(var(--color-ink-subtle)/0.3),transparent_70%)]'
};

type Props = {
  icon: LucideIcon;
  tone?: Tone;
  size?: Size;
  /** Ambient glow behind the tile. On by default; drop it in dense rows. */
  glow?: boolean;
  strokeWidth?: number;
  className?: string;
};

export function GlassIcon({
  icon: Icon,
  tone = 'accent',
  size = 'md',
  glow = true,
  strokeWidth = 1.8,
  className
}: Props) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {glow && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -inset-1.5 rounded-[inherit] blur-md',
            toneGlow[tone]
          )}
        />
      )}
      <span
        className={cn(
          'relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-night to-night-deep ring-1',
          // Lit top edge (glass catching light) + inner floor-shadow (depth).
          'shadow-[0_12px_30px_-12px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-10px_20px_-16px_rgba(0,0,0,0.6)]',
          tileSizes[size],
          toneRing[tone]
        )}
      >
        {/* Tone refraction pooling at the base — light bending through the glass. */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-1 bottom-0 h-2/3 rounded-[inherit] opacity-70 blur-[2px]',
            toneRefraction[tone]
          )}
        />
        {/* Specular gloss — a curved highlight where light strikes the top-left. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(115%_78%_at_28%_-8%,rgba(255,255,255,0.32),transparent_54%)]"
        />
        <Icon
          className={cn(
            'relative [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.5))]',
            glyphSizes[size],
            toneGlyph[tone]
          )}
          strokeWidth={strokeWidth}
        />
      </span>
    </span>
  );
}
