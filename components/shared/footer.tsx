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
    <footer className="border-t border-line bg-cream-deep/50">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              The booking platform built for braiders. Take deposits, kill no-shows, and run your
              week without the DMs.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                {col.heading}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BraidFlow. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" />
            Payments secured by Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}
