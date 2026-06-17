# Production Deployment Checklist

End-to-end checklist for taking BraidFlow from this repo to a live production
deployment on Vercel. Work top to bottom — later steps depend on earlier ones.
Check each box as you go.

> Target stack: **Vercel** (hosting + cron) · **Supabase** (Postgres, Auth, RLS)
> · **Stripe** (deposits + webhooks) · **Resend** (email) · **Sentry** (optional
> error monitoring).

---

## 0. Accounts & prerequisites

- [ ] A **Vercel** account with this repo pushed to GitHub.
- [ ] A **Supabase** project (production — separate from any dev project).
- [ ] A **Stripe** account with a business profile completed enough to activate
      live mode.
- [ ] A **Resend** account and a domain you can add DNS records to.
- [ ] (Optional) A **Sentry** account for error monitoring.
- [ ] A **custom domain** for the app (e.g. `app.braidflow.app`).

---

## 1. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** for the
**Production** environment (and Preview, if you use preview deploys). Anything
prefixed `NEXT_PUBLIC_` is exposed to the browser — never put a secret there.

| Variable | Required | Source / notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase → Settings → API. Bare project URL, no path. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase → Settings → API (anon/publishable key). |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase → Settings → API (service role / secret). **Server-only secret.** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe → Developers → API keys (**live** `pk_live_…`). |
| `STRIPE_SECRET_KEY` | ✅ | Stripe (**live** `sk_live_…`). Secret. |
| `STRIPE_WEBHOOK_SECRET` | ✅ | From the webhook endpoint you create in step 3 (`whsec_…`). |
| `RESEND_API_KEY` | ✅ (for email) | Resend → API Keys. If empty, emails are skipped (logged only). |
| `EMAIL_FROM` | ✅ (for email) | A verified sender on your Resend domain, e.g. `BraidFlow <hello@yourdomain.com>`. |
| `CRON_SECRET` | ✅ | Long random string. Vercel sends it as a Bearer token to cron routes. |
| `PENDING_BOOKING_TTL_MINUTES` | ➖ | Minutes an unpaid booking is held before the expiry cron releases it. Default 30. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Your **production** URL, e.g. `https://app.braidflow.app`. Must match Supabase Site URL. |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | ➖ | Sentry DSN. Omit to leave monitoring inert. |
| `SENTRY_TRACES_SAMPLE_RATE` | ➖ | 0–1, default 0.1. |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | ➖ | Only to upload source maps at build time. |

- [ ] Every required var above is set for Production.
- [ ] No secret is sitting in a `NEXT_PUBLIC_` variable.
- [ ] `NEXT_PUBLIC_SITE_URL` exactly matches the production domain (no trailing slash).
- [ ] Generate `CRON_SECRET` with something like `openssl rand -hex 32`.

---

## 2. Supabase

### 2a. Schema & migrations

Run against the production database (SQL Editor or `psql`), **in order**:

- [ ] `db/schema.sql` (baseline tables + GiST exclusion constraint)
- [ ] `db/policies.sql` (Row-Level Security policies)
- [ ] `db/migrations/0001_reminders.sql`
- [ ] `db/migrations/0002_refunds.sql`
- [ ] `db/migrations/0003_final_reminders.sql`
- [ ] `db/migrations/0004_reviews.sql`
- [ ] `db/migrations/0005_braider_onboarding.sql` — creates the `braiders` row on
      braider signup. Skip it and braider accounts have no public booking page.
- [ ] `db/migrations/0006_audit_logs.sql` — the `audit_logs` table the actions/crons write to.
- [ ] `db/migrations/0007_profiles_role_lock.sql` — **must run.** Locks
      `profiles.role` so a user can't self-promote to braider (privilege-escalation hole otherwise).
- [ ] `db/migrations/0008_webhook_events_and_client_reads.sql` — Stripe webhook
      idempotency table + RLS letting a braider read their own clients' details.
- [ ] `db/migrations/0009_braider_timezone.sql` — adds `braiders.timezone`
      (NOT NULL). Slot generation reads it; skip it and availability breaks.
