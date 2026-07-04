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
- Authorization on every mutation (server actions + Edge middleware); guests act
  on a booking through a signed capability token, never a shared login
- Server-side slot re-validation on every booking request guards double-booking
- Idempotent Stripe webhook as the source of truth for payment state
- Zod validation on every server action, audit logging, and Sentry monitoring
- TypeScript strict mode with `noUncheckedIndexedAccess`

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, Server Components, Server Actions) |
| Data & Auth | In-memory demo store + signed-cookie session auth (no external services) |
| Payments | Stripe (PaymentIntents, Connect Express, Elements, Webhooks) — optional |
| Email | Resend + React Email |
| Monitoring | Sentry (optional) |
| UI | Tailwind CSS, lucide-react |
| Language | TypeScript (strict) + Zod |
| Hosting | Vercel (hourly cron) |

## Getting started

```bash
npm install
npm run dev
```

The app runs with **zero configuration**. Copy `.env.example` to `.env.local`
only to enable optional integrations (Stripe payments, Resend email, cron).

### Demo data & auth

There's nothing to set up. On first request the app seeds a realistic in-memory
dataset — a braider studio ("Amara Braids") with services, availability,
bookings, payments and reviews, plus a public directory of other braiders — and
serves every screen from it. Data lives for the lifetime of the server instance:
edits persist while it's warm and reset to the known-good seed on a cold start.

Authentication is fully local. Sign-in accepts **any** email and password and
issues a signed, httpOnly session cookie; logout clears it. Signing up as a
**braider** — or signing in with `amara@braidflow.app` — lands you in the
populated braider dashboard; anyone else gets the client experience. No email
verification step.

To run this as a real multi-user product, implement a durable store behind the
`db()` / `dbAdmin()` interface in `lib/db/server.ts` — no call sites change.

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
2. No environment variables are required — it deploys and runs as-is. Add any
   from `.env.example` only to enable optional integrations; set `AUTH_SECRET`
   to a long random string in production.
3. The hourly reminder cron is configured in `vercel.json`.

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
  db/            in-memory store, seed data, and the query layer (db / dbAdmin)
  auth/          signed-cookie sessions, demo personas, login/logout actions
  stripe/        server SDK, Connect helpers, client-secret helper
  bookings/      availability, create/cancel/refund/reschedule, guest access, Zod schemas
  braider/       profile and Connect actions
  email/         send + notification orchestration + React Email templates
  timezones.ts   timezone list and helpers
types/db.ts      database row / enum types (shape the in-memory store)
```

## Booking flow

1. The client picks a service and an open slot on `/braiders/[slug]/book`.
2. `createBookingAction` re-validates the slot server-side and inserts the
   booking as `pending_payment`, so two clients can't hold the same slot.
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
