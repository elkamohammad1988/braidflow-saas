# Manual QA Checklist

Run through this before any production release (and after significant changes).
It exercises both sides of the marketplace — **client** and **braider** — plus
payments, the lifecycle flows, and the production-hardening features.

## Test setup

- [ ] Use **Stripe test mode** for the full pass, then do one **live** booking as
      a final smoke test.
- [ ] Have two browsers / profiles ready so you can be a **braider** in one and a
      **client** in the other simultaneously.
- [ ] Stripe test cards:
  - Success: `4242 4242 4242 4242` (any future expiry, any CVC, any ZIP)
  - Declined: `4000 0000 0000 0002`
  - Requires authentication (3DS): `4000 0027 6000 3184`
- [ ] If testing crons locally, call them with the bearer token, e.g.
      `curl -H "Authorization: Bearer $CRON_SECRET" <url>/api/cron/reminders`.

Legend: ✅ = expected result.

---

## 1. Account & auth

### Signup
- [ ] Sign up as a **client** (name, email, password ≥ 8 chars). ✅ With email
      confirmation on, you see "Check your inbox"; the confirmation link lands on
      `/auth/callback` and then `/braiders`.
- [ ] Sign up as a **braider**. ✅ After confirming, you land on `/dashboard` and
      a public booking page exists for the account.
- [ ] Try signing up with an **already-registered email**. ✅ You're told the
      account exists / to sign in — no duplicate confirmation email is implied.
- [ ] The signup form shows the **Terms / Privacy** agreement line, and both
      links open the right pages.

### Login
- [ ] Sign in with correct credentials. ✅ Redirected to your role's home.
- [ ] Sign in with a wrong password. ✅ A clear error, no redirect.
- [ ] Visit a gated URL while logged out (e.g. `/dashboard`, `/bookings`). ✅
      Redirected to `/login?next=…` and back to the target after signing in.

### Password reset (new)
- [ ] On `/login`, click **Forgot password?**. ✅ Lands on `/forgot-password`.
- [ ] Submit your account email. ✅ Generic "if an account exists…" confirmation
      (same message whether or not the email exists — no enumeration).
- [ ] Open the reset email and click the link. ✅ Lands on `/reset-password` with
      the form ready (recovery session established).
- [ ] Set a new password (with a matching confirmation). ✅ Saved, and you're
      signed in and routed to your role's home.
- [ ] Sign out and sign back in with the **new** password. ✅ Works.
- [ ] Open `/reset-password` **directly** (no link). ✅ Shows "invalid or expired"
      with a link to request a new one.
- [ ] Use a reset link **twice**. ✅ The second use shows the expired/invalid state.
- [ ] Mismatched password + confirmation. ✅ Inline "passwords don't match" error,
      nothing saved.

---

## 2. Discovery & booking (client)

- [ ] Browse `/braiders`. ✅ Directory lists braiders who are accepting bookings.
- [ ] Open a braider profile `/braiders/[slug]`. ✅ Services, info, and reviews show.
- [ ] Start a booking — pick a service and an open slot. ✅ Only genuinely
      available times are offered; past/blocked times are not.
- [ ] Confirm the booking. ✅ A `pending_payment` booking is created and you're
      redirected to the pay page.
- [ ] Pay the deposit with `4242…`. ✅ Payment succeeds; the confirmation page
      polls and flips to **confirmed**; both parties receive confirmation email.
- [ ] Repeat with the **declined** card. ✅ A clear failure; the booking is not
      confirmed; the slot is eventually released by the expiry cron.
- [ ] Repeat with the **3DS** card. ✅ The authentication step appears and, once
      completed, the booking confirms.

### Concurrency / slot safety
- [ ] In two sessions, try to book the **same slot** at the same time. ✅ Only one
      succeeds; the other sees "someone just grabbed that slot" (DB exclusion
      constraint, not a race).

---

## 3. Booking lifecycle

