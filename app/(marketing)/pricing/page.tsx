import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Pricing — BraidFlow',
  description:
    'Simple, honest pricing for braiders. Start free, upgrade when you outgrow it. No cut of your services, ever.'
};

type Tier = {
  name: string;
  price: string;
  cadence?: string;
  blurb: string;
  cta: { label: string; href: string };
  highlighted?: boolean;
  features: string[];
};

const tiers: Tier[] = [
  {
    name: 'Starter',
    price: '$0',
    cadence: 'forever',
    blurb: 'Everything you need to take your first ten bookings online.',
    cta: { label: 'Start free', href: '/signup?role=braider' },
    features: [
      'Up to 10 bookings / month',
      'Stripe deposits (you keep 100%)',
      'Your own booking page',
      'Weekly availability + day blocks',
      'Email confirmations',
      'Mobile-friendly client view'
    ]
  },
  {
    name: 'Pro',
    price: '$29',
    cadence: '/ month',
    blurb: 'For braiders running a full week. Unlimited bookings and reminders that cut no-shows.',
    cta: { label: 'Start 14-day trial', href: '/signup?role=braider&plan=pro' },
    highlighted: true,
    features: [
      'Unlimited bookings',
      'Automatic 24h + 2h reminders',
      'Custom deposit per service',
      'Reschedule + cancel grace window',
      'Client notes + history',
      'Priority email support'
    ]
  },
  {
    name: 'Studio',
    price: '$79',
    cadence: '/ month',
    blurb: 'For shops with multiple chairs. Everything in Pro, plus team tools.',
    cta: { label: 'Talk to us', href: 'mailto:hello@braidflow.app?subject=Studio%20plan' },
    features: [
      'Up to 5 braiders on one account',
      'Per-braider availability + services',
      'Shared client list across the shop',
      'Revenue reports per braider',
      'Custom branding (logo, colors)',
      'Personal onboarding call'
    ]
  }
];

const faqs: { q: string; a: string }[] = [
  {
    q: 'Do you take a cut of my services?',
    a: "No. Ever. You pay a flat monthly price and keep 100% of what your clients pay. Stripe takes its standard processing fee on the deposit (~2.9% + 30¢); we don't add anything on top."
  },
  {
    q: 'What happens if I outgrow the free plan mid-month?',
    a: "You can still take the 11th booking — we'll never block a client from paying you. We'll let you know it's time to upgrade and give you the rest of the month to decide."
  },
  {
    q: 'Can I cancel anytime?',
    a: "Yes. Cancel in one click from your settings. You keep access until the end of the billing period and your data stays exportable forever."
  },
  {
    q: 'Do my clients pay anything to use BraidFlow?',
    a: "No. They book and pay the deposit — same flow they'd use on any salon site. They never see a BraidFlow fee."
  },
  {
    q: 'I share a shop with my sister / cousin / partner. Which plan?',
    a: "Studio. One account, separate calendars and services per braider, shared client list so you don't double-book each other."
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
          One flat price. You keep every dollar your clients pay.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
          Start free. Upgrade when your week gets busy enough that the cost pays for itself in one
          saved no-show.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid items-start gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'relative flex flex-col rounded-xl2 border p-8',
                tier.highlighted
                  ? 'border-ink bg-ink text-cream shadow-lifted md:-mt-3 md:pb-10'
                  : 'border-line bg-paper text-ink shadow-card'
              )}
            >
              {tier.highlighted && (
                <p className="absolute -top-3 left-8 inline-flex w-fit items-center gap-1.5 rounded-full bg-clay px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cream shadow-sm">
                  Most popular
                </p>
              )}
              <p className="font-display text-2xl">{tier.name}</p>
              <p className={cn('mt-3 text-sm leading-relaxed', tier.highlighted ? 'text-cream/70' : 'text-ink-muted')}>
                {tier.blurb}
              </p>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-5xl tracking-tight">{tier.price}</span>
                {tier.cadence && (
                  <span className={cn('text-sm', tier.highlighted ? 'text-cream/60' : 'text-ink-muted')}>
                    {tier.cadence}
                  </span>
                )}
              </div>

              <Link href={tier.cta.href} className="mt-6">
                <Button
                  variant={tier.highlighted ? 'secondary' : 'primary'}
                  size="lg"
                  className="w-full"
                >
                  {tier.cta.label}
                  <ArrowRight />
                </Button>
              </Link>

              <div
                className={cn(
                  'mt-8 border-t pt-6',
                  tier.highlighted ? 'border-cream/15' : 'border-line'
                )}
              >
                <ul className="space-y-3.5 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span
                        className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                          tier.highlighted ? 'bg-cream/15 text-cream' : 'bg-moss/10 text-moss'
                        )}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                      <span className={tier.highlighted ? 'text-cream/90' : 'text-ink'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-ink-muted">
          All plans include unlimited services, RLS-protected data, and one-click data export.
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
              One no-show pays for the year.
            </p>
            <p className="mt-3 max-w-lg leading-relaxed text-cream/70">
              Most braiders we talk to lose 1–2 appointments a month to ghosting. Deposits up front
              stop that.
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
