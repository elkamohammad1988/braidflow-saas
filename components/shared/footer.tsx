import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Logo } from './logo';

const columns = [
  {
    key: 'product',
    links: [
      { key: 'findBraider', href: '/braiders' },
      { key: 'pricing', href: '/pricing' },
      { key: 'forBraiders', href: '/signup?role=braider' }
    ]
  },
  {
    key: 'account',
    links: [
      { key: 'login', href: '/login' },
      { key: 'createAccount', href: '/signup' },
      { key: 'myBookings', href: '/bookings' }
    ]
  },
  {
    key: 'company',
    links: [
      { key: 'contact', href: 'mailto:hello@braidflow.app' },
      { key: 'privacy', href: '/privacy' },
      { key: 'terms', href: '/terms' }
    ]
  }
];

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="relative overflow-hidden bg-night text-ivory/80">
      {/* woven hairline + faint gold aurora */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-56 w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(224,163,63,0.16),transparent_70%)] blur-2xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo tone="cream" />
            <p className="mt-4 text-sm leading-relaxed text-ivory/55">
              {t('tagline')}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.key}>
              <p className="label text-gold/70">{t(`columns.${col.key}.heading`)}</p>
              <ul className="mt-4 space-y-2.5 text-sm text-ivory/60">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-gold-bright"
                    >
                      {t(`columns.${col.key}.links.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-onyx-line pt-6 text-xs text-ivory/60 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('copyright', { year: String(new Date().getFullYear()) })}</p>
          <p className="flex items-center gap-2 font-mono uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-moss-bright shadow-[0_0_8px_rgba(92,138,90,0.8)]" />
            {t('securedByStripe')}
          </p>
        </div>
      </div>
    </footer>
  );
}
