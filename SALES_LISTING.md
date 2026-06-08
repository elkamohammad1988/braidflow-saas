# BraidFlow — sales listing kit

Copy-paste this into Acquire.com, Flippa, IndieHackers, or anywhere you list the
project. Everything is organized so you can paste section by section.

---

## Listing title (max 70 chars)

**BraidFlow — niche booking SaaS for braiders. Stripe deposits. Production-ready.**

Alternates if the first is taken:
- BraidFlow · Booking + deposits for braiders (Next.js + Supabase + Stripe)
- Vertical booking SaaS — built for the $2B braiding industry

---

## One-line tagline

> A vertical Calendly for braiders — deposits up front, day-blocks for life, no-shows solved.

---

## Asking price

**$3,000** (code only, no users yet — priced for a fast, clean sale)

Floor: $2,400. Below that, walk.
Ceiling: $4,000 if a buyer matches the niche and you can show a Loom of the
full flow working end-to-end.

Why $3,000 and not more: this is a pre-revenue code asset. $3,000 is the price
that actually closes in days, not months. The code is production-grade and
builds clean (`npm run typecheck`, `npm run build`, `npm run lint` all pass),
so a competent buyer is live in an afternoon. If you'd rather hold out for
$8K–12K, you can — but expect a much longer search for the right buyer.

If you onboard one paying braider before listing: you can comfortably bump
asking to **$6,000+**.

---

## The pitch (paste as listing description)

### What is it?

BraidFlow is a production-ready, two-sided booking SaaS built specifically for
braiders and protective-style stylists. Clients browse, pick a service, and pay
a deposit to confirm. Braiders set their hours once and stop chasing DMs all
week.

It is **not** another Calendly clone. It is a vertical SaaS with opinionated
features for a real, underserved $2B+ market:

- 4–8 hour appointments (not 30-min slots)
- Mandatory deposits to kill no-shows
- Day-blocks for life (kids, holidays, sick days)
- Per-service deposit amounts
- Reschedule + grace-window refunds

### Why this niche?

- Braiders lose $400–$1,200/month to no-shows on average
- Square and Acuity were built for 30-min coffee-shop slots and aren't workable for protective-style appointments
- This community lives on Instagram DMs and is begging for tooling — search "braider booking app" on TikTok
- Recurring SaaS pricing model: Free / Pro $29 / Studio $79 ($60K ARR at 200 Pro subscribers)

### What's included?

**Tech stack** (every piece is current, idiomatic, and production-grade):
- Next.js 14 App Router (server components, server actions)
- Supabase (Postgres + Auth + Row-Level Security on every table)
- Stripe PaymentIntents (deposits, refunds, full webhook handling)
- Resend + React Email (transactional emails, templates included)
- Tailwind CSS with a custom brand system (warm, professional palette)
- TypeScript strict mode with `noUncheckedIndexedAccess`
- Zod validation on every server action

**Working features** (no stubs, no TODOs):
- Full booking flow: browse → service → slot → pay → confirm
- Stripe Elements checkout for deposit collection
- Webhook-driven booking state machine (`pending_payment` → `confirmed`)
- DB-level double-booking prevention (Postgres GiST exclusion constraint)
- Braider dashboard: services, weekly hours, day-overrides, appointments, refunds, settings
- Client flow: my bookings, reschedule, cancel, post-pay confirmation
- Automated 24h + 2h appointment reminders via hourly cron
- Refund flow (Stripe refunds + email notifications)
- Reschedule flow (deposit carries over, both reminders re-armed)
- Transactional email templates: confirmation, reminder (24h + 2h), cancellation, reschedule, refund
- Landing page with comparison table, testimonials, FAQ
- Pricing page (3 tiers, FAQ)

**Database**:
- 8 tables, fully normalized
- RLS policies on every table
- GiST exclusion constraint for slot-level concurrency safety
- Auth trigger that auto-creates profile + role on signup
- Migrations folder with reversible, ordered SQL
- Seed file for local dev

