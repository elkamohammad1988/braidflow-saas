# DEV.to — Technical Article Outline

**Angle:** Building a deposit-first booking platform with Next.js 14 App Router + Stripe, and making it deploy with zero backend config via a swappable in-memory data layer.

---

## Title options
1. Building a deposit-first booking platform with Next.js 14 + Stripe (and no backend to deploy)
2. The deposit is the state machine: how I built a booking app where money is the source of truth
3. Zero-config by design: a Next.js 14 + Stripe app that runs before you provision a database

**Dek (one line):**
How I built BraidFlow — a deposit-first booking tool for hair braiders — with Server Actions, a webhook-driven booking state machine, edge-verified cookie auth, and a data layer you can deploy with zero configuration.

---

## 0. Intro — the problem that shapes the architecture
- Braiders book in Instagram DMs; no-shows burn 4–8 hour slots.
- The product decision that drives every technical one: **the deposit is the default, not an add-on.** A slot must not lock until money lands.
- What this post covers: Server Actions + Zod, the Stripe webhook state machine, edge cookie auth, timezone-correct scheduling, and the swappable data layer that makes it deploy with zero config.
- Not a tutorial you copy top-to-bottom — the interesting decisions and the code behind them.

## 1. Route groups: four apps in one Next.js project
- `(marketing)`, `(auth)`, `(braider)`, `(client)` — separate layouts, shared primitives.
- Server Components for reads, so the dashboard ships little client JS (~149 kB shared first-load baseline).
- Why route groups beat a folder-per-feature here: distinct chrome + auth boundaries.
- *Code you'll show:* the route-group tree + a dashboard server component doing a direct data read (no client fetch).

## 2. Mutations as Server Actions, validated with Zod
- Every write is a server action; no hand-rolled API routes for CRUD.
- Zod schema at the top of the action = one validation boundary; parse, then trust.
- Returning typed errors to the form without a client fetch layer.
- *Code you'll show:* a `createBooking` / `createService` server action — `'use server'`, `schema.parse(formData)`, the DB call, `revalidatePath`.

## 3. The deposit IS the state machine
- States: `pending_payment → confirmed → completed / cancelled`.
- The rule that matters: creating a booking does **not** hold the slot. Only a paid deposit does.
- Why the client-side "payment succeeded" callback is never trusted as truth.
- *Code you'll show:* the status enum + a transition table / guard function showing which transitions are legal.

## 4. Stripe as the source of truth: the webhook
- Client hits Stripe Elements → Stripe fires the webhook → the webhook flips `pending_payment → confirmed`.
- Signature verification; idempotency (a webhook can arrive twice); handling out-of-order events.
- Stripe **Connect**: the deposit pays out to the braider, not to a platform pool — 0% cut.
- *Code you'll show:* the webhook route handler — `constructEvent` with the signing secret, the `switch` on event type, the confirm transition.

## 5. Auth without an auth provider: signed cookie + edge middleware
- A signed httpOnly session cookie (Web Crypto HMAC) instead of a hosted auth service.
- **Edge middleware** verifies the signature and gates `/dashboard` + `/bookings` before the route even renders.
- Why HMAC verify runs fine on the edge runtime (Web Crypto, no Node APIs).
- *Code you'll show:* the middleware `verify()` — pull the cookie, HMAC-compare, redirect on fail; plus the `matcher` config.

## 6. Timezone-correct scheduling (the bug that isn't there)
- The classic trap: server in UTC, braider in EST, counts and revenue land on the wrong day.
- Using `date-fns` + `@date-fns/tz` so "this week" and "revenue this month" compute in the **braider's** zone.
- Where to store UTC and where to convert (compute in-zone, persist in UTC).
- *Code you'll show:* a helper that buckets bookings into the braider's local week/month.

## 7. Zero-config deploy: one data interface, two backends
- The core idea: all data access goes through `db()` / `dbAdmin()`, a PostgREST-style query builder.
- The demo binds that interface to an **in-memory store** with a deterministic seed — no DB, no env vars, deploys as-is on Vercel.
- Swap the binding for real Postgres/Supabase and feature code doesn't change.
- Why this is great for a portfolio/demo AND for real onboarding.
- *Code you'll show:* the `db()` interface signature + the in-memory adapter vs. the (stub) Postgres adapter behind the same shape.

## 8. The jobs nobody sees: cron + email
- **Vercel Cron** releases abandoned unpaid holds (so a dead checkout doesn't block a slot forever) and sends reminders.
- **Resend** for transactional email — and it **no-ops cleanly with no API key**, keeping the zero-config promise.
- *Code you'll show:* the expire-holds cron handler — find `pending_payment` past TTL, transition to `cancelled`, free the slot.

## 9. Proof it works: QA + performance
- Production build clean; TypeScript strict passes; Vitest on the booking/timezone logic.
- Post-deploy QA on the live URL: 0 console errors, 0 page errors, 0 hydration warnings, no failed requests across landing, auth, and every dashboard route.
- Responsive down to 390px with no horizontal overflow; accessible foundations (landmarks, labeled inputs, focus-visible, reduced-motion).
- *Code you'll show:* a representative Vitest case for a state transition or a timezone bucket.

## 10. Key takeaways
- Let the **money** be the source of truth; the UI just reflects it.
- Server Actions + Zod collapse a whole API layer into one validated boundary.
- Put data access behind one interface early and you get a zero-config demo for free.
- Timezone bugs are product bugs — decide your convert/persist rule up front.
- Edge-verified cookie auth is a legitimate, cheap alternative to a hosted auth provider.

## CTA
- Live demo (no signup, sample data): **https://braidflow.vercel.app** — sign in as `amara@braidflow.app` (any password) for the braider dashboard.
- Built solo by **@elkamohammad1988**. Questions on any of these decisions — reply, I'll go deep.
