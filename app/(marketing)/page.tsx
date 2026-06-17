import Link from 'next/link';
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

const testimonials = [
  {
    quote:
      'I was losing two heads a week to no-shows. Deposits stopped it the first month. My calendar finally feels like mine.',
    name: 'Aisha O.',
    role: 'Box braids · Atlanta'
  },
  {
    quote:
      "Square was made for coffee shops, not 6-hour appointments. BraidFlow gets the work — deposits, durations, day blocks.",
    name: 'Nia M.',
    role: 'Knotless · Brooklyn'
  },
  {
    quote:
      'Setup took 15 minutes. The link in my bio finally does the work instead of me typing the same reply 40 times a week.',
    name: 'Kemi A.',
    role: 'Goddess locs · Houston'
  }
];

const faqs = [
  {
    q: 'How is this different from Square or Acuity?',
    a: "Those were built for 30-minute coffee shop slots. BraidFlow is built for 4–8 hour appointments where a no-show actually hurts. Deposits are the default, not an add-on. Service durations and day-blocks work the way braiders actually plan a week."
  },
  {
    q: 'Do my clients need an account to book?',
    a: 'No. They tap your link, pick a service, pick a slot, pay the deposit. Done. The whole flow takes about 90 seconds on a phone.'
  },
  {
    q: 'What happens to the deposit if I cancel?',
    a: "It's refunded automatically to the client's card. If they cancel inside your grace window (you set it), they get it back. After that, it's yours."
  },
  {
    q: "I'm not technical. Can I really set this up?",
    a: "Yes. If you can fill in your name, prices, and the days you work, you're done. Most braiders are live in under 15 minutes."
  }
];

const comparisons = [
  { feature: 'Built for 4–8 hour appointments', us: true, them: false },
  { feature: 'Deposits before booking confirms', us: true, them: 'Add-on / paid plan' },
  { feature: 'Day-blocks for vacations & life', us: true, them: 'Limited' },
  { feature: 'Per-service deposit amounts', us: true, them: false },
  { feature: 'No cut of your services', us: true, them: 'Some take 1–3%' },
  { feature: 'Set up in 15 minutes', us: true, them: false }
];

const proofPoints = [
  { icon: CreditCard, label: 'Deposits via Stripe' },
  { icon: ShieldCheck, label: 'No-show protection' },
  { icon: Smartphone, label: 'Mobile-first booking' },
  { icon: Sparkles, label: 'Free to start' }
];

