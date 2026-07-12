import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from './logo';

type Props = {
  /** The large glyph — a code like "404" or a short word like "Oops". */
  code: string;
  title: string;
  description: string;
  /** Actions row (buttons / links). */
  children: ReactNode;
  /** Optional monospace reference line under the description. */
  reference?: string;
};

/**
 * Full-screen status page (404, uncaught error). Standalone — no navbar — so it
 * carries its own brand anchor, a woven violet backdrop, and a gradient glyph. Shared
 * by the server `not-found` and the client `error` boundary.
 */
export function StatusScreen({ code, title, description, children, reference }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-cream px-6">
      {/* woven strands drifting behind everything */}
      <svg
        aria-hidden
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full text-clay/[0.07]"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <path
              key={i}
              d={`M-40 ${70 + i * 60} C 300 ${20 + i * 60}, 500 ${140 + i * 60}, 800 ${70 + i * 60} S 1300 ${20 + i * 60}, 1360 ${80 + i * 60}`}
            />
          ))}
        </g>
      </svg>
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16),transparent_68%)] blur-3xl" />

      <header className="relative z-10 py-8">
        <Link href="/" className="inline-flex transition-opacity hover:opacity-80">
          <Logo />
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center pb-24 text-center">
        <p className="font-display text-[5rem] font-medium leading-none tracking-tight md:text-[7rem]">
          <span className="bg-gradient-to-br from-clay via-ember to-plum bg-clip-text text-transparent">
            {code}
          </span>
        </p>
        <h1 className="mt-4 font-display text-3xl font-medium tracking-[-0.02em] text-ink md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">{description}</p>
        {reference && (
          <p className="mt-3 font-mono text-xs text-ink-subtle">{reference}</p>
        )}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">{children}</div>
      </div>
    </div>
  );
}
