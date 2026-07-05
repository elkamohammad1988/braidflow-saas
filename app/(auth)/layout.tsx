import Link from 'next/link';
import { ShieldCheck, CreditCard, CalendarCheck, Star } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

const highlights = [
  { icon: CreditCard, text: 'Take deposits up front with Stripe' },
  { icon: ShieldCheck, text: 'Stop losing chairs to no-shows' },
  { icon: CalendarCheck, text: 'Your whole week, on autopilot' }
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel — the night atelier */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-night p-12 text-ivory lg:flex">
        <div className="absolute inset-0 bg-aurora opacity-90" aria-hidden />
        <div className="absolute inset-0 bg-grid-gold bg-radial-fade opacity-60" aria-hidden />
        <div className="relative">
          <Link href="/" className="inline-flex">
            <span className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-onyx-soft to-night text-gold ring-1 ring-gold/25">
                <svg viewBox="0 0 24 24" fill="none" className="h-[19px] w-[19px]" aria-hidden>
                  <path d="M7 2c0 3.5 10 5 10 10S7 18.5 7 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M17 2c0 3.5-10 5-10 10s10 6.5 10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
                  <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                </svg>
              </span>
              <span className="font-display text-xl font-medium tracking-[-0.03em] text-ivory">
                Braid<span className="text-gold">flow</span>
              </span>
            </span>
          </Link>
        </div>

        <div className="relative">
          <p className="font-display text-[2.5rem] font-medium leading-[1.05] tracking-[-0.03em]">
            The booking platform built for <span className="italic text-gilt">braiders.</span>
          </p>
          <ul className="mt-9 space-y-4">
            {highlights.map((h) => (
              <li key={h.text} className="flex items-center gap-3.5 text-ivory/85">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/20">
                  <h.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                <span className="text-sm">{h.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-card border border-onyx-line bg-ivory/[0.04] p-5 backdrop-blur-sm">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} aria-hidden strokeWidth={0} className="h-3.5 w-3.5 fill-gold text-gold" />
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ivory/85">
            &ldquo;Setup took 15 minutes. The link in my bio finally does the work instead of me.&rdquo;
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-ivory/55">
            Kemi A. · Goddess locs, Houston
          </p>
        </div>
      </aside>

      {/* Form area */}
      <div className="flex flex-1 flex-col">
        <header className="px-6 py-6 lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </header>
        <main
          id="main-content"
          className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16 lg:pb-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