const valueProps = [
  'Set your services, durations, and deposit amounts once.',
  "Block off days you're out — vacations, kids' events, whatever life looks like that week.",
  'Clients book themselves into the right slot. You see it on your calendar instantly.',
  'Balance is collected in person — same as you do it today.'
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-grid bg-radial-fade" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pt-16 pb-20 md:grid-cols-[1.05fr_0.95fr] md:pt-24 md:pb-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-ink-muted shadow-card">
              <span className="flex h-1.5 w-1.5 rounded-full bg-moss" />
              Booking, made for braiders
            </span>
            <h1 className="mt-5 max-w-xl font-display text-5xl leading-[1.04] tracking-tight text-ink md:text-6xl">
              Quit the DMs. Get paid up front.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-muted">
              BraidFlow holds the deposit, locks in the slot, and keeps your week organized — so you
              can focus on the chair, not the back-and-forth.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup?role=braider">
                <Button size="lg">
                  Set up your booking page
                  <ArrowRight />
                </Button>
              </Link>
              <Link href="/braiders">
                <Button variant="secondary" size="lg">
                  Browse braiders
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-7">
              {proofPoints.map((p) => (
                <div key={p.label} className="flex items-center gap-2 text-sm text-ink-muted">
                  <p.icon className="h-4 w-4 text-clay" strokeWidth={1.9} />
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          <HeroPreview />
        </div>
      </section>

      {/* DEPOSIT VALUE PROP */}
      <section className="bg-cream-deep/40">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 md:grid-cols-2 md:gap-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">
              No-show protection
            </span>
            <p className="mt-3 font-display text-3xl tracking-tight text-ink md:text-4xl">
              Deposits land before the appointment does.
            </p>
            <p className="mt-4 leading-relaxed text-ink-muted">
              Clients pay a deposit to confirm — held by Stripe, refunded if you cancel, kept if they
              ghost. No more no-shows costing you a chair.
            </p>
          </div>
          <ul className="space-y-4 text-sm">
            {valueProps.map((v) => (
              <li
                key={v}
                className="flex items-start gap-3 rounded-card border border-line bg-paper p-4 shadow-card"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/10 text-moss">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="text-ink">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="font-display text-3xl tracking-tight text-ink md:text-4xl">How it works</p>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              n: '01',
              icon: Sparkles,
              t: 'Build your page',
              d: 'Add your services, prices, and the days you take clients. Takes about ten minutes.'
            },
            {
              n: '02',
              icon: Smartphone,
              t: 'Share the link',
              d: 'Drop it in your bio. New clients book themselves — at any hour, no back-and-forth.'
            },
            {
              n: '03',
              icon: CalendarCheck,
              t: 'Show up and braid',
              d: 'Deposit is already in. You get a reminder the morning of. The week runs itself.'
            }
          ].map((step) => (
            <li
              key={step.n}
              className="rounded-card border border-line bg-paper p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-cream">
                  <step.icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="font-display text-2xl text-clay">{step.n}</span>
              </div>
              <p className="mt-4 font-medium text-ink">{step.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-line bg-cream-deep/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-display text-3xl tracking-tight text-ink md:text-4xl">
            Braiders running their week on it
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col justify-between rounded-card border border-line bg-paper p-6 shadow-card"
              >
                <div>
                  <div className="flex gap-0.5 text-clay">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
                    ))}
                  </div>
                  <blockquote className="mt-4 font-display text-lg leading-snug text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-clay/15 text-sm font-semibold text-clay">
                    {t.name[0]}
                  </span>
                  <div className="text-sm">
                    <p className="font-medium text-ink">{t.name}</p>
                    <p className="text-ink-muted">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <p className="font-display text-3xl tracking-tight text-ink md:text-4xl">
          Why not just use Square or Acuity?
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">
          You can. Plenty of braiders do, and they keep emailing us about the same gaps. Here&apos;s
          what changes when the tool was built for the work you actually do.
        </p>

        <div className="mt-10 overflow-hidden rounded-card border border-line bg-paper shadow-card">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-line bg-cream-deep/40 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            <div>Feature</div>
            <div className="w-24 text-center text-ink">BraidFlow</div>
            <div className="w-24 text-center">Generic tools</div>
          </div>
          {comparisons.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-4 text-sm ${
                i !== comparisons.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <div className="text-ink">{row.feature}</div>
              <div className="flex w-24 justify-center">
                {row.us === true ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss/12 text-moss">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                ) : (
                  <span className="text-ink-muted">{String(row.us)}</span>
                )}
              </div>
              <div className="flex w-24 justify-center text-center text-xs text-ink-muted">
                {row.them === false ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/[0.05]">
                    <X className="h-3.5 w-3.5 text-ink-subtle" strokeWidth={2.25} />
                  </span>
                ) : row.them === true ? (
                  <Check className="h-4 w-4 text-moss" strokeWidth={2.5} />
                ) : (
                  <span>{row.them}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-cream-deep/40">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="font-display text-3xl tracking-tight text-ink md:text-4xl">
            Common questions
          </p>
          <dl className="mt-10 divide-y divide-line">
            {faqs.map(({ q, a }) => (
              <div key={q} className="py-6">
                <dt className="font-medium text-ink">{q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-muted">{a}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 text-sm text-ink-muted">
            More questions?{' '}
            <a className="font-medium text-ink underline underline-offset-4" href="mailto:hello@braidflow.app">
              Email us
            </a>{' '}
            — a real person reads everything.
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="relative overflow-hidden rounded-xl2 bg-ink p-10 text-cream shadow-lifted md:p-16">
          <div className="absolute inset-0 bg-grid opacity-[0.15]" aria-hidden />
          <div className="relative">
            <p className="font-display text-3xl leading-tight tracking-tight md:text-4xl">
              Start free. Keep what you earn.
            </p>
            <p className="mt-3 max-w-lg leading-relaxed text-cream/70">
              Free while we’re in beta — and you keep 100% of every deposit. Set up your page in
              fifteen minutes, no credit card to start.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/signup?role=braider">
                <Button variant="secondary" size="lg">
                  Set up your page
                  <ArrowRight />
                </Button>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-sm font-medium text-cream/80 underline-offset-4 hover:text-cream hover:underline"
              >
                See pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* Stylized booking-page preview — demonstrates the actual product in the hero. */
function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm md:max-w-none">
      <div className="absolute -inset-4 -z-10 rounded-xl2 bg-clay/10 blur-2xl" aria-hidden />
      <div className="overflow-hidden rounded-xl2 border border-line bg-paper shadow-lifted">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 border-b border-line bg-cream-deep/50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="ml-3 truncate text-xs text-ink-subtle">braidflow.app/nia-braids</span>
        </div>

        <div className="p-5">
          {/* braider header */}
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clay/15 font-display text-lg text-clay">
              N
            </span>
            <div>
              <p className="font-display text-lg leading-tight text-ink">Nia&apos;s Braids</p>
              <p className="text-xs text-ink-muted">Knotless · Brooklyn, NY</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-moss/10 px-2 py-0.5 text-[11px] font-medium text-moss">
              <span className="h-1.5 w-1.5 rounded-full bg-moss" />
              Booking
            </span>
          </div>

          {/* service */}
          <div className="mt-5 rounded-card border border-ink/15 bg-cream/40 p-3.5 ring-1 ring-clay/20">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Knotless braids — medium</p>
              <p className="text-sm font-semibold text-ink">$180</p>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 5 hours
              </span>
              <span className="inline-flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5" /> $40 deposit
              </span>
            </div>
          </div>

          {/* slots */}
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
            Saturday, Jun 14
          </p>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {['9:00 AM', '11:30 AM', '2:00 PM'].map((slot, i) => (
              <div
                key={slot}
                className={`rounded-lg border px-2 py-2 text-center text-xs font-medium ${
                  i === 1
                    ? 'border-ink bg-ink text-cream'
                    : 'border-line bg-paper text-ink-muted'
                }`}
              >
                {slot}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-5 flex items-center justify-between rounded-card bg-ink px-4 py-3 text-cream">
            <div>
              <p className="text-[11px] text-cream/60">Pay deposit to confirm</p>
              <p className="font-display text-lg leading-tight">$40.00</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-1.5 text-xs font-semibold text-ink">
              <CreditCard className="h-3.5 w-3.5" />
              Pay & book
            </span>
          </div>
        </div>
      </div>

      {/* floating confirmation chip */}
      <div className="absolute -bottom-4 -left-4 hidden items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 shadow-lifted sm:flex">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss/12 text-moss">
          <CalendarCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <span className="text-xs font-medium text-ink">Deposit secured</span>
      </div>
    </div>
  );
}
