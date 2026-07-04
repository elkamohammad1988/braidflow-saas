# BraidFlow — Demo Video Scripts

Three scripts for one 75-second cut of https://braidflow.vercel.app:
**(a)** Recording script (click-by-click), **(b)** Voice-over (timed narration), **(c)** Captions (silent-autoplay subtitles).

Seeded demo data used throughout: braider **Amara Johnson** (`amara@braidflow.app`, public slug `amara-braids`), clients **Zoe Adams / Nia Williams / Imani Clarke**, services **Knotless Box Braids $180 (5 hr · $40 deposit)**, KPIs **$740 revenue / 1 booked / 3 awaiting / 6 clients**.

---

## (a) RECORDING SCRIPT — click-by-click

Record at 1440×900 logical / 2× retina, 60fps. Dismiss the "Demo Mode" badge before rolling. Move the cursor slowly and deliberately; pause ~400ms before every click. Times below are the *held* duration of each frame in the final cut — record a little extra head/tail on each so there's room to trim.

**SCENE 1 — Logo intro (0:00–0:04)**
This is a motion-graphic card, not a recording. No capture needed. (Editor builds it — see storyboard Scene 1.)

**SCENE 2 — Landing hero (0:04–0:12) — route: `/`**
1. Open `https://braidflow.vercel.app` fresh. Wait for the gold wave field and the floating booking card to finish animating in.
2. Do **not** move the cursor. Hold the fully-loaded hero still — 3s. (You want the "Quit the DMs. Get paid up front." headline and the "$40.00 · Pay & book" card both readable.)
3. Slowly move the cursor up toward **Log in** (top-right). Hover it — do not click yet. Hold 1s.
4. Click **Log in**.

**SCENE 3 — Sign in (0:12–0:18) — route: `/login`**
1. Let the split-screen login paint (onyx left / cream right, "Welcome back").
2. Click the **Email** field. Type `amara@braidflow.app` at a steady human pace (~4 chars/sec).
3. Click the **Password** field. Type any 8 characters (e.g. `braidflow`) — it masks to dots. (Any password works in the demo.)
4. Pause ~500ms. Click the gold **Sign in** button. Hold on the press for ~0.5s before it navigates.

