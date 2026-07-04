'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  /** 0–1: how strongly the element is pulled toward the cursor. */
  strength?: number;
};

/**
 * Magnetic: the child leans toward the cursor and settles back with a damped
 * follow — a strand catching your finger. Pointer-only; disabled for touch and
 * reduced-motion.
 */
export function Magnetic({ children, className, strength = 0.4 }: Props) {
  const wrap = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    const node = inner.current;
    if (!el || !node) return;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || still) return;

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.15;
      current.current.y += (target.current.y - current.current.y) * 0.15;
      node.style.transform = `translate3d(${current.current.x.toFixed(2)}px, ${current.current.y.toFixed(2)}px, 0)`;
      const dx = Math.abs(target.current.x - current.current.x);
      const dy = Math.abs(target.current.y - current.current.y);
      if (dx < 0.1 && dy < 0.1 && target.current.x === 0 && target.current.y === 0) {
        node.style.transform = 'translate3d(0,0,0)';
        raf.current = null;
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf.current == null) raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      target.current = { x: relX * strength, y: relY * strength };
      start();
    };
    const onLeave = () => {
      target.current = { x: 0, y: 0 };
      start();
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [strength]);

  return (
    <span ref={wrap} className={cn('inline-flex', className)}>
      <span ref={inner} className="inline-flex will-change-transform">
        {children}
      </span>
    </span>
  );
}
