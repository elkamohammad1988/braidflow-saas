# BraidFlow

A two-sided booking SaaS built specifically for braiders and protective-style
stylists. Clients browse, pick a service, and pay a deposit to confirm.
Braiders set their hours once and stop chasing down DMs all week.

This is a vertical Calendly for a $2B+ underserved market — not a generic
booking template.

---

## 📌 Case study

> A full-stack, two-sided booking SaaS that takes a real service-business pain —
> no-shows and DM-based scheduling — and solves it end to end: discovery,
> self-serve booking, up-front deposits, and an owner dashboard.

### What BraidFlow is

BraidFlow is a booking platform for braiders and protective-style stylists. It
has two sides: **clients** browse a directory, open a stylist's page, pick a
service and time slot, and pay a deposit to confirm; **braiders** get a
dashboard to manage services, availability, appointments, and refunds. Think
"Calendly + Stripe deposits" but purpose-built for 4–8 hour appointments where a
no-show costs a whole day of work.

### The problem it solves

Service providers who run on Instagram DMs lose real money to **no-shows** and
waste hours on **manual back-and-forth scheduling**. Generic tools (Square,
Acuity) are tuned for 30-minute slots and treat deposits as an afterthought.
BraidFlow makes the deposit the default: the slot isn't held until the client
has paid, which removes the financial incentive to ghost and protects the
provider's calendar.

### Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 14** (App Router, Server Components, Server Actions) |
| Database & Auth | **Supabase** (Postgres, Auth, Row-Level Security) |
| Payments | **Stripe** (PaymentIntents, Stripe Elements, Webhooks) |
| Email | **Resend** + **React Email** (transactional templates) |
| UI | **Tailwind CSS**, **lucide-react**, custom warm design system |
| Language | **TypeScript** (strict, `noUncheckedIndexedAccess`) + **Zod** validation |
| Hosting | **Vercel** (hourly cron for reminders) |

### Main features

- **Public discovery** — braider directory + SEO-friendly profile pages
- **Self-serve booking** — service picker, real-time availability, slot selection
- **Stripe deposits** — card checkout via Elements, webhook-confirmed bookings
- **Braider dashboard** — overview stats, calendar, appointments, clients, services, availability, settings
- **Lifecycle flows** — reschedule (deposit carries over), cancel, and Stripe refunds
- **Automated reminders** — 24h + 2h before each appointment via idempotent hourly cron
- **Transactional email** — confirmation, reminders, cancellation, reschedule, and refund templates

### Booking flow

1. Client opens a braider's page and selects a **service** + open **time slot**.
2. A server action creates the booking as `pending_payment`. A **Postgres GiST
   exclusion constraint** guarantees two clients can't claim the same slot —
   concurrency safety is enforced at the database, not the app.
3. The client is redirected to a Stripe-powered payment page to pay the deposit.
4. On successful payment the booking flips to `confirmed`, and confirmation
   emails go to both parties. The remaining balance is collected in person.

### Stripe deposit flow

- On booking, the server creates a **Stripe PaymentIntent** for the deposit and
  links it to a `payments` row.
- The client confirms the card with **Stripe Elements** on a dedicated pay page.
- Stripe's **webhook** (`payment_intent.succeeded`) is the source of truth: it
  promotes the booking to `confirmed`, marks the payment `succeeded`, and
  triggers emails. Handlers are **idempotent** (they check prior status), so
  duplicate webhook deliveries are safe.
- **Refunds** issue a Stripe refund and notify the client, with the same
  idempotent webhook handling.

### Supabase auth & database

- **Auth** — email/password via Supabase Auth. A signup trigger auto-creates a
  `profile` row with a `client` or `braider` role; middleware gates dashboard
  and booking routes.
- **Database** — a normalized Postgres schema (profiles, braiders, services,
  availability rules/overrides, bookings, payments, reviews) with ordered,
  forward-only migrations.
- **Security** — **Row-Level Security on every table** so clients only see their
  own bookings and braiders only their own data; the trust boundary lives in the
  database. Privileged operations use a service-role client server-side only.

### Why it's useful for service businesses

The pattern generalizes far beyond braiding — any appointment-based business
(barbers, tattoo artists, nail techs, cleaners, photographers, tutors,
consultants) shares the same needs:

- **Deposits kill no-shows** — money up front aligns incentives.
- **Self-serve booking replaces DMs** — clients book 24/7 without manual replies.
- **DB-level concurrency safety** — never double-book a slot, even under load.
- **Automated reminders & lifecycle emails** — fewer missed appointments, less admin.
- **Role-based, RLS-secured multi-tenant data** — a foundation that scales to many providers.

It's a reusable blueprint for "marketplace + payments + scheduling" SaaS,
demonstrating production patterns: server actions, webhook-driven state
machines, idempotency, and database-enforced invariants.

---

## Features (all built and wired)

