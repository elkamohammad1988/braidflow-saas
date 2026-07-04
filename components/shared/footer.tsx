import Link from 'next/link';
import { Logo } from './logo';

const columns = [
  {
    heading: 'Product',
    links: [
      { label: 'Find a braider', href: '/braiders' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'For braiders', href: '/signup?role=braider' }
    ]
  },
  {
    heading: 'Account',
    links: [
      { label: 'Log in', href: '/login' },
      { label: 'Create account', href: '/signup' },
      { label: 'My bookings', href: '/bookings' }
    ]
  },
  {
    heading: 'Company',
    links: [
      { label: 'Contact', href: 'mailto:hello@braidflow.app' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' }
    ]
  }
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night text-cream/80">
      {/* woven hairline + faint gold aurora */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-56 w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(224,163,63,0.16),transparent_70%)] blur-2xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo tone="cream" />
            <p className="mt-4 text-sm leading-relaxed text-cream/55">
              The booking platform built for braiders. Take deposits, kill no-shows, and run your
              week without the DMs.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="label text-gold/70">{col.heading}</p>
              <ul className="mt-4 space-y-2.5 text-sm text-cream/60">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-gold-bright"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-onyx-line pt-6 text-xs text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BraidFlow. All rights reserved.</p>
          <p className="flex items-center gap-2 font-mono uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-moss-bright shadow-[0_0_8px_rgba(92,138,90,0.8)]" />
            Payments secured by Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}
