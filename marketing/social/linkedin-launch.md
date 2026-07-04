# LinkedIn — Launch Post

**Suggested attachment:** `marketing/screenshots/01-landing-hero.png` (Landing hero — "Quit the DMs. Get paid up front."). Good alt: swap in `06-dashboard-overview.png` if you want to lead with the product over the pitch.

---

Hair braiders run a real business out of their Instagram DMs.

Think about it: a client wants box braids, so it's twenty messages back and forth. Price? Hair length? Which Saturday? Can you do a deposit? Then the day comes and they ghost — and a 6-hour slot that could've paid the rent sits empty, unrefillable.

The generic schedulers don't fix this. Square, Acuity, Calendly are all built around 30-minute meetings, and they treat a deposit as a paid add-on instead of the whole point.

So I built BraidFlow: a booking-and-deposit page made for braiders. A client picks a style, picks a slot, and pays a deposit through Stripe before the chair is held. Balance is paid in person. The braider runs the week — calendar, clients, revenue, availability — from one dashboard. 100% of the deposit stays with them. No cut.

Two things I'm proud of under the hood. The deposit is the default, not an afterthought — the whole booking state machine is driven by Stripe webhooks, so a slot only locks once money actually lands. And the scheduling is timezone-correct end to end, so counts and revenue read in the braider's own zone, not the server's.

It also deploys with zero backend config — the data layer sits behind one interface, so the demo runs on an in-memory store you can later swap for real Postgres without touching feature code.

Live demo (no signup, sample data): https://braidflow.vercel.app

Built solo with Next.js 14 (App Router, Server Actions), TypeScript, Stripe Connect, Tailwind, and Zod. Feedback welcome — especially from anyone who's braided or booked one.

#buildinpublic #indiehackers #nextjs #stripe #saas #webdevelopment #typescript #smallbusiness
