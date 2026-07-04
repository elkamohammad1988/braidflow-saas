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
import { Reveal } from '@/components/motion/reveal';
import { Magnetic } from '@/components/motion/magnetic';
import { CountUp } from '@/components/motion/count-up';
import { AtelierBackdrop } from '@/components/marketing/atelier-backdrop';

const stats = [
  { to: 100, suffix: '%', label: 'of every deposit stays yours' },
  { to: 0, suffix: '%', label: 'commission on your services' },
  { to: 15, suffix: ' min', label: 'to set up your page' },
  { to: 90, suffix: 's', label: 'for a client to book on a phone' }
];

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

const steps = [
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
];

export default function Home() {
  return (
    <>
      {/* ───────────────────────── HERO — the night stage ───────────────────────── */}
      <section className="relative overflow-hidden bg-night text-cream">
        <AtelierBackdrop className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-grid-gold bg-radial-fade opacity-60" aria-hidden />
        {/* seam fade into the ivory page below */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-cream" aria-hidden />

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 pb-32 pt-20 md:grid-cols-[1.08fr_0.92fr] md:pb-40 md:pt-28">
          <div>
            <Reveal delay={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.07] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-gold-bright backdrop-blur-sm">
                <span className="flex h-1.5 w-1.5 rounded-full bg-gold-bright shadow-[0_0_8px_rgba(242,196,100,0.9)]" />
                Booking, made for braiders
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="mt-6 max-w-xl font-display text-[3.4rem] font-medium leading-[0.98] tracking-[-0.035em] text-cream sm:text-[4.25rem] md:text-[5.25rem]">
                Quit the DMs.
                <br />
                Get paid{' '}
                <span className="italic text-gilt [font-variation-settings:'opsz'_144]">up front.</span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-7 max-w-lg text-lg leading-relaxed text-cream/65">
                BraidFlow holds the deposit, locks in the slot, and keeps your week organized — so
                you can focus on the chair, not the back-and-forth.
              </p>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Magnetic strength={0.5}>
                  <Link href="/signup?role=braider">
                    <Button size="lg">
                      Set up your booking page
                      <ArrowRight />
                    </Button>
                  </Link>
                </Magnetic>
                <Link
                  href="/braiders"
                  className="group inline-flex items-center gap-2 rounded-full border border-cream/15 px-6 py-3.5 text-[15px] font-medium text-cream/85 transition-colors duration-200 hover:border-gold/40 hover:text-cream"
                >
                  Browse braiders
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={340}>
              <div className="mt-11 grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-7">
                {proofPoints.map((p) => (
                  <div key={p.label} className="flex items-center gap-2 text-sm text-cream/60">
                    <p.icon className="h-4 w-4 text-gold" strokeWidth={1.9} />
                    <span>{p.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={240} className="[--reveal-delay:240ms]">
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
                <div key={s.label} className="px-7 py-8">
                  <p className="font-display text-5xl font-medium tracking-tight text-ink">
                    <CountUp to={s.to} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-sm leading-snug text-ink-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── DEPOSIT VALUE PROP ───────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-14 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-20">
          <div>
            <Reveal>
              <p className="label flex items-center gap-2 text-clay-text">
                <span className="h-1 w-1 rounded-full bg-clay" />
                No-show protection
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-ink md:text-[3.25rem]">
                Deposits land before the appointment does.
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-muted">
                Clients pay a deposit to confirm — held by Stripe, refunded if you cancel, kept if
                they ghost. No more no-shows costing you a chair.
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
                  <span className="text-[15px] leading-relaxed text-ink">{v}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────────────── HOW IT WORKS ───────────────────────── */}
      <section className="border-y border-line bg-cream-deep/40">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <Reveal>
            <p className="label text-clay-text">The whole thing</p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-[-0.03em] text-ink md:text-5xl">
              Three steps. Then it runs itself.
            </h2>
          </Reveal>
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.n}
                delay={i * 110}
                className={i === 1 ? 'md:mt-10' : i === 2 ? 'md:mt-20' : ''}
              >
                <div className="group relative h-full overflow-hidden rounded-card border border-line bg-paper p-7 shadow-card transition-all duration-300 ease-spring hover:-translate-y-1.5 hover:shadow-lifted">
                  <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(224,163,63,0.14),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-onyx-soft to-night text-gold ring-1 ring-gold/20">
                      <step.icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="font-mono text-2xl text-clay/70">{step.n}</span>
                  </div>
                  <p className="mt-6 font-display text-xl font-medium text-ink">{step.t}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{step.d}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────────────────── TESTIMONIALS ───────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal>
          <p className="label text-clay-text">In their chairs</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-medium tracking-[-0.03em] text-ink md:text-5xl">
            Braiders running their whole week on it.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal as="figure" key={t.name} delay={i * 110} className={i === 1 ? 'md:-mt-6' : ''}>
              <figure className="flex h-full flex-col justify-between rounded-card border border-line bg-paper p-7 shadow-card transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-lifted">
                <div>
                  <div className="flex gap-0.5 text-gold">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-[15px] w-[15px] fill-current" strokeWidth={0} />
                    ))}
                  </div>
                  <blockquote className="mt-5 font-display text-[1.35rem] font-medium leading-[1.28] tracking-[-0.01em] text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-clay/25 to-plum/15 font-display text-base font-medium text-clay-deep">
                    {t.name[0]}
                  </span>
                  <div className="text-sm">
                    <p className="font-medium text-ink">{t.name}</p>
                    <p className="font-mono text-xs text-ink-subtle">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────────────── COMPARISON ───────────────────────── */}
      <section className="border-y border-line bg-cream-deep/40">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <Reveal>
            <p className="label text-clay-text">The honest version</p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-[-0.03em] text-ink md:text-5xl">
              Why not just use Square or Acuity?
            </h2>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-muted">
              You can. Plenty of braiders do, and they keep emailing us about the same gaps.
              Here&apos;s what changes when the tool was built for the work you actually do.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-12 overflow-hidden rounded-card border border-line bg-paper shadow-lifted">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-line bg-night px-6 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/50">
                <div>Feature</div>
                <div className="w-24 text-center text-gold">BraidFlow</div>
                <div className="w-24 text-center">Generic tools</div>
              </div>
              {comparisons.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-cream/50 ${
                    i !== comparisons.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <div className="text-ink">{row.feature}</div>
                  <div className="flex w-24 justify-center">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss/12 text-moss ring-1 ring-moss/15">
                      <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
                      <span className="sr-only">Included</span>
                    </span>
                  </div>
                  <div className="flex w-24 justify-center text-center text-xs text-ink-muted">
                    {row.them === false ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/[0.05]">
                        <X aria-hidden className="h-3.5 w-3.5 text-ink-subtle" strokeWidth={2.25} />
                        <span className="sr-only">Not included</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[11px]">{row.them}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── FAQ ───────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:py-28">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="label text-clay-text">Questions</p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-[-0.03em] text-ink md:text-[2.75rem]">
              Common questions, real answers.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">
              Still unsure?{' '}
              <a
                className="font-medium text-clay-deep underline decoration-clay/40 underline-offset-4 transition-colors hover:text-clay"
                href="mailto:hello@braidflow.app"
              >
                Email us
              </a>{' '}
              — a real person reads everything.
            </p>
          </Reveal>
          <dl className="divide-y divide-line">
            {faqs.map(({ q, a }, i) => (
              <Reveal as="div" key={q} delay={i * 70}>
                <div className="py-6">
                  <dt className="font-display text-lg font-medium text-ink">{q}</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-ink-muted">{a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────────────────────── FINAL CTA — bookend the night ───────────────────────── */}
      <section className="relative overflow-hidden bg-night text-cream">
        <AtelierBackdrop className="absolute inset-0 opacity-90" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cream to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center md:py-36">
          <Reveal>
            <p className="label mx-auto flex w-fit items-center gap-2 text-gold-bright">
              <span className="h-1 w-1 rounded-full bg-gold-bright" />
              Free while we&apos;re in beta
            </p>
          </Reveal>
          <Reveal delay={90}>
            <p className="mx-auto mt-6 max-w-2xl font-display text-[3rem] font-medium leading-[1.02] tracking-[-0.035em] md:text-[4.5rem]">
              Start free.
              <br />
              Keep <span className="italic text-gilt">what you earn.</span>
            </p>
          </Reveal>
          <Reveal delay={170}>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-cream/65">
              You keep 100% of every deposit. Set up your page in fifteen minutes — no credit card to
              start.
            </p>
          </Reveal>
          <Reveal delay={250}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Magnetic strength={0.5}>
                <Link href="/signup?role=braider">
                  <Button size="lg">
                    Set up your page
                    <ArrowRight />
                  </Button>
                </Link>
              </Magnetic>
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-cream/75 underline-offset-4 transition-colors hover:text-gold-bright"
              >
                See pricing
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
  return (
    <div className="relative mx-auto w-full max-w-sm animate-float md:max-w-none">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_50%_40%,rgba(224,163,63,0.35),transparent_70%)] blur-2xl" aria-hidden />
      <div className="overflow-hidden rounded-xl2 border border-cream/12 bg-paper shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7),0_0_0_1px_rgba(242,196,100,0.06)]">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 border-b border-line bg-cream-deep/60 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="ml-3 truncate font-mono text-[11px] text-ink-subtle">
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
              <p className="font-display text-lg font-medium leading-tight text-ink">Nia&apos;s Braids</p>
              <p className="font-mono text-[11px] text-ink-muted">Knotless · Brooklyn, NY</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-moss/10 px-2 py-0.5 text-[11px] font-medium text-moss ring-1 ring-moss/15">
              <span className="h-1.5 w-1.5 rounded-full bg-moss-bright" />
              Booking
            </span>
          </div>

          {/* service */}
          <div className="mt-5 rounded-card border border-clay/30 bg-gold/[0.06] p-3.5 ring-1 ring-gold/15">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Knotless braids — medium</p>
              <p className="text-sm font-semibold text-ink">$180</p>
            </div>
            <div className="mt-1.5 flex items-center gap-3 font-mono text-[11px] text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 5 hours
              </span>
              <span className="inline-flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5" /> $40 deposit
              </span>
            </div>
          </div>

          {/* slots */}
          <p className="label mt-5 text-ink-subtle">Saturday, Jun 14</p>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {['9:00 AM', '11:30 AM', '2:00 PM'].map((slot, i) => (
              <div
                key={slot}
                className={`rounded-lg border px-2 py-2 text-center font-mono text-[11px] font-medium ${
                  i === 1
                    ? 'border-gold bg-gradient-to-b from-gold-bright to-gold text-night shadow-glow-gold'
                    : 'border-line bg-paper text-ink-muted'
                }`}
              >
                {slot}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-5 flex items-center justify-between rounded-card bg-night px-4 py-3 text-cream">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-cream/50">
                Pay deposit to confirm
              </p>
              <p className="font-display text-lg font-medium leading-tight">$40.00</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-bright to-gold px-3.5 py-1.5 text-xs font-semibold text-night">
              <CreditCard className="h-3.5 w-3.5" />
              Pay &amp; book
            </span>
          </div>
        </div>
      </div>

      {/* floating confirmation chip */}
      <div className="absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 shadow-lifted sm:flex">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss/12 text-moss ring-1 ring-moss/15">
          <CalendarCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <span className="text-xs font-medium text-ink">Deposit secured</span>
      </div>
    </div>
  );
}
