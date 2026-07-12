import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShieldCheck, CreditCard, CalendarCheck, Star, Sparkles } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { GlassIcon } from '@/components/ui/glass-icon';

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
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-night p-10 text-ivory lg:flex 2xl:max-w-[44rem]">
        <div className="absolute inset-0 bg-aurora opacity-90" aria-hidden />
        <div className="absolute inset-0 bg-grid-gold bg-radial-fade opacity-60" aria-hidden />
        <div className="relative">
          <Link href="/" className="inline-flex transition-opacity hover:opacity-80">
            <Logo tone="cream" />
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
                <GlassIcon icon={h.icon} tone="accent" size="md" glow={false} />
                <span className="text-sm">{t(`panel.highlights.${h.key}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-card border border-line bg-ivory/[0.04] p-5 backdrop-blur-sm">
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
