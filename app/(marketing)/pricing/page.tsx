import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { Magnetic } from '@/components/motion/magnetic';
import { AtelierBackdrop } from '@/components/marketing/atelier-backdrop';

export const metadata: Metadata = {
  title: 'Pricing — BraidFlow',
  description:
    'BraidFlow is free while we’re in beta. No monthly fee, and we take 0% of your deposits — you keep 100%.',
  alternates: { canonical: '/pricing' }
};

// Everything listed here is shipped and working today. Paid plans are not built
// yet, so this page makes no claim about trials, booking limits, team seats,
// reports, or exports until those exist. Keep it honest.
const faqs = [
  { key: 'cost' },
  { key: 'alwaysFree' },
  { key: 'cut' },
  { key: 'clientPay' },
  { key: 'start' },
  { key: 'noStripe' }
];

export default function PricingPage() {
  const t = useTranslations('pricing');
  return (
    <>
      <section className="relative mx-auto max-w-5xl px-6 pb-12 pt-24 text-center md:pb-16 md:pt-32">
        <Reveal>
          <span className="label inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-clay-text shadow-card">
            <span className="h-1 w-1 rounded-full bg-clay" />
            {t('badge')}
          </span>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-[3.25rem] font-medium leading-[1.02] tracking-[-0.035em] text-ink md:text-[5rem]">
            {t.rich('title', {
              em: (chunks) => <span className="italic text-clay">{chunks}</span>
            })}
          </h1>
        </Reveal>
        <Reveal delay={170}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {t('subtitle')}
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-xl3 border border-onyx-line bg-night p-8 text-ivory shadow-lifted md:p-11">
            <AtelierBackdrop className="absolute inset-0 opacity-70" />
            <div className="relative">
              <p className="absolute -top-3 left-0 inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-bright to-gold px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-night shadow-glow-gold">
                {t('card.badge')}
              </p>
              <p className="pt-3 font-display text-2xl font-medium">{t('card.title')}</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-7xl font-medium tracking-tight text-gilt">$0</span>
                <span className="font-mono text-xs uppercase tracking-wider text-ivory/50">
                  {t('card.priceNote')}
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/65">
                {t('card.body')}
              </p>

              <Magnetic strength={0.35} className="mt-7 w-full">
                <Link href="/signup?role=braider" className="w-full">
                  <Button size="lg" className="w-full">
                    {t('startFree')}
                    <ArrowRight />
                  </Button>
                </Link>
              </Magnetic>

              <div className="mt-9 border-t border-onyx-line pt-7">
                <ul className="grid gap-3.5 text-sm sm:grid-cols-2">
                  {(t.raw('included') as string[]).map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-bright ring-1 ring-gold/25">
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="text-ivory/85">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>

        <p className="mt-6 text-center text-sm text-ink-muted">
          {t('stripeNote')}
        </p>
      </section>

      <section className="border-y border-line bg-cream-deep/40">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <Reveal>
            <p className="label text-clay">{t('faqLabel')}</p>
            <p className="mt-3 font-display text-4xl font-medium tracking-[-0.03em] text-ink md:text-5xl">
              {t('faqTitle')}
            </p>
          </Reveal>
          <dl className="mt-12 divide-y divide-line">
            {faqs.map((item, i) => (
              <Reveal as="div" key={item.key} delay={i * 60}>
                <div className="py-6">
                  <dt className="font-display text-lg font-medium text-ink">
                    {t(`faqs.${item.key}.q`)}
                  </dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                    {t(`faqs.${item.key}.a`)}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night text-ivory">
        <AtelierBackdrop className="absolute inset-0 opacity-90" />
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center md:py-36">
          <Reveal>
            <p className="mx-auto max-w-2xl font-display text-[2.75rem] font-medium leading-[1.04] tracking-[-0.035em] md:text-[4rem]">
              {t.rich('cta.title', {
                em: (chunks) => <span className="italic text-gilt">{chunks}</span>
              })}
            </p>
          </Reveal>
          <Reveal delay={110}>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-ivory/65">
              {t('cta.body')}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10 flex justify-center">
              <Magnetic strength={0.5}>
                <Link href="/signup?role=braider">
                  <Button size="lg">
                    {t('startFree')}
                    <ArrowRight />
                  </Button>
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