**Branding**:
- Custom logo (SVG)
- Dynamic OG image generator (Next.js `next/og`)
- Open Graph + Twitter meta tags
- Warm, distinct color palette (not "shadcn dark mode" generic)
- Custom serif display font (Fraunces) + Inter for body

### What's NOT included (be upfront)

- No SMS reminders (email only)
- No reviews system (schema not designed yet — straightforward to add)
- No Stripe Connect (deposits go to your Stripe account, not directly to braiders' accounts — easy to add but opinionated MVP choice)
- No live users / no revenue (this is a code asset, not a business)
- No mobile native app (PWA-ready, but no React Native)

### Deployment

- Pre-configured for Vercel (`vercel.json` includes hourly cron)
- Supabase project setup takes ~5 minutes (run `db/schema.sql`, `db/policies.sql`)
- Stripe keys → `.env` → done
- Estimated time from purchase to live: **half a day** for a competent dev

### Why I'm selling

Built it as a side project. Don't have the bandwidth to do the
braider-community outreach and marketing this deserves. Looking for someone who
can take it the last mile.

### What you'd get

- Complete code transfer (GitHub repo)
- All design tokens, fonts, color system
- 30 min handoff call to walk through architecture
- 7 days of email support for setup questions

---

## Screenshots to capture (in this order)

Take these at 1440×900 with a clean browser:

1. **Landing page hero** — full screen, scroll position at top
2. **Landing page comparison table** — scrolled so the "vs Square/Acuity" table is centered
3. **Pricing page** — all 3 tiers visible
4. **Braider profile page** — pick a seeded braider with services + slots
5. **Booking flow** — slot picker open with a service selected
6. **Stripe checkout page** — `/bookings/[id]/pay` with Stripe Elements visible (use test card)
7. **Confirmation page** — post-payment "Booking confirmed"
8. **Braider dashboard overview** — `/dashboard` with sample data (week ahead, revenue, pending deposits)
9. **Availability editor** — weekly rules + date overrides
10. **Email template** — one of the React Email templates rendered (use Resend's preview or screenshot the dev preview)

Crop them tight, no browser chrome unless it's needed for context.

---

## Demo video script (Loom, 4 minutes max)

Buyers watch the first 60 seconds and skim the rest. Front-load the wow.

**00:00–00:15** — Hook
> "BraidFlow is a vertical SaaS for braiders. Stripe deposits up front,
> double-booking impossible at the DB level, automatic reminders — all in
> production-grade Next.js + Supabase. Here's the full flow in 3 minutes."

**00:15–00:45** — Client side
- Open landing page, scroll once
- Click "Find a braider", pick one
- Show service list, pick a service
- Show slot picker — point out day-blocks
- Pick a slot, click "Book"

**00:45–01:30** — Payment
- Stripe Elements loads
- Type test card `4242 4242 4242 4242`
- Submit, see "Booking confirmed"
- Show the email that arrived (open dev inbox or Resend logs)

**01:30–02:30** — Braider side
- Sign out, sign back in as braider
- Show dashboard: week ahead, this month's revenue, pending deposits
- Open the new appointment
- Show services page — create one quickly
- Show availability editor — toggle a day off

**02:30–03:15** — The hard stuff
- Open `db/schema.sql` in code, scroll to the GiST exclusion constraint:
  > "This is the line that makes double-booking impossible — at the database
  > level, not the application level. Two clients hitting the same slot at the
  > same millisecond? One commits, the other gets a clean error."
- Open `app/api/cron/reminders/route.ts`:
  > "Two reminder windows, atomic claim via partial-index update, fully
  > idempotent. Hourly cron in vercel.json."
- Open `app/api/stripe/webhook/route.ts`:
  > "Webhook handles success, failure, refunds. Idempotent — checks prior
  > status before notifying."

**03:15–04:00** — Wrap
- Show the project structure quickly
- "8 tables, RLS on all of them, server actions everywhere, Zod on every input,
  TypeScript strict. Builds clean, sets up in a Sunday afternoon. Asking $3K,
  open to reasonable offers."
- Email address on screen for inquiries.

---

## Q&A buyers will ask (have answers ready)

**Q: How much would I need to invest to launch?**
> Hosting: Supabase free tier handles the first 50k rows / 50k MAU. Vercel
> hobby/pro depending on traffic. Stripe is pay-as-you-go. Realistically
> $0–$25/month until you have ~100 active braiders. Resend free tier covers
> 3K emails/month.

**Q: Why doesn't it have users yet?**
> Built it as a side project. The braider-community outreach needed to bootstrap
> a marketplace is a full-time job, not a weekend. That's why I'm selling — to
> someone who can give it that attention.

**Q: Can it be a single-sided product (just braider booking pages, no marketplace)?**
> Yes. Disable `/braiders` and the discovery flow, and each braider gets a
> direct link like `/braiders/[slug]/book`. Many braiders just want a booking
> page they put in their Instagram bio — that's already supported.

**Q: How easy is it to add SMS / reviews / Stripe Connect?**
> SMS: Add Twilio to `lib/email/send.ts`-style abstraction. Half a day.
> Reviews: One table (booking_id, rating, text), one form, one display section.
> One day.
> Stripe Connect: Bigger lift, ~1 week. Existing payment code abstracts the
> destination account, but Connect requires KYC onboarding flow.

**Q: Does it run on cheaper infra than Vercel?**
> Yes — it's a standard Next.js app. Self-host on any VPS with PM2 + Caddy.
> Supabase can also be self-hosted.

**Q: What about international Stripe support?**
> Whatever Stripe supports, BraidFlow supports. Stripe is in 47 countries.

---

## Listing channels (in order of expected ROI)

1. **Acquire.com** (formerly MicroAcquire) — Best for SaaS code assets. List as
   "code only" if no revenue. Buyers there understand pre-revenue valuations.
2. **Flippa** — Higher traffic but more tire-kickers. Use only if Acquire is slow.
3. **IndieHackers + r/SaaS + r/Entrepreneur** — Free traffic, builds awareness
   before listing. Post the demo Loom, link to a contact form.
4. **Direct outreach** — Beauty tech accounts on Twitter/LinkedIn, agencies
   that build for salon clients. Personal email beats public listing for niche.

---

## Negotiation playbook

- First serious offer: don't accept. Counter at +25%. Real buyers expect this.
- Anchor on the niche, not the code. "Generic booking SaaS = $2K. This is
  built for a $2B vertical that nobody else is serving."
- If they push on "no users": offer 1–2 months of post-sale support included.
  Costs you almost nothing, removes their biggest objection.
- Walk-away point: **$2,400**. Below that, you're undervaluing the work.
- Bonus you can offer for free: a custom-recorded onboarding video for the
  buyer's first 3 customers. Costs an evening, looks like $$$ in the listing.

---

## Pre-launch checklist (do all of these before going live with the listing)

- [ ] Live demo deployed to a `*.vercel.app` URL with seed data
- [ ] Demo Stripe account in test mode, test card noted in listing
- [ ] At least one fake braider profile populated end-to-end (services, hours, image)
- [ ] Loom video uploaded and link tested incognito
- [ ] All 10 screenshots taken at 1440×900, cropped, optimized
- [ ] README updated to reflect what's built (not the old "intentionally not built" list)
- [ ] Repo is private but ready to grant access to interested buyers (NDA form ready)
- [ ] Pricing on website shows real numbers ($29 / $79), not "free during beta"
- [ ] OG image renders correctly when you paste the URL into Twitter / LinkedIn / iMessage
- [ ] You can answer every Q in the Q&A section without hesitation
