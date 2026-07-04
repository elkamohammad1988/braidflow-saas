'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in ms — pass index * step for a woven cascade. */
  delay?: number;
  /** How far into the viewport before it settles (0–1). */
  threshold?: number;
  as?: ElementType;
  once?: boolean;
};

/**
 * The house reveal: an element settles up into place with a taut spring the
 * first time it crosses into view. Falls back to fully visible when the
 * IntersectionObserver isn't available or motion is reduced (handled in CSS).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  threshold = 0.18,
  as,
  once = true
}: Props) {
  const Tag = (as ?? 'div') as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return (
    <Tag
      ref={ref}
      data-shown={shown}
      className={cn('reveal', className)}
      style={{ ['--reveal-delay' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