- [ ] `db/migrations/0010_stripe_connect.sql` — Stripe Connect columns on
      `braiders` (`stripe_account_id`, `charges_enabled`, `payouts_enabled`,
      `stripe_onboarding_complete`, `onboarding_completed_at`). **Required for
      bookings**: until a braider's account has `charges_enabled`, the booking
      flow is gated off (server + UI).
- [ ] `db/migrations/0011_security_fixes.sql` — **must run.** Locks down the
      `availability_overrides` public-read leak and the `reviews` UPDATE policy.
- [ ] (Optional) `db/seed.sql` for demo data — **do not** run on real production.
      Note: seeded braiders have no Stripe account, so they can't take bookings
      until they complete Connect onboarding (Stripe test mode auto-fills it).

> Sanity check: in Supabase → Authentication → Policies, confirm **RLS is
> enabled on every table**. The trust boundary lives in the database.

### 2b. Auth configuration (Authentication → URL Configuration)

- [ ] **Site URL** = `NEXT_PUBLIC_SITE_URL` (your production domain).
- [ ] **Redirect URLs** include `https://<your-domain>/auth/callback` for every
      environment (production, and each preview domain you use). This is where
      email confirmation **and password-reset** links land.
- [ ] Decide on **Confirm email** (Authentication → Providers → Email). Enabled =
      users verify before first sign-in (recommended for production).

### 2c. Email delivery (critical for production)

Supabase's built-in email is heavily rate-limited and meant for testing only.

- [ ] Configure **custom SMTP** (Authentication → Emails → SMTP Settings) — e.g.
      via Resend SMTP — so confirmation and password-reset emails actually send
      at volume.
- [ ] Review the **Confirmation** and **Reset Password** email templates. The
      default templates link through `{{ .ConfirmationURL }}`, which honors the
      `redirectTo` the app passes (`/auth/callback?next=/reset-password`). If you
      customize them, keep that redirect intact.
- [ ] Send yourself a test password reset and confirm the link lands on
      `/reset-password` and lets you set a new password.

---

## 3. Stripe

- [ ] Activate **live mode** and use `pk_live_…` / `sk_live_…` keys (step 1).
- [ ] Create a webhook endpoint (Developers → Webhooks → Add endpoint):
      `https://<your-domain>/api/stripe/webhook`.
- [ ] Subscribe it to exactly these events (the handler in
      `app/api/stripe/webhook/route.ts` processes them):
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `payment_intent.canceled`
  - [ ] `refund.created`
  - [ ] `refund.updated`
  - [ ] `refund.failed`
  - [ ] `charge.dispute.created`
  - [ ] `account.updated` — keeps each braider's Connect capability flags
        (`charges_enabled` etc.) in sync. Without it, a braider who finishes
        onboarding may stay gated until they hit the manual refresh.
- [ ] Copy the endpoint's **Signing secret** → `STRIPE_WEBHOOK_SECRET`.
- [ ] Confirm your Stripe account can actually accept charges and pay out
      (business details, bank account).

> The webhook is the source of truth: it promotes bookings to `confirmed` and
> sends confirmation email. Handlers are idempotent (deduped on event id), so
> Stripe's at-least-once retries are safe.

### 3a. Stripe Connect (braiders receive deposits)

Deposits are **destination charges** routed to each braider's own connected
account — the braider is the merchant of record and keeps 100% (no platform fee
in beta). The platform account stays the integrator, so the webhook above is
unchanged.

- [ ] Enable **Connect** (Stripe → Connect → Get started) and use **Express**
      accounts.
- [ ] Confirm the platform account's **Connect settings** allow creating Express
      accounts and that `card_payments` + `transfers` capabilities are available.
- [ ] No new env vars are needed — onboarding uses `STRIPE_SECRET_KEY` and the
      return/refresh URLs are derived from `NEXT_PUBLIC_SITE_URL`
      (`/dashboard/connect/return`, `/dashboard/connect/refresh`).
