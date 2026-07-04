# BraidFlow — Portfolio & Bio Content

Ready-to-paste descriptions for every channel. First-person maker voice.
Live demo: **https://braidflow.vercel.app** · Author: **Mohammed El Kabouri** (@elkamohammad1988)

---

## One-line elevator pitch
A booking platform for hair braiders that collects the deposit up front — so a
no-show costs a text, not a whole day in the chair.

## Tagline
**Quit the DMs. Get paid up front.**

Alternates:
- Booking, built for the braider's chair — not the thirty-minute haircut.
- The slot isn't held until the deposit lands.

---

## Product summary (2–3 sentences)
BraidFlow is a booking-and-deposit platform built specifically for hair braiders.
Braiders get a shareable booking page that takes a deposit through Stripe before a slot
is confirmed, plus a dashboard that runs the whole week — services, availability,
clients, and revenue. It's a full-stack Next.js 14 product, deployed on Vercel, that
runs and ships with zero backend configuration.

---

## Homepage project description (portfolio site card / featured project)
**BraidFlow — booking & deposits for hair braiders**

Braiders lose real money to no-shows: a client is four to eight hours in the chair, so
one ghost booking burns a whole day. Every generic scheduler treats deposits as an
afterthought. I designed and built BraidFlow around the opposite idea — the deposit is
the default, and the slot isn't held until it's paid.

It's a two-sided product: a searchable braider marketplace and guest-checkout booking
flow on one side, a full braider dashboard (calendar, appointments, clients, services,
timezone-correct availability, Stripe Connect payouts) on the other. Built solo with
Next.js 14, TypeScript, Tailwind, and Stripe; deployed on Vercel with a swappable data
layer that lets the whole thing run with zero configuration.

**Role:** Solo — product design + full-stack engineering
**Stack:** Next.js 14 · TypeScript · Tailwind · Stripe · Vercel
**[Live demo →](https://braidflow.vercel.app)** · **[Case study →](../portfolio-case-study.md)**

---

## Resume project description

**Concise (1–2 lines, for a dense resume):**
> **BraidFlow** — Designed and built a full-stack, deposit-first booking platform for
> hair braiders (Next.js 14, TypeScript, Stripe Connect, Vercel). Two-sided marketplace
> + braider dashboard with timezone-correct scheduling; production-deployed with zero
> console/hydration errors and a swappable, zero-config data layer.

**Bulleted (for a projects section):**
> **BraidFlow — Booking & Deposits Platform** · *Solo · Next.js 14, TypeScript, Stripe, Vercel*
> - Built a deposit-first booking flow where Stripe webhooks drive a booking state
>   machine (`pending_payment → confirmed → completed/cancelled`), with cron-based
>   expiry of unpaid holds.
> - Shipped a full braider dashboard: weekly calendar, appointments, client roll-ups,
>   per-service deposits, and timezone-correct revenue/availability.
> - Architected a swappable data layer behind one interface, so the app builds and
>   deploys with zero configuration; verified clean production QA (0 console/hydration
>   errors, fully responsive).

---

## LinkedIn project description (Profile → Projects / Featured)
**BraidFlow — Booking & deposits for hair braiders**

I built BraidFlow to fix a specific, expensive problem: braiders book through Instagram
DMs, and a single no-show wipes out a four-to-eight-hour slot that can't be refilled. So
I made the deposit the default — clients pay through Stripe before a slot is held, and
the balance is paid in person.

It's a complete two-sided product: a braider marketplace with guest checkout, and a
dashboard that runs the week (calendar, clients, services, timezone-aware availability,
Stripe Connect payouts). Solo build — product design through full-stack engineering —
on Next.js 14, TypeScript, Tailwind, and Stripe, deployed on Vercel.

🔗 Live demo: https://braidflow.vercel.app

---

## GitHub project description (repo "About" field, <350 chars)
Booking & deposits for hair braiders. A shareable booking page that takes a Stripe
deposit before a slot is held, plus a full dashboard for the week. Next.js 14 ·
TypeScript · Stripe · Vercel. Deploys with zero config. Live demo → braidflow.vercel.app

**GitHub topics (repo tags):**
`nextjs` · `typescript` · `stripe` · `tailwindcss` · `booking-system` ·
`appointment-scheduling` · `saas` · `react` · `vercel` · `stripe-connect`
