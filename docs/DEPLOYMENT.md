# Production Deployment Checklist

End-to-end checklist for taking BraidFlow from this repo to a live deployment on
Vercel. The app is **self-contained** — local session auth plus an in-memory data
layer — so it deploys and runs with **zero configuration**. Everything else on
this page is optional and only needed to turn on a specific integration.

> Target stack: **Vercel** (hosting + cron). Optional: **Stripe** (deposits +
> webhooks) · **Resend** (email) · **Sentry** (error monitoring).

---

## 0. Accounts & prerequisites

- [ ] A **Vercel** account with this repo pushed to GitHub.
- [ ] (Optional) A **Stripe** account, if you want to take real deposits.
- [ ] (Optional) A **Resend** account + a domain you can add DNS records to, for email.
- [ ] (Optional) A **Sentry** account for error monitoring.
- [ ] (Optional) A **custom domain** for the app (e.g. `app.braidflow.app`).

---

## 1. Deploy on Vercel

- [ ] Import the GitHub repo (framework auto-detected as Next.js).
- [ ] Trigger the first deploy. **No environment variables are required** — the
      build succeeds and every screen works against the seeded in-memory data.
- [ ] (Optional) Add a **custom domain** (Settings → Domains) and set
      `NEXT_PUBLIC_SITE_URL` to match it (used for absolute links in emails,
      sitemap, and OpenGraph).
- [ ] **Cron**: `vercel.json` defines the hourly reminder cron and the 15-minute
      booking-expiry cron. Vercel attaches `Authorization: Bearer $CRON_SECRET`
      to those calls, which the routes verify (`lib/cron/auth.ts`). Set
      `CRON_SECRET` if you want the crons authenticated, then check
      Vercel → Crons after deploy to confirm they registered.

> **How the data layer works.** The app seeds a realistic in-memory dataset on
> first request and serves everything from it (`lib/db`). It persists while a
> server instance is warm and resets to the deterministic seed on a cold start —
> ideal for a demo. To run this as a real multi-user product, implement a durable
> store (Postgres, etc.) behind the same `db()` / `dbAdmin()` interface in
> `lib/db/server.ts`; no call sites change.

---

## 2. Environment variables (all optional)

Set these in **Vercel → Project → Settings → Environment Variables** only if you
want the matching feature. Anything prefixed `NEXT_PUBLIC_` is exposed to the
browser — never put a secret there.

| Variable | For | Notes |
|---|---|---|
| `AUTH_SECRET` | Auth | Signs the session cookie (HMAC). A stable default is used if unset; set a long random string in production so cookies forged with the well-known default are rejected. `openssl rand -hex 32`. |
| `NEXT_PUBLIC_SITE_URL` | Links | Production URL, e.g. `https://app.braidflow.app` (no trailing slash). Used for absolute links only. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Payments | Stripe → Developers → API keys (`pk_live_…`). |
| `STRIPE_SECRET_KEY` | Payments | Stripe (`sk_live_…`). Secret. |
| `STRIPE_WEBHOOK_SECRET` | Payments | From the webhook endpoint in step 3 (`whsec_…`). |
| `RESEND_API_KEY` | Email | Resend → API Keys. If empty, emails are skipped (logged only). |
| `EMAIL_FROM` | Email | A verified sender on your Resend domain, e.g. `BraidFlow <hello@yourdomain.com>`. |
| `CRON_SECRET` | Cron | Long random string; Vercel sends it as a Bearer token to cron routes. |
| `PENDING_BOOKING_TTL_MINUTES` | Cron | Minutes an unpaid booking is held before the expiry cron releases it. Default 30. |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | Monitoring | Sentry DSN. Omit to leave monitoring inert. |
| `SENTRY_TRACES_SAMPLE_RATE` | Monitoring | 0–1, default 0.1. |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | Monitoring | Only to upload source maps at build time. |

- [ ] No secret is sitting in a `NEXT_PUBLIC_` variable.
- [ ] `AUTH_SECRET` is set to a strong random value for production.

---