- [ ] After deploy: from a braider dashboard, click **Connect Stripe**, complete
      the hosted onboarding, and confirm the booking flow unlocks once the
      account reaches `charges_enabled`.

---

## 4. Resend (transactional email)

- [ ] Add and **verify your sending domain** in Resend (SPF/DKIM DNS records).
- [ ] Set `EMAIL_FROM` to an address on that verified domain.
- [ ] Set `RESEND_API_KEY`.
- [ ] Send a test booking and confirm the confirmation email arrives and isn't
      flagged as spam.

---

## 5. Sentry (optional but recommended)

- [ ] Create a Sentry project (platform: Next.js) and copy its DSN.
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` (and `SENTRY_DSN` if you want a separate
      server DSN).
- [ ] (Optional) Set `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` so
      `next build` uploads source maps for readable stack traces.
- [ ] After deploy, trigger a test error and confirm it appears in Sentry.

> With no DSN configured, Sentry is fully inert — the app builds and runs exactly
> as without it. See `sentry.*.config.ts` and `lib/monitoring.ts`.

---

## 6. Deploy on Vercel

- [ ] Import the GitHub repo (framework auto-detected as Next.js).
- [ ] Confirm all environment variables from step 1 are set for Production.
- [ ] Trigger the first deploy and confirm the build succeeds
      (`next build` passes locally too — see step 8).
- [ ] Add your **custom domain** (Settings → Domains) and update
      `NEXT_PUBLIC_SITE_URL` + Supabase Site URL if the domain changed.
- [ ] **Cron**: `vercel.json` already defines the hourly reminder cron and the
      15-minute booking-expiry cron. Vercel automatically attaches
      `Authorization: Bearer $CRON_SECRET` to those calls, which the routes
      verify (`lib/cron/auth.ts`). Confirm `CRON_SECRET` is set, then check
      Vercel → Crons after deploy to see them registered.

---

## 7. Security & ops review

- [ ] **RLS** enabled on every table (re-verify on the production DB).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only ever used server-side (it is — via
      `supabaseAdmin()`); never shipped to the browser.
- [ ] **Security headers** are applied (`next.config.mjs`): HSTS, `nosniff`,
      `X-Frame-Options`, Referrer-Policy, Permissions-Policy. Note HSTS uses
      `preload` — only keep it if you intend to stay HTTPS-only permanently.
- [ ] **Rate limiting** (`lib/rate-limit.ts`) is **in-memory and per-instance**.
      On serverless this means the effective limit is roughly `limit ×
      instances` and resets on cold start. It's a basic abuse/burst guard, not a
      hard global limit. For strict global limits (e.g. brute-force protection at
      scale), swap the `Map` for **Upstash Redis** or a Postgres table behind the
      same `rateLimit()` signature — no call sites change. Applied today to the
      password-reset request (IP + email keyed) and booking creation (user keyed).
- [ ] **Legal pages** (`/privacy`, `/terms`) — the shipped copy is a solid
      starting point, but have it reviewed by counsel and fill in your real
      company/jurisdiction details before relying on it.
- [ ] Rotate any secret that was ever pasted into chat, a ticket, or a screenshot.
- [ ] `npm audit` — review and patch high/critical advisories where feasible.

---

## 8. Pre-launch verification

- [ ] `npm run typecheck` — clean.
- [ ] `npm run lint` — clean.
- [ ] `npm run build` — succeeds.
- [ ] Run the **[Manual QA Checklist](./QA_CHECKLIST.md)** against the production
      (or a production-like) deploy, using Stripe **test** mode first, then a
      single real live transaction as a final smoke test.
- [ ] Verify cron jobs by checking that a confirmed booking ~24h out receives a
      reminder, and an unpaid booking is expired after `PENDING_BOOKING_TTL_MINUTES`.

---

## 9. Rollback

- [ ] Know how to **redeploy the previous build** in Vercel (Deployments →
      previous → Promote) if a release misbehaves.
- [ ] Database migrations are forward-only and additive; keep a recent Supabase
      backup before running new migrations so you can restore if needed.
