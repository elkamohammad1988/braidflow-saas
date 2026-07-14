import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Check,
  X,
  Star,
  CreditCard,
  Clock,
  CalendarCheck,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassIcon } from '@/components/ui/glass-icon';
import { Reveal } from '@/components/motion/reveal';
import { Magnetic } from '@/components/motion/magnetic';
import { CountUp } from '@/components/motion/count-up';
import { BRAID_PHOTOS, STUDIO_PHOTOS, IMAGE_BLUR } from '@/lib/media';
import { AtelierBackdrop } from '@/components/marketing/atelier-backdrop';
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

// Title/description inherit the root defaults (this is the home page); set an
// explicit self-canonical so `/` never competes with a query-string variant.
export const metadata: Metadata = {
  alternates: { canonical: '/' }
};

const stats = [
  { to: 100, key: 'deposit' },
  { to: 0, key: 'commission' },
  { to: 15, key: 'setup' },
  { to: 90, key: 'booking' }
];

const testimonials = [{ key: 'aisha' }, { key: 'nia' }, { key: 'kemi' }];

const faqs = [{ key: 'different' }, { key: 'account' }, { key: 'cancel' }, { key: 'technical' }];

const comparisons = [
  { key: 'longAppts', us: true, them: false },
  { key: 'deposits', us: true, them: 'addon' },
  { key: 'dayBlocks', us: true, them: 'limited' },
  { key: 'perService', us: true, them: false },
  { key: 'noCut', us: true, them: 'someCut' },
  { key: 'quickSetup', us: true, them: false }
] as const;

const proofPoints = [
  { icon: CreditCard, key: 'deposits' },
  { icon: ShieldCheck, key: 'noShow' },
  { icon: Smartphone, key: 'mobile' },
  { icon: Sparkles, key: 'free' }
] as const;

const valueProps = ['setup', 'blocks', 'selfBook', 'balance'];

const steps = [
  { n: '01', icon: Sparkles, key: 'build' },
  { n: '02', icon: Smartphone, key: 'share' },
  { n: '03', icon: CalendarCheck, key: 'show' }
];