## 3. Stripe (optional — real deposits)

Skip this entire section to run the app without payments. With no Stripe keys,
the booking flow surfaces up to the pay step but can't collect a live deposit.

- [ ] Activate **live mode** and use `pk_live_…` / `sk_live_…` keys (step 2).
- [ ] Create a webhook endpoint (Developers → Webhooks → Add endpoint):
      `https://<your-domain>/api/stripe/webhook`.
- [ ] Subscribe it to exactly these events (handled in
      `app/api/stripe/webhook/route.ts`):
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `payment_intent.canceled`
  - [ ] `refund.created`
  - [ ] `refund.updated`
  - [ ] `refund.failed`
  - [ ] `charge.dispute.created`
  - [ ] `account.updated` — keeps each braider's Connect capability flags in sync.
- [ ] Copy the endpoint's **Signing secret** → `STRIPE_WEBHOOK_SECRET`.

> The webhook is the source of truth: it promotes bookings to `confirmed` and
> sends confirmation email. Handlers are idempotent (deduped on event id).

### 3a. Stripe Connect (braiders receive deposits)

Deposits are **destination charges** routed to each braider's connected account —
the braider is the merchant of record and keeps 100% (no platform fee in beta).

- [ ] Enable **Connect → Express** on the platform account.
- [ ] Confirm `card_payments` + `transfers` capabilities are available.
- [ ] No new env vars are needed — onboarding uses `STRIPE_SECRET_KEY`; the
      return/refresh URLs derive from `NEXT_PUBLIC_SITE_URL`.

---

## 4. Resend (optional — transactional email)

Skip to run without email; the app logs would-be sends and continues.

- [ ] Add and **verify your sending domain** in Resend (SPF/DKIM DNS records).
- [ ] Set `EMAIL_FROM` to an address on that verified domain.
- [ ] Set `RESEND_API_KEY`.
- [ ] Send a test booking and confirm the confirmation email arrives.

---

## 5. Sentry (optional — error monitoring)

- [ ] Create a Sentry project (platform: Next.js) and copy its DSN.
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` (and `SENTRY_DSN` for a separate server DSN).
- [ ] (Optional) Set `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` so
      `next build` uploads source maps.

> With no DSN configured, Sentry is fully inert. See `sentry.*.config.ts` and
> `lib/monitoring.ts`.

---

## 6. Security & ops review

- [ ] **`AUTH_SECRET`** set to a strong random value (see step 2).
- [ ] **Security headers** applied (`next.config.mjs`): HSTS, `nosniff`,
      `X-Frame-Options`, Referrer-Policy, Permissions-Policy. HSTS uses `preload`
      — only keep it if you intend to stay HTTPS-only permanently.
- [ ] **Rate limiting** (`lib/rate-limit.ts`) is **in-memory and per-instance**.
      On serverless the effective limit is roughly `limit × instances` and resets
      on cold start — a basic abuse/burst guard, not a hard global limit. For
      strict global limits, swap the `Map` for Upstash Redis (or similar) behind
      the same `rateLimit()` signature — no call sites change.
- [ ] **Legal pages** (`/privacy`, `/terms`) — the shipped copy is a starting
      point; have counsel review and fill in your real company details.
- [ ] Rotate any secret that was ever pasted into chat, a ticket, or a screenshot.
- [ ] `npm audit` — review and patch high/critical advisories where feasible.

---

## 7. Pre-launch verification

- [ ] `npm run typecheck` — clean.
- [ ] `npm run lint` — clean.
- [ ] `npm run build` — succeeds.
- [ ] Run the **[Manual QA Checklist](./QA_CHECKLIST.md)**. If Stripe is enabled,
      test in Stripe **test** mode first, then one real live transaction.
- [ ] If crons are enabled, verify a confirmed booking ~24h out receives a
      reminder, and an unpaid booking is expired after `PENDING_BOOKING_TTL_MINUTES`.

---

## 8. Rollback

- [ ] Know how to **redeploy the previous build** in Vercel (Deployments →
      previous → Promote) if a release misbehaves.
