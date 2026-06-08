import Link from 'next/link';
import { ShieldCheck, CreditCard, CalendarCheck } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

const highlights = [
  { icon: CreditCard, text: 'Take deposits up front with Stripe' },
  { icon: ShieldCheck, text: 'Stop losing chairs to no-shows' },
  { icon: CalendarCheck, text: 'Your whole week, on autopilot' }
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-ink p-12 text-cream lg:flex">
        <div className="absolute inset-0 bg-grid opacity-[0.12]" aria-hidden />
        <div className="relative">
          <Link href="/" className="inline-flex">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cream text-ink">
                <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden>
                  <path d="M7 2c0 3.5 10 5 10 10S7 18.5 7 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M17 2c0 3.5-10 5-10 10s10 6.5 10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
                  <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                </svg>
              </span>
              <span className="font-display text-xl tracking-tight text-cream">BraidFlow</span>
            </span>
          </Link>
        </div>

        <div className="relative">
          <p className="font-display text-3xl leading-tight tracking-tight">
            The booking platform built for braiders.
          </p>
          <ul className="mt-8 space-y-4">
            {highlights.map((h) => (
              <li key={h.text} className="flex items-center gap-3 text-cream/80">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream/10">
                  <h.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                <span className="text-sm">{h.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-card border border-cream/10 bg-cream/[0.04] p-5">
          <p className="text-sm leading-relaxed text-cream/80">
            &ldquo;Setup took 15 minutes. The link in my bio finally does the work instead of me.&rdquo;
          </p>
          <p className="mt-3 text-xs font-medium text-cream/60">Kemi A. · Goddess locs, Houston</p>
        </div>
      </aside>

      {/* Form area */}
      <div className="flex flex-1 flex-col">
        <header className="px-6 py-6 lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </header>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