**SCENE 4 — Dashboard overview (0:18–0:26) — route: `/dashboard`**
1. Land on "Hi, Amara / Here's how the week is shaping up." Hold still 1s.
2. Slowly glide the cursor left-to-right across the four KPI cards, pausing ~300ms over each: **Booked this week 1 → Revenue this month $740 → Awaiting deposit 3 → Total clients 6**. (Don't click them.)
3. Drift the cursor down to the **Up next** card (Nia Williams · Knotless Box Braids · Tomorrow · Confirmed). Hold 1s.
4. Move to the left rail and click **Calendar**.

**SCENE 5 — Calendar (0:26–0:33) — route: `/dashboard/calendar`**
1. Let "This week / Jun 29 – Jul 5" load with the day-columns.
2. Slowly move the cursor across the week strip (Mon → Sun), no clicks.
3. Hover over the **Sunday** card — the 6:00 AM **Nia Williams · Knotless Box Braids** block ($180). Hold 1.5s.
4. Move to the rail and click **Clients**.

**SCENE 6 — Clients & services (0:33–0:39)**
*Clients — route: `/dashboard/clients` (0:33–0:36)*
1. Land on "Clients / Everyone who's booked with you."
2. Hover **Zoe Adams** (3 visits · $90 lifetime), then **Imani Clarke** ($220 lifetime). ~1.5s each half-beat.
3. Click **Services** in the rail.

*Services — route: `/dashboard/services` (0:36–0:39)*
4. Land on "Services / The styles you offer. Clients pick from this list."
5. Slowly move down and hover **Knotless Box Braids — $180 · 5 hr · deposit $40**. Hold 1.5s. (This is the style we book next.)
6. Move the cursor to the lower-left profile card and click **View site** (opens the public site). If it opens in the same tab, good; if a new tab, switch to it.

**SCENE 7 — Booking workflow · MONEY MOMENT (0:39–0:57)**
*Public booking page — route: `/braiders/amara-braids`*
1. On Amara Braids' public page, scroll to the services and hover the style list briefly.
2. Click **Knotless Box Braids** ($180 · $40 deposit) → its **Book** button. This routes to `/braiders/amara-braids/book`.

*Slot picker — route: `/braiders/amara-braids/book`*
3. Pick a **date** (the next open Saturday if offered). Three time chips appear.
4. Hover across the time chips, then click one (e.g. **11:30 AM**). It fills gold and locks selected. Hold 1s so the selection is unmistakable.

*Guest checkout (no account)*
5. In the guest fields, type **Name:** `Simone Carter`, **Email:** `simone.carter@gmail.com`. (Realistic guest — no login.)
6. Click the dark **"PAY DEPOSIT TO CONFIRM — $40.00 · Pay & book"** bar / continue to payment.

*Stripe (test mode)*
7. In the Stripe card field type: **card** `4242 4242 4242 4242`, **exp** any future date (e.g. `12 / 34`), **CVC** `123`, **ZIP** `10001`.
8. Pause ~500ms. Click the gold **Pay & book**. Let the brief spinner run (~0.5s — keep it).
9. **Confirmation frame:** the booking-confirmed / "Deposit secured" screen with the green check. **Freeze the cursor completely.** Hold dead-still 3s. This is the peak — do not move anything.

**SCENE 8 — KPIs / no commission (0:57–1:04) — route: `/dashboard`**
1. Navigate back to `/dashboard` (or the KPI band). Frame tight on the four KPI cards.
2. Hover **Revenue this month — $740**. Hold 2s, no clicks. (Editor stamps the "0% commission" chip.)

**SCENE 9 — Responsive mobile (1:04–1:10) — route: `/dashboard` @ 390px**
1. Separate capture: set the browser/device to **390px** width (iPhone 12/13/14 profile), 2×, still signed in as Amara.
2. Load `/dashboard`. Show "Hi, Amara", the stacked KPI cards, the Overview/Calendar/Appointments tab row.
3. One short, smooth scroll down to reveal the **Up next — Nia Williams · Confirmed** card, then scroll back up ~halfway. Hold 1s.
4. (Optional 0.5s flash: mobile landing `/` for the hero.)

**SCENE 10 — Outro (1:10–1:15)**
Motion-graphic card, no capture. (Editor builds the tagline + URL card — see storyboard Scene 10.)

---

## (b) VOICE-OVER SCRIPT — final narration (timed)

**Direction:** Warm, plain-spoken, confident. One braider-to-braider. Concrete nouns — deposit, slot, chair, DMs. Vary the length; let the short lines breathe. Don't rush. The hook must land inside the first 3 seconds. ~135 words total, comfortable for 75s.

> **[0:00 — hook, over the logo]**
> "The booking's in your DMs. The deposit never came."
>
> **[0:04 — landing]**
> "BraidFlow is the fix. One link — a booking page you set up in about fifteen minutes."
>
> **[0:12 — login]**
> "You sign in, and the whole week is already waiting."
>
> **[0:18 — dashboard]**
> "Booked this week. Revenue this month. Deposits still owed. You're caught up in one glance."
>
> **[0:26 — calendar]**
> "Every appointment on the calendar — confirmed, or still waiting on a deposit."
>
> **[0:33 — clients & services]**
> "Your clients, their lifetime value — and every style you offer, priced, with a deposit set."
>
> **[0:39 — booking / money moment]**
> "Now the client's view. Pick the style. Pick the slot. Pay the deposit through Stripe."
> *(beat — let the payment happen)*
> "No back-and-forth. In about ninety seconds, the chair is locked."
>
> **[0:57 — KPIs]**
> "Every dollar of that deposit is yours — zero commission, no per-booking cut."
>
> **[1:04 — mobile]**
> "And it runs from the phone in your apron pocket."
>
> **[1:10 — outro]**
> "BraidFlow. Quit the DMs. Get paid up front. Braidflow-dot-vercel-dot-app."

*Word count ≈ 135. Read pace ≈ 1.8 words/sec with pauses. If the read runs long, cut the "no per-booking cut" tail first.*

---

## (c) CAPTION / SUBTITLE SCRIPT — silent-autoplay chunks

Burn-in style: brand serif or clean sans, cream text on a translucent onyx pill, bottom-center, 2–5 words per card, one gold keyword per phrase where noted. Also delivered as `.srt` (below matches the VO exactly). Keep each card on screen ≥1s.

```
1
00:00:00,300 --> 00:00:02,200
The booking's in your DMs.

2
00:00:02,200 --> 00:00:04,000
The deposit never came.

3
00:00:04,300 --> 00:00:06,600
BraidFlow is the fix.

4
00:00:06,600 --> 00:00:09,200
One link.

5
00:00:09,200 --> 00:00:12,000
Set up in ~15 minutes.

6
00:00:12,300 --> 00:00:15,000
You sign in —

7
00:00:15,000 --> 00:00:18,000
the whole week is waiting.

8
00:00:18,300 --> 00:00:20,600
Booked this week.

9
00:00:20,600 --> 00:00:22,800
Revenue this month.

10
00:00:22,800 --> 00:00:26,000
Caught up in one glance.

11
00:00:26,300 --> 00:00:29,600
Every appointment, one calendar.

12
00:00:29,600 --> 00:00:33,000
Confirmed, or awaiting deposit.

13
00:00:33,300 --> 00:00:36,200
Your clients. Their lifetime value.

14
00:00:36,200 --> 00:00:39,000
Every style, priced with a deposit.

15
00:00:39,300 --> 00:00:42,000
Now the client's view.

16
00:00:42,000 --> 00:00:44,500
Pick the style.

17
00:00:44,500 --> 00:00:47,500
Pick the slot.

18
00:00:47,500 --> 00:00:51,000
Pay the deposit — via Stripe.

19
00:00:51,000 --> 00:00:54,000
No back-and-forth.

20
00:00:54,000 --> 00:00:57,000
~90 seconds. Slot locked.

21
00:00:57,300 --> 00:01:00,500
Every deposit is yours.

22
00:01:00,500 --> 00:01:04,000
0% commission.

23
00:01:04,300 --> 00:01:07,000
Runs on your phone.

24
00:01:07,000 --> 00:01:10,000
Built mobile-first.

25
00:01:10,300 --> 00:01:12,800
Quit the DMs. Get paid up front.

26
00:01:12,800 --> 00:01:15,000
braidflow.vercel.app
```

**Caption keyword colors:** set these words in the gold accent — *deposit, Stripe, locked, yours, 0% commission,* and the final *braidflow.vercel.app*. Everything else cream.
