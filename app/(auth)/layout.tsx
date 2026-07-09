import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShieldCheck, CreditCard, CalendarCheck, Star, Sparkles } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

const highlights = [
  { icon: CreditCard, key: 'deposits' },
  { icon: ShieldCheck, key: 'noshows' },
  { icon: CalendarCheck, key: 'autopilot' }
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('auth');
  return (
    <div className="flex min-h-screen">
      {/* Brand panel — the night atelier */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-night p-10 text-ivory lg:flex">
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
            {t.rich('panel.tagline', {
              em: (chunks) => <span className="italic text-gilt">{chunks}</span>
            })}
          </p>
          <ul className="mt-8 space-y-3.5">
            {highlights.map((h) => (
              <li key={h.key} className="flex items-center gap-3.5 text-ivory/85">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/20">
                  <h.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                <span className="text-sm">{t(`panel.highlights.${h.key}`)}</span>
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
            &ldquo;{t('panel.testimonial.quote')}&rdquo;
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-ivory/55">
            {t('panel.testimonial.author')}
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
          className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-12 lg:pb-6"
        >
          {children}

          {/* Honest demo access note — no real accounts exist; any credentials
              map to shared sample personas. Keeps the auth screens truthful. */}
          <div className="mt-8 rounded-card border border-line bg-cream-deep/40 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" strokeWidth={2} />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                {t('demo.title')}
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t('demo.body')}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-ink">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-clay" />
                <span>
                  {t.rich('demo.busyStudio', {
                    code: (chunks) => (
                      <span className="font-mono text-[0.8rem] text-ink">{chunks}</span>
                    )
                  })}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss" />
                <span>{t('demo.freshStudio')}</span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