export default function Home() {
  const t = useTranslations('landing');
  return (
    <>
      {/* ───────────────────────── HERO — the night stage ───────────────────────── */}
      <section className="relative overflow-hidden bg-night text-ivory">
        <AtelierBackdrop className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-grid-gold bg-radial-fade opacity-60" aria-hidden />
        {/* seam fade into the ivory page below */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-cream" aria-hidden />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-20 md:grid-cols-[1.08fr_0.92fr] md:pb-32 md:pt-28">
          <div>
            <Reveal delay={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.07] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-clay-soft backdrop-blur-sm dark:text-gold-bright">
                <span className="flex h-1.5 w-1.5 rounded-full bg-gold-bright shadow-[0_0_8px_rgb(var(--accent-glow-3)/0.9)]" />
                {t('eyebrow')}
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="mt-6 max-w-xl break-words font-display text-[clamp(2.5rem,10vw,3.4rem)] font-medium leading-[0.98] tracking-[-0.035em] text-ivory sm:text-[4.25rem] md:text-[5.25rem]">
                {t.rich('title', {
                  br: () => <br />,
                  em: (chunks) => (
                    <span className="italic text-gilt [font-variation-settings:'opsz'_144]">
                      {chunks}
                    </span>
                  )
                })}
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ivory/65">
                {t('subtitle')}
              </p>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Magnetic strength={0.5}>
                  <Link href="/signup?role=braider">
                    <Button size="lg">
                      {t('ctaPrimary')}
                      <ArrowRight />
                    </Button>
                  </Link>
                </Magnetic>
                <Link
                  href="/braiders"
                  className="group inline-flex items-center gap-2 rounded-full border border-ivory/15 px-6 py-3.5 text-[15px] font-medium text-ivory/85 transition-colors duration-200 hover:border-gold/40 hover:text-ivory"
                >
                  {t('ctaSecondary')}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={340}>
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-7">
                {proofPoints.map((p) => (
                  <div key={p.key} className="flex items-center gap-2 text-sm text-ivory/75">
                    <p.icon aria-hidden className="h-4 w-4 text-clay-soft dark:text-gold" strokeWidth={1.9} />
                    <span>{t(`proof.${p.key}`)}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal>
            <HeroPreview />
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── STATS ───────────────────────── */}
      <section className="relative -mt-10">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="relative overflow-hidden rounded-xl3 border border-line bg-paper shadow-lifted">
            <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 md:grid-cols-4 md:divide-x">
              {stats.map((s) => (
                <div key={s.key} className="px-6 py-7">
                  <p className="font-display text-5xl font-medium tracking-tight text-ink">
                    <CountUp to={s.to} suffix={t(`stats.suffix.${s.key}`)} />
                  </p>
                  <p className="mt-2 text-sm leading-snug text-ink-muted">
                    {t(`stats.label.${s.key}`)}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── DEPOSIT VALUE PROP ───────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-16">
          <div>
            <Reveal>
              <p className="label flex items-center gap-2 text-clay-text">
                <span className="h-1 w-1 rounded-full bg-clay" />
                {t('deposit.label')}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-ink md:text-[3.25rem]">
                {t('deposit.title')}
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-muted">
                {t('deposit.body')}
              </p>
            </Reveal>
          </div>

          <ul className="space-y-3.5">
            {valueProps.map((v, i) => (
              <Reveal as="li" key={v} delay={i * 90}>
                <div className="group flex items-start gap-4 rounded-card border border-line bg-paper p-5 shadow-card transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-clay/25 hover:shadow-lifted">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss/10 text-moss ring-1 ring-moss/15">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="text-[15px] leading-relaxed text-ink">
                    {t(`deposit.props.${v}`)}
                  </span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────────────── HOW IT WORKS ───────────────────────── */}
      <section className="border-y border-line bg-cream-deep/40">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <Reveal>
            <p className="label text-clay-text">{t('how.label')}</p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-[-0.03em] text-ink md:text-5xl">
              {t('how.title')}
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.n}
                delay={i * 110}
                className={i === 1 ? 'md:mt-10' : i === 2 ? 'md:mt-20' : ''}
              >
                <div className="group relative h-full overflow-hidden rounded-card border border-line bg-paper p-6 shadow-card transition-all duration-300 ease-spring hover:-translate-y-1.5 hover:shadow-lifted">
                  <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgb(var(--accent-glow)/0.14),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="flex items-center justify-between">
                    <GlassIcon icon={step.icon} tone="accent" size="md" />
                    <span className="font-mono text-2xl text-clay/70">{step.n}</span>
                  </div>
                  <p className="mt-6 font-display text-xl font-medium text-ink">
                    {t(`how.steps.${step.key}.title`)}
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                    {t(`how.steps.${step.key}.desc`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────────────────── CRAFT STRIP — a photographic breather ───────────────────────── */}
      <section aria-hidden className="relative">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { src: BRAID_PHOTOS.boxBraidsTop, hideMobile: false },
            { src: STUDIO_PHOTOS.warmInterior, hideMobile: false },
            { src: BRAID_PHOTOS.sectionsClose, hideMobile: true },
            { src: BRAID_PHOTOS.longBeaded, hideMobile: true }
          ].map((im, i) => (
            <div
              key={i}
              className={`relative aspect-[4/5] overflow-hidden md:aspect-square ${
                im.hideMobile ? 'hidden md:block' : ''
              }`}
            >
              <Image
                src={im.src}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR}
                className="object-cover transition-transform duration-300 ease-spring hover:scale-[1.05]"
              />
            </div>
          ))}
        </div>
        {/* seam fades so the band melts into the cream sections above and below */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cream-deep/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cream to-transparent" />
      </section>

      {/* ───────────────────────── TESTIMONIALS ───────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <Reveal>
          <p className="label text-clay-text">{t('testimonials.label')}</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-medium tracking-[-0.03em] text-ink md:text-5xl">
            {t('testimonials.title')}
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-ink-subtle">{t('testimonials.disclaimer')}</p>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((item, i) => (
            <Reveal as="figure" key={item.key} delay={i * 110} className={i === 1 ? 'md:-mt-6' : ''}>
              <figure className="flex h-full flex-col justify-between rounded-card border border-line bg-paper p-6 shadow-card transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-lifted">
                <div>
                  <div className="flex gap-0.5 text-gold">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} aria-hidden className="h-[15px] w-[15px] fill-current" strokeWidth={0} />
                    ))}
                  </div>
                  <blockquote className="mt-5 font-display text-[1.35rem] font-medium leading-[1.28] tracking-[-0.01em] text-ink">
                    &ldquo;{t(`testimonials.items.${item.key}.quote`)}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-clay/25 to-plum/15 font-display text-base font-medium text-clay-deep">
                    {t(`testimonials.items.${item.key}.name`).charAt(0)}
                  </span>
                  <div className="text-sm">
                    <p className="font-medium text-ink">
                      {t(`testimonials.items.${item.key}.name`)}
                    </p>
                    <p className="font-mono text-xs text-ink-subtle">
                      {t(`testimonials.items.${item.key}.role`)}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────────────── COMPARISON ───────────────────────── */}
      <section className="border-y border-line bg-cream-deep/40">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <Reveal>
            <p className="label text-clay-text">{t('comparison.label')}</p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-[-0.03em] text-ink md:text-5xl">
              {t('comparison.title')}
            </h2>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-muted">
              {t('comparison.body')}
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-10 overflow-hidden rounded-card border border-line bg-paper shadow-lifted">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-line bg-night px-4 py-4 font-mono text-[10px] uppercase tracking-normal text-ivory/70 sm:gap-4 sm:px-6 sm:text-[11px] sm:tracking-[0.14em]">
                <div>{t('comparison.feature')}</div>
                <div className="w-16 text-center text-clay-soft sm:w-24 dark:text-gold-bright">BraidFlow</div>
                <div className="w-16 text-center sm:w-24">{t('comparison.genericTools')}</div>
              </div>
              {comparisons.map((row, i) => (
                <div
                  key={row.key}
                  className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-4 text-sm transition-colors hover:bg-ink/[0.04] sm:gap-4 sm:px-6 ${
                    i !== comparisons.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <div className="text-ink">{t(`comparison.features.${row.key}`)}</div>
                  <div className="flex w-16 justify-center sm:w-24">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss/12 text-moss ring-1 ring-moss/15">
                      <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
                      <span className="sr-only">{t('comparison.included')}</span>
                    </span>
                  </div>
                  <div className="flex w-16 justify-center text-center text-xs text-ink-muted sm:w-24">
                    {row.them === false ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/[0.05]">
                        <X aria-hidden className="h-3.5 w-3.5 text-ink-subtle" strokeWidth={2.25} />
                        <span className="sr-only">{t('comparison.notIncluded')}</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[11px]">
                        {t(`comparison.themValues.${row.them}`)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── FAQ ───────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="label text-clay-text">{t('faq.label')}</p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-[-0.03em] text-ink md:text-[2.75rem]">
              {t('faq.title')}
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">
              {t.rich('faq.stillUnsure', {
                a: (chunks) => (
                  <a
                    className="font-medium text-clay-deep underline decoration-clay/40 underline-offset-4 transition-colors hover:text-clay"
                    href="mailto:hello@braidflow.app"
                  >
                    {chunks}
                  </a>
                )
              })}
            </p>
          </Reveal>
          <dl className="divide-y divide-line">
            {faqs.map((item, i) => (
              <Reveal as="div" key={item.key} delay={i * 70}>
                <div className="py-5">
                  <dt className="font-display text-lg font-medium text-ink">
                    {t(`faq.items.${item.key}.q`)}
                  </dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                    {t(`faq.items.${item.key}.a`)}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────────────────────── FINAL CTA — bookend the night ───────────────────────── */}
      <section className="relative overflow-hidden bg-night text-ivory">
        <AtelierBackdrop className="absolute inset-0 opacity-90" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cream to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <Reveal>
            <p className="label mx-auto flex w-fit items-center gap-2 text-clay-soft dark:text-gold-bright">
              <span className="h-1 w-1 rounded-full bg-gold-bright" />
              {t('finalCta.badge')}
            </p>
          </Reveal>
          <Reveal delay={90}>
            <p className="mx-auto mt-6 max-w-2xl break-words font-display text-[clamp(2.25rem,9vw,3rem)] font-medium leading-[1.02] tracking-[-0.035em] md:text-[4.5rem]">
              {t.rich('finalCta.title', {
                br: () => <br />,
                em: (chunks) => <span className="italic text-gilt">{chunks}</span>
              })}
            </p>
          </Reveal>
          <Reveal delay={170}>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-ivory/65">
              {t('finalCta.body')}
            </p>
          </Reveal>
          <Reveal delay={250}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Magnetic strength={0.5}>
                <Link href="/signup?role=braider">
                  <Button size="lg">
                    {t('finalCta.cta')}
                    <ArrowRight />
                  </Button>
                </Link>
              </Magnetic>
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-ivory/75 underline-offset-4 transition-colors hover:text-clay-soft dark:hover:text-gold-bright"
              >
                {t('finalCta.seePricing')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* Stylized booking-page preview — the product itself, glowing on the dark stage. */
function HeroPreview() {
  const t = useTranslations('landing');
  return (
    // The preview is a snapshot of the product's own UI, so it keeps LTR even in RTL locales.
    <div dir="ltr" className="relative mx-auto w-full max-w-sm md:max-w-none">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_50%_40%,rgb(var(--accent-glow)/0.35),transparent_70%)] blur-2xl" aria-hidden />
      <div className="overflow-hidden rounded-xl2 border border-line bg-paper shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45),0_0_0_1px_rgb(var(--accent-glow-3)/0.08)]">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 border-b border-line bg-cream-deep/60 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="ms-3 truncate font-mono text-[11px] text-ink-subtle">
            braidflow.app/nia-braids
          </span>
        </div>

        <div className="p-5">
          {/* braider header */}
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-clay/25 to-plum/15 font-display text-lg font-medium text-clay-deep">
              N
            </span>
            <div>
              <p className="font-display text-lg font-medium leading-tight text-ink">{t('preview.name')}</p>
              <p className="font-mono text-[11px] text-ink-muted">{t('preview.location')}</p>
            </div>
            <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-moss/10 px-2 py-0.5 text-[11px] font-medium text-moss ring-1 ring-moss/15">
              <span className="h-1.5 w-1.5 rounded-full bg-moss-bright" />
              {t('preview.status')}
            </span>
          </div>

          {/* service */}
          <div className="mt-5 rounded-card border border-clay/30 bg-gold/[0.06] p-3.5 ring-1 ring-gold/15">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">{t('preview.service')}</p>
              <p className="text-sm font-semibold text-ink">$180</p>
            </div>
            <div className="mt-1.5 flex items-center gap-3 font-mono text-[11px] text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <Clock aria-hidden className="h-3.5 w-3.5" /> {t('preview.duration')}
              </span>
              <span className="inline-flex items-center gap-1">
                <Wallet aria-hidden className="h-3.5 w-3.5" /> {t('preview.deposit')}
              </span>
            </div>
          </div>

          {/* slots */}
          <p className="label mt-5 text-ink-subtle">{t('preview.date')}</p>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {(t.raw('preview.slots') as string[]).map((slot, i) => (
              <div
                key={slot}
                className={`rounded-lg border px-2 py-2 text-center font-mono text-[11px] font-medium ${
                  i === 1
                    ? 'border-gold bg-gradient-to-b from-gold-bright to-gold text-on-accent shadow-glow-gold'
                    : 'border-line bg-paper text-ink-muted'
                }`}
              >
                {slot}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-5 flex items-center justify-between rounded-card bg-night px-4 py-3 text-ivory">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-ivory/50">
                {t('preview.payLabel')}
              </p>
              <p className="font-display text-lg font-medium leading-tight">$40.00</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-bright to-gold px-3.5 py-1.5 text-xs font-semibold text-on-accent">
              <CreditCard aria-hidden className="h-3.5 w-3.5" />
              {t('preview.payButton')}
            </span>
          </div>
        </div>
      </div>

      {/* floating confirmation chip */}
      <div className="absolute -bottom-5 -start-5 hidden items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 shadow-lifted sm:flex">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss/12 text-moss ring-1 ring-moss/15">
          <CalendarCheck aria-hidden className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <span className="text-xs font-medium text-ink">{t('preview.secured')}</span>
      </div>
    </div>
  );
}
