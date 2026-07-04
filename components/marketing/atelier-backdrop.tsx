'use client';

import { useEffect, useRef } from 'react';

const W = 1200;
const H = 640;

/** Build a smooth flowing strand as an SVG path from a sine wave. */
function strand(yBase: number, amp: number, phase: number, periods = 3, steps = 96) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = t * W;
    const y = yBase + Math.sin(t * Math.PI * periods + phase) * amp;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d.trim();
}

// Six interleaving strands, phase-offset so they cross over and under — a braid
// abstracted to flowing line-work. Computed once, deterministically.
const STRANDS = [
  { d: strand(200, 74, 0), w: 1.4, o: 0.9 },
  { d: strand(230, 92, 1.1), w: 2.6, o: 0.55 },
  { d: strand(300, 110, 2.3), w: 1.2, o: 0.8 },
  { d: strand(330, 84, 3.4), w: 3.2, o: 0.4 },
  { d: strand(400, 100, 0.7), w: 1.6, o: 0.7 },
  { d: strand(440, 70, 2.0), w: 2.2, o: 0.5 }
];

type Props = { className?: string };

/**
 * The living braid: warm aurora glows behind six golden strands that breathe
 * and weave, with a light travelling along them. Leans gently toward the
 * cursor. Fills its (relative) parent.
 */
export function AtelierBackdrop({ className }: Props) {
  const strandsRef = useRef<SVGSVGElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || still) return;

    const tick = () => {
      cur.current.x += (target.current.x - cur.current.x) * 0.06;
      cur.current.y += (target.current.y - cur.current.y) * 0.06;
      if (strandsRef.current) {
        strandsRef.current.style.transform = `translate3d(${(cur.current.x * 22).toFixed(2)}px, ${(cur.current.y * 16).toFixed(2)}px, 0)`;
      }
      if (auroraRef.current) {
        auroraRef.current.style.transform = `translate3d(${(cur.current.x * -34).toFixed(2)}px, ${(cur.current.y * -24).toFixed(2)}px, 0)`;
      }
      // Idle out once the strands have caught up — wake again on the next move.
      if (
        Math.abs(target.current.x - cur.current.x) < 0.0004 &&
        Math.abs(target.current.y - cur.current.y) < 0.0004
      ) {
        raf.current = null;
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      target.current = {
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5
      };
      if (raf.current == null) raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className={className} aria-hidden>
      {/* Aurora mesh */}
      <div ref={auroraRef} className="absolute inset-0 will-change-transform">
        <div className="absolute -left-[10%] top-[-14%] h-[46vh] w-[46vh] animate-aurora-1 rounded-full bg-[radial-gradient(circle,rgba(224,163,63,0.45),transparent_66%)] blur-3xl" />
        <div className="absolute right-[2%] top-[6%] h-[52vh] w-[52vh] animate-aurora-2 rounded-full bg-[radial-gradient(circle,rgba(106,47,82,0.55),transparent_64%)] blur-3xl" />
        <div className="absolute bottom-[-18%] left-[38%] h-[48vh] w-[48vh] animate-aurora-1 rounded-full bg-[radial-gradient(circle,rgba(198,90,60,0.32),transparent_66%)] blur-3xl [animation-delay:-6s]" />
      </div>

      {/* Woven strands */}
      <svg
        ref={strandsRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full will-change-transform"
      >
        <defs>
          <linearGradient id="strandGold" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0" stopColor="#b47a24" stopOpacity="0.1" />
            <stop offset="0.5" stopColor="#f2c464" />
            <stop offset="1" stopColor="#b47a24" stopOpacity="0.1" />
          </linearGradient>
          <filter id="strandGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g fill="none" stroke="url(#strandGold)" filter="url(#strandGlow)">
          {STRANDS.map((s, i) => (
            <path
              key={i}
              d={s.d}
              strokeWidth={s.w}
              strokeLinecap="round"
              style={{ opacity: s.o }}
            />
          ))}
        </g>
      </svg>

      {/* Travelling light */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-[linear-gradient(100deg,transparent,rgba(255,243,214,0.14),transparent)] mix-blend-screen" />
    </div>
  );
}
