import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-12 text-center md:pt-28 md:pb-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted shadow-card">
          Pricing
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-ink md:text-6xl">
          Free while we’re in beta.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
          No monthly fee. No cut of your services. You keep 100% of every deposit — we just route
          it straight to your Stripe account.
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-20">
        <div className="relative flex flex-col rounded-xl2 border border-ink bg-ink p-8 text-cream shadow-lifted md:p-10">
          <p className="absolute -top-3 left-8 inline-flex w-fit items-center gap-1.5 rounded-full bg-clay px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cream shadow-sm">
            Beta
          </p>
          <p className="font-display text-2xl">Everything, free</p>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-display text-6xl tracking-tight">$0</span>
            <span className="text-sm text-cream/60">while in beta</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">
            The full product, no limits we’re hiding. We’ll add paid plans down the road — with
            notice — but everything below is yours today.
          </p>

          <Link href="/signup?role=braider" className="mt-7">
            <Button variant="secondary" size="lg" className="w-full">
              Start free
              <ArrowRight />
            </Button>
          </Link>

          <div className="mt-8 border-t border-cream/15 pt-6">
            <ul className="grid gap-3.5 text-sm sm:grid-cols-2">
              {included.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cream/15 text-cream">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="text-cream/90">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Stripe’s standard processing fee (~2.9% + 30¢) applies to each deposit and goes to Stripe,
          not us.
        </p>
      </section>

      <section className="border-y border-line bg-cream-deep/40">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="font-display text-3xl tracking-tight text-ink md:text-4xl">
            Questions braiders ask us
          </p>
          <dl className="mt-10 divide-y divide-line">
            {faqs.map(({ q, a }) => (
              <div key={q} className="py-6">
                <dt className="font-medium text-ink">{q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-muted">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="relative overflow-hidden rounded-xl2 bg-ink p-10 text-cream shadow-lifted md:p-16">
          <div className="absolute inset-0 bg-grid opacity-[0.15]" aria-hidden />
          <div className="relative">
            <p className="font-display text-3xl leading-tight tracking-tight md:text-4xl">
              One no-show is one too many.
            </p>
            <p className="mt-3 max-w-lg leading-relaxed text-cream/70">
              Most braiders we talk to lose 1–2 appointments a month to ghosting. Deposits up front
              stop that — and right now the whole thing is free.
            </p>
            <div className="mt-7">
              <Link href="/signup?role=braider">
                <Button variant="secondary" size="lg">
                  Start free
                  <ArrowRight />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
