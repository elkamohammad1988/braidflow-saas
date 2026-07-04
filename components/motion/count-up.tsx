'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  to: number;
  from?: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Counts up from `from` to `to` the first time it enters view. */
export function CountUp({
  to,
  from = 0,
  decimals = 0,
  duration = 1600,
  prefix = '',
  suffix = '',
  className
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(from);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || typeof IntersectionObserver === 'undefined') {
      setValue(to);
      return;
    }

    let raf = 0;
    let startedAt = 0;
    const run = (now: number) => {
      if (!startedAt) startedAt = now;
      const p = Math.min((now - startedAt) / duration, 1);
      setValue(from + (to - from) * easeOutExpo(p));
      if (p < 1) raf = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          raf = requestAnimationFrame(run);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, from, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
      {suffix}
    </span>
  );
}
