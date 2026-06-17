# BraidFlow

A two-sided booking platform for braiders and protective-style stylists.
Clients browse a stylist, pick a service and time, and pay a deposit to confirm.
Braiders set their hours once, get paid directly through Stripe, and stop
chasing bookings through Instagram DMs.

It is built for long appointments — 4 to 8 hours — where a no-show costs a whole
day of work, so the deposit is the default: a slot isn't held until the client
has paid.

## Features

**Clients**
- Public braider directory with city search, plus SEO-friendly profile pages
- Service picker with real-time, timezone-aware availability and slot selection
- Card checkout via Stripe Elements; the slot is confirmed only after the
  deposit is paid
- Book as a guest (no account required) or signed in; guest bookings are managed
  through a secure link sent by email
- My bookings, reschedule (the deposit carries over), and cancel
- Leave a review after a completed appointment

**Braiders**
- Dashboard: overview stats, calendar, appointments, clients, services,
  weekly hours and day overrides, and settings
- Stripe Connect Express onboarding — deposits are paid out directly to the
  braider's connected account, and refunds reverse the transfer
- Post-appointment close-out: mark each booking completed or no-show
- Automated 24h and 2h reminders via an hourly cron
- Transactional email for confirmation, reminders, cancellation, reschedule,
  and refund

**Platform**
- Row-Level Security on every table; clients see only their own bookings and
  braiders only their own data
- A Postgres GiST exclusion constraint makes double-booking impossible at the
  database level, even under concurrent writes
- Idempotent Stripe webhook as the source of truth for payment state
- Zod validation on every server action, audit logging, and Sentry monitoring
- TypeScript strict mode with `noUncheckedIndexedAccess`

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, Server Components, Server Actions) |
| Database & Auth | Supabase (Postgres, Auth, Row-Level Security) |
| Payments | Stripe (PaymentIntents, Connect Express, Elements, Webhooks) |
| Email | Resend + React Email |
| Monitoring | Sentry (optional) |
| UI | Tailwind CSS, lucide-react |
| Language | TypeScript (strict) + Zod |
| Hosting | Vercel (hourly cron) |

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in Supabase, Stripe, Resend, and CRON_SECRET
```

### Database

Run the SQL against your Supabase project in order (SQL Editor or `psql`):

```bash
psql $SUPABASE_DB_URL -f db/schema.sql
psql $SUPABASE_DB_URL -f db/policies.sql
for f in db/migrations/00*.sql; do psql $SUPABASE_DB_URL -f "$f"; done
# optional demo data (see the seed file header for the two-account setup):
psql $SUPABASE_DB_URL -f db/seed.sql
```

The migrations are forward-only and additive — run all of them in order:

- `0001`–`0003` reminders and the final-reminder window
- `0004` reviews
- `0005` creates the `braiders` row on braider signup (without it, braider
  accounts have no public booking page)
- `0006` the `audit_logs` table written to by server actions and crons
- `0007` locks `profiles.role` so a user can't promote themselves to braider —
  it must run, or self-signup is a privilege-escalation hole
- `0008` Stripe webhook idempotency table and the policy that lets a braider read
  their own clients' contact details
- `0009` per-braider timezone for availability and slot generation
- `0010` Stripe Connect account fields for direct payouts
- `0011` security hardening (owner-only availability notes, review-edit guard)
- `0012` guest bookings (nullable client, guest contact + access token)

Then regenerate types from your live schema:

```bash
npm run db:types
```

### Supabase Auth

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL** must match `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000`)
- **Redirect URLs**: add `<site>/auth/callback` for every environment. The email
  confirmation link redirects there to establish the session.

If *Confirm email* is enabled (the default), signup shows a "check your inbox"
screen and the user returns through `/auth/callback`. If you disable it, signup
signs the user straight in. Either way works out of the box.

### Stripe

Enable **Connect → Express** on the platform account, then add `account.updated`
to the webhook's events. For local development:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copy the signing secret into STRIPE_WEBHOOK_SECRET
```

### Run

```bash
npm run dev
```

## Scripts

```bash
npm run dev        # local dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
npm run test       # vitest
```

CI runs typecheck, lint, and the test suite on every push and pull request
(`.github/workflows/ci.yml`).

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel (framework auto-detected).
2. Add every variable from `.env.example`.
3. Add the production URL to Supabase **Site URL** and as a Stripe webhook
   endpoint (with `account.updated` enabled).
4. The hourly reminder cron is configured in `vercel.json`.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full production checklist and
[docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md) for the manual test pass.

## Project layout

```
app/
  (marketing)/   landing, pricing, privacy, terms
  (auth)/        login, signup, password reset
  (client)/      directory, braider profiles, booking, payment, my bookings
  (braider)/     dashboard, calendar, services, availability, clients, settings,
                 Stripe Connect onboarding
  api/stripe/    webhook
  api/cron/      hourly reminders, abandoned-booking expiry
components/
  ui/            primitives (button, input, card, badge, spinner)
  shared/        navbar, footer, page header, empty state
  booking/       service list, slot picker, cancel/refund buttons
  braider/       braider card, reviews, Connect banner
lib/
  supabase/      browser / server / admin clients + middleware
  stripe/        server SDK, Connect helpers, client-secret helper
  bookings/      availability, create/cancel/refund/reschedule, guest access, Zod schemas
  braider/       profile and Connect actions
  email/         send + notification orchestration + React Email templates
  timezones.ts   timezone list and helpers
db/
  schema.sql     baseline tables + GiST exclusion constraint
  policies.sql   RLS policies
  migrations/    additive, forward-only migrations
  seed.sql       example data
types/db.ts      Supabase-generated types
```

## Booking flow

1. The client picks a service and an open slot on `/braiders/[slug]/book`.
2. `createBookingAction` inserts the booking as `pending_payment`. The database's
   exclusion constraint guarantees two clients can't claim the same slot.
3. The server creates a Stripe PaymentIntent for the deposit as a destination
   charge to the braider's connected account, links it to a `payments` row, and
   redirects to the payment page.
4. Stripe Elements collects the card and the client confirms.
5. The `payment_intent.succeeded` webhook flips the booking to `confirmed`, marks
   the payment `succeeded`, and sends confirmation emails to both parties.
6. The hourly cron sends a 24h reminder, then a 2h reminder, each atomically
   claimed so it can't double-send.
7. The remaining balance is collected in person at the appointment.

## Reschedule and refund

- **Reschedule** — either party can move a booking; the deposit carries over and
  both reminder flags reset so the cron re-arms for the new time. The other party
  is notified.
- **Refund** — the braider can refund from the appointment view. The Stripe
  refund reverses the Connect transfer and the client is notified, with the same
  idempotent webhook handling.

## Roadmap

Deliberately out of scope today, and straightforward to add on top of the
existing abstractions:

- SMS reminders (email only for now)
- Braider subscription billing (deposits are the only money flow; the pricing
  page is a free beta)
- Multi-stylist studio accounts (single-braider data model today)