- **Discovery + booking** — public braider directory, profile pages, slot picker
- **Stripe deposits** — PaymentIntents + Elements checkout, webhook-driven confirmation
- **DB-level slot safety** — Postgres GiST exclusion constraint prevents double-booking under concurrent writes
- **Braider dashboard** — services, weekly hours, day overrides, appointment list, refunds, settings
- **Client flow** — my bookings, reschedule (deposit carries over), cancel
- **Automated reminders** — 24h + 2h before appointment, via hourly cron, atomic and idempotent
- **Refunds** — Stripe refund flow with client notification
- **Transactional email** — Resend + React Email templates for confirmation, reminders, cancel, reschedule, refund
- **Marketing** — landing page with comparison table + testimonials + FAQ, pricing page, dynamic OG image, SVG favicon
- **Production hygiene** — RLS on every table, Zod on every server action, TypeScript strict with `noUncheckedIndexedAccess`

## Stack

- Next.js 14 (App Router, server components, server actions)
- Supabase (Postgres, Auth, Row-Level Security, Storage)
- Stripe (PaymentIntents + Webhooks)
- Resend + React Email
- Tailwind CSS — custom warm palette (ink / clay / moss / cream)

## Getting started

```bash
npm install        # or pnpm / yarn
cp .env.example .env.local
# fill in Supabase, Stripe, Resend, CRON_SECRET
```

### Database

Run the SQL in order against your Supabase project (SQL Editor or `psql`):

```bash
psql $SUPABASE_DB_URL -f db/schema.sql
psql $SUPABASE_DB_URL -f db/policies.sql
psql $SUPABASE_DB_URL -f db/migrations/0001_reminders.sql
psql $SUPABASE_DB_URL -f db/migrations/0002_refunds.sql
psql $SUPABASE_DB_URL -f db/migrations/0003_final_reminders.sql
psql $SUPABASE_DB_URL -f db/migrations/0004_reviews.sql
# optional demo data (see seed.sql header for the 2-account setup):
psql $SUPABASE_DB_URL -f db/seed.sql
```

Then regenerate types from your live schema:

```bash
npm run db:types
```

### Supabase Auth config

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: must match `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000`)
- **Redirect URLs**: add your production URL when you deploy

### Stripe

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the signing secret into STRIPE_WEBHOOK_SECRET
```

### Run

```bash
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel — framework auto-detected
3. Add all env vars from `.env.example`
4. Add your production URL to Supabase **Site URL** and as a Stripe webhook endpoint
5. Cron is configured in `vercel.json` — runs hourly automatically

## Layout

```
app/
  (marketing)/      landing, pricing — public, indexed
  (auth)/           login, signup
  (client)/         browse + book + my bookings + reschedule + pay
  (braider)/        dashboard, calendar, services, availability, clients, settings
  api/stripe/       webhook
  api/cron/         hourly reminder cron (24h + 2h)
  opengraph-image   dynamic 1200x630 OG image
  icon.svg          favicon
components/
  ui/               primitives (button, input, card, badge, spinner)
  shared/           navbar, footer, page header, empty state
  booking/          service list, slot picker, cancel/refund buttons
  braider/          braider card
lib/
  supabase/         browser / server / admin clients
  stripe/           server SDK + client-secret helper
  bookings/         availability computation, create/cancel/refund/reschedule actions, Zod schemas
  services/         service mutations + Zod schemas
  availability/     weekly rules + override mutations
  email/            send + notification orchestration + React Email templates
  auth/             session helpers
db/
  schema.sql        baseline tables + GiST exclusion constraint
  policies.sql      RLS policies
  migrations/       additive forward-only migrations
  seed.sql          example data
types/db.ts        Supabase-generated types
```

## Booking flow

1. Client picks service + slot on `/braiders/[slug]/book`
2. Server action `createBookingAction` inserts the booking (`status='pending_payment'`).
   The DB's exclusion constraint guarantees no two clients can claim the same slot.
3. Server creates a Stripe PaymentIntent for the deposit, links it to a `payments` row,
   and redirects to the payment page
4. Stripe Elements collects the card, client confirms
5. `payment_intent.succeeded` webhook flips the booking to `confirmed`,
   sets the payment to `succeeded`, sends confirmation emails to both parties
6. The hourly cron sends a 24h reminder, then a 2h reminder, atomically claimed
7. Balance is collected in person at the appointment

## Reschedule + refund

- **Reschedule** — client or braider can move a booking. Deposit carries over.
  Both reminder flags reset so the cron re-arms for the new time. The party
  who didn't initiate the move gets notified.
- **Refund** — braider can issue a refund from the appointment view. Stripe
  refund + client notification + idempotent webhook handling.

## What's intentionally not in this MVP

These are scoped out on purpose — straightforward extensions, not blockers:

- SMS reminders (email only — extend `lib/email/send.ts`-style abstraction with Twilio)
- Reviews write-form (DB schema + RLS + public read display are wired in `db/migrations/0004_reviews.sql` and `components/braider/reviews.tsx`; the post-appointment review form is the small remaining piece)
- Stripe Connect (deposits land in the platform Stripe account; add Connect onboarding for direct payouts)
- Multi-stylist studio accounts (Studio pricing tier is wired, the multi-braider data model is not)

## Selling this codebase?

See `SALES_LISTING.md` for the listing kit — pitch copy, screenshot list, demo
video script, Q&A, and negotiation playbook.
