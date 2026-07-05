# Twitter / X — Launch Thread

Casual, confident, concrete. Attach the noted image to each tweet. Tweet char counts kept under 280.

---

**1/ (hook)** 🧵
*Attach: `01-landing-hero.png`*

Hair braiders run a whole business out of their Instagram DMs — 20 messages to book one appointment, then a no-show burns a 6-hour slot.

I built BraidFlow: a booking page that takes the deposit up front, so the chair only holds once they've paid.

---

**2/ the deposit moment**
*Attach: gif of the checkout step, or `01-landing-hero.png`*

The generic tools treat a deposit as a paid add-on. For braiders it's the whole point.

In BraidFlow the deposit IS the booking. Pick a style → pick a slot → pay through Stripe. Balance is paid in person. 100% of the deposit stays with the braider. No cut.

---

**3/ guest checkout**
*Attach: `04-braiders-directory.png`*

No "create an account to continue" wall. A client can book as a guest in ~90 seconds — email, style, slot, deposit, done.

Every extra step between a client and paying you is a chance for them to close the tab.

---

**4/ the dashboard**
*Attach: `06-dashboard-overview.png`*

Once it's set up, the braider runs the week from one screen: booked this week, revenue this month, awaiting deposit, total clients — plus who's up next.

The DMs stop being the database.

---

**5/ the calendar**
*Attach: `08-calendar.png`*

Braiding isn't 30-minute meetings. It's 4–8 hour blocks.

So availability is built for that — weekly hours, plus one-tap day-blocks for vacations and kids' events. And it's timezone-correct, so the numbers read in the braider's own zone.

---

**6/ how it's built**
*Attach: `06-dashboard-overview.png`*

Stack: Next.js 14 (App Router + Server Actions), TypeScript strict, Stripe Connect, Tailwind, Zod, date-fns.

Mutations are server actions validated with Zod. A Stripe webhook is the source of truth for payment → booking confirmed. Nothing locks a slot on trust.

---

**7/ zero-config deploy**
*Attach: `11-services.png`*

My favorite part: it deploys with no backend to set up. No env vars required.

The data layer sits behind one `db()` interface — the demo runs on an in-memory store with seeded sample data, swappable for real Postgres without touching feature code.

---

**8/ a build lesson**
*Attach: `16-mobile-dashboard.png`*

The hard part wasn't Stripe. It was the state machine.

pending_payment → confirmed → completed / cancelled, plus auto-expiring unpaid holds via cron. Money and calendar have to agree at every step or you double-book a chair. That's where the real work went.

---

**9/ CTA**
*Attach: `01-landing-hero.png`*

Live demo — no signup, sample data, poke at everything:
https://braidflow.vercel.app

Built solo by @elkamohammad1988. If you braid, book braids, or just like booking flows, tell me what you'd change.
