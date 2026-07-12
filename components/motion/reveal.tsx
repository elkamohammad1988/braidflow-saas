import { type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  /** Kept for source compatibility; no longer applies a motion delay. */
  delay?: number;
  as?: ElementType;
};

/**
 * Passthrough wrapper. This used to hide its children with `opacity:0` + a
 * transform until an IntersectionObserver scrolled them into view — which meant
 * critical, above-the-fold content (hero, cards, pricing) was invisible until JS
 * ran, and appeared late on slow devices. Readability now always wins: children
 * render in the initial HTML and are visible on first paint, with no dependence
 * on JavaScript, opacity, or transforms. The `delay` prop is still accepted (some
 * call sites pass it) but ignored, so existing markup keeps working untouched.
 */
export function Reveal({ children, className, as }: Props) {
  const Tag = (as ?? 'div') as ElementType;
  return <Tag className={cn(className)}>{children}</Tag>;
}