- [ ] **Reschedule** a confirmed booking (as client, then as braider). ✅ Moves to
      the new time, the deposit carries over, reminder flags reset, and the other
      party is notified.
- [ ] **Cancel** a booking. ✅ Status updates and the slot frees up.
- [ ] **Refund** a deposit (braider, from the appointment view). ✅ Stripe refund
      issues, the client is notified, and the payment row reflects the refund.
- [ ] **Complete / No-show** close-out (braider). ✅ The booking is marked
      accordingly after the appointment time.
- [ ] **Expiry**: create a booking but don't pay. After
      `PENDING_BOOKING_TTL_MINUTES` (and the 15-min cron), it's cancelled and the
      slot is released.

---

## 4. Braider dashboard

- [ ] **Overview** shows correct stats (upcoming, revenue, etc.).
- [ ] **Services**: create, edit, deactivate. ✅ Changes reflect on the public
      page; deactivated services can't be booked.
- [ ] **Availability**: set weekly hours and a day override (closed/blocked). ✅
      The slot picker honors both.
- [ ] **Appointments / Calendar**: upcoming and past bookings appear correctly.
- [ ] **Clients**: shows clients who have booked, with their details.
- [ ] **Settings**: update profile (display name, accepting-bookings toggle, etc.).
      ✅ Saved and reflected publicly.

---

## 5. Authorization & data isolation (RLS)

- [ ] As a **client**, try to open `/dashboard`. ✅ Redirected away (not a braider).
- [ ] As client A, try to view client B's booking by guessing a URL/id. ✅ Denied /
      not found — you only see your own bookings.
- [ ] As braider X, confirm you cannot see braider Y's appointments, services, or
      clients.
- [ ] Confirm a logged-out user cannot reach any `/dashboard`, `/bookings`, or
      `/book` route.

---

## 6. Emails

- [ ] Confirmation email (both client and braider) — correct details and links.
- [ ] Reminder emails (24h and 2h) — trigger the reminder cron and confirm a
      confirmed, upcoming booking gets one (and only one) of each.
- [ ] Cancellation, reschedule, and refund notification emails arrive with correct content.
- [ ] Password-reset email arrives and the link works (covered in §1).

---

## 7. Rate limiting (new)

- [ ] Request a password reset for the same email **4+ times quickly**. ✅ After
      the limit you get "too many attempts, try again later" (per-email and
      per-IP windows). Normal single requests are unaffected.
- [ ] Create bookings in a rapid loop as one user (8+ in 5 min). ✅ Eventually
      throttled with a "booking very quickly" message; a normal user never hits it.

> Note: limits are in-memory per server instance — on serverless the effective
> limit scales with instance count. This is expected; see DEPLOYMENT.md §7.

---

## 8. Legal & marketing pages

- [ ] `/privacy` and `/terms` render with correct, readable content and a "Last
      updated" date.
- [ ] **Footer** links to Privacy and Terms point to the real pages (not /pricing).
- [ ] Landing page, pricing page, and navigation work; no broken links.

---

## 9. Error handling & monitoring

- [ ] Visit a non-existent URL. ✅ The custom **not-found** page renders.
- [ ] Force a runtime error in a route (temporarily) and confirm the right error
      boundary renders (app / client / dashboard) with a "try again" action.
- [ ] If Sentry DSN is configured, confirm the forced error appears in Sentry.
- [ ] A failed Stripe rollback or an opened dispute is surfaced to monitoring
      (check Sentry / server logs).

---

## 10. Cross-cutting

- [ ] **Mobile**: signup, browse, book, and pay all work on a phone-sized viewport.
- [ ] **Security headers** present on responses (check DevTools → Network →
      Response Headers for HSTS, `X-Content-Type-Options`, etc.).
- [ ] No secrets leak to the browser (search the built client bundle / Network tab
      for service-role or secret keys — there should be none).
- [ ] Final **live-mode** smoke test: one real booking + deposit, then refund it.
