import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight } from 'lucide-react';
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
const included = [
  'Your own branded booking page',
  'Stripe deposits — you keep 100%',
  'Weekly availability + day blocks',
  'Per-service deposit amounts',
  'Automatic 24h + 2h email reminders',
  'Reschedule + cancel with a refund window you set',
  'Client notes and booking history',
  'Reviews from completed appointments'
];

const faqs: { q: string; a: string }[] = [
  {
    q: 'How much does BraidFlow cost?',
    a: "It's free while we're in beta. There's no monthly fee, and we take 0% of your deposits — you keep every dollar. Stripe charges its standard processing fee (~2.9% + 30¢) on the deposit; that goes to Stripe, not us."
  },
  {
    q: 'Will it always be free?',
    a: "We'll introduce paid plans later as we add more. You'll get plenty of notice before anything changes, and we'll never switch a feature you're relying on to paid without telling you first."
  },
  {
    q: 'Do you take a cut of my services?',
    a: 'No. During the beta our commission is 0%. Deposits go straight to your connected Stripe account — we never touch the money beyond routing it to you.'
  },
  {
    q: 'Do my clients pay anything to use BraidFlow?',
    a: 'No. They book and pay their deposit — the same flow they’d use on any salon site. They never see a BraidFlow fee.'
  },
  {
    q: 'What do I need to start taking deposits?',
    a: 'A Stripe account. You connect it from your dashboard in about two minutes (Stripe handles the details), and then clients can book. Until it’s connected, your booking page stays paused.'
  },
  {
    q: "What if Stripe isn't available in my country?",
    a: "Right now BraidFlow runs on Stripe, so you need a country Stripe supports. If you're somewhere it doesn't, email us — we're tracking demand and will add alternatives based on it."
  }
];

export default function PricingPage() {
  return (
    <>
      <section className="relative mx-auto max-w-5xl px-6 pb-12 pt-24 text-center md:pb-16 md:pt-32">
        <Reveal>
          <span className="label inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-clay-text shadow-card">
            <span className="h-1 w-1 rounded-full bg-clay" />
            Pricing
          </span>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-[3.25rem] font-medium leading-[1.02] tracking-[-0.035em] text-ink md:text-[5rem]">
            Free while we&apos;re in <span className="italic text-clay">beta.</span>
          </h1>
        </Reveal>
        <Reveal delay={170}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            No monthly fee. No cut of your services. You keep 100% of every deposit — we just route
            it straight to your Stripe account.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-xl3 border border-onyx-line bg-night p-8 text-cream shadow-lifted md:p-11">
            <AtelierBackdrop className="absolute inset-0 opacity-70" />
            <div className="relative">
              <p className="absolute -top-3 left-0 inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-bright to-gold px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-night shadow-glow-gold">
                Beta
              </p>
              <p className="pt-3 font-display text-2xl font-medium">Everything, free</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-7xl font-medium tracking-tight text-gilt">$0</span>
                <span className="font-mono text-xs uppercase tracking-wider text-cream/50">
                  while in beta
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/65">
                The full product, no limits we&apos;re hiding. We&apos;ll add paid plans down the
                road — with notice — but everything below is yours today.
              </p>

              <Magnetic strength={0.35} className="mt-7 w-full">
                <Link href="/signup?role=braider" className="w-full">
                  <Button size="lg" className="w-full">
                    Start free
                    <ArrowRight />
                  </Button>
                </Link>
              </Magnetic>

              <div className="mt-9 border-t border-onyx-line pt-7">
                <ul className="grid gap-3.5 text-sm sm:grid-cols-2">
                  {included.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-bright ring-1 ring-gold/25">
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="text-cream/85">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Stripe&apos;s standard processing fee (~2.9% + 30¢) applies to each deposit and goes to
          Stripe, not us.
        </p>
      </section>

      <section className="border-y border-line bg-cream-deep/40">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <Reveal>
            <p className="label text-clay">Questions braiders ask us</p>
            <p className="mt-3 font-display text-4xl font-medium tracking-[-0.03em] text-ink md:text-5xl">
              The fine print, in plain words.
            </p>
          </Reveal>
          <dl className="mt-12 divide-y divide-line">
            {faqs.map(({ q, a }, i) => (
              <Reveal as="div" key={q} delay={i * 60}>
                <div className="py-6">
                  <dt className="font-display text-lg font-medium text-ink">{q}</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-ink-muted">{a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night text-cream">
        <AtelierBackdrop className="absolute inset-0 opacity-90" />
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center md:py-36">
          <Reveal>
            <p className="mx-auto max-w-2xl font-display text-[2.75rem] font-medium leading-[1.04] tracking-[-0.035em] md:text-[4rem]">
              One no-show is <span className="italic text-gilt">one too many.</span>
            </p>
          </Reveal>
          <Reveal delay={110}>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-cream/65">
              Most braiders we talk to lose 1–2 appointments a month to ghosting. Deposits up front
              stop that — and right now the whole thing is free.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10 flex justify-center">
              <Magnetic strength={0.5}>
                <Link href="/signup?role=braider">
                  <Button size="lg">
                    Start free
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
