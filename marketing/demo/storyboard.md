# BraidFlow — Demo Video Storyboard

**Format:** Screen-recorded product walkthrough of the live app (https://braidflow.vercel.app)
**Total runtime:** 75 seconds (target window 60–90s)
**Aspect:** 16:9 master (1920×1080), with a 9:16 and 1:1 social recut from the same source
**Tagline (outro lock):** *Quit the DMs. Get paid up front.*
**Aesthetic:** warm cream/paper, onyx ink, single gold accent, editorial serif display. Quiet-luxury atelier, not neon SaaS.
**Emotional peak:** Scene 7 — the deposit lands and the slot locks.

Every scene walks a real recording. Lower-thirds are set in the brand serif over a translucent onyx bar with a hairline gold rule. Keep them small and bottom-left; never cover the UI's own headline.

---

## At-a-glance timeline

| # | Time | Scene | Route / Screen | Beat |
|---|------|-------|----------------|------|
| 1 | 0:00–0:04 | Logo intro | Brand card (not app) | Hook |
| 2 | 0:04–0:12 | Landing hero | `/` — 01-landing-hero | Problem → promise |
| 3 | 0:12–0:18 | Sign in | `/login` — 05-login | Enter the dashboard |
| 4 | 0:18–0:26 | Dashboard overview | `/dashboard` — 06-dashboard-overview | The week at a glance |
| 5 | 0:26–0:33 | Calendar | `/dashboard/calendar` — 08-calendar | Every slot, one view |
| 6 | 0:33–0:39 | Clients & services | `/dashboard/clients` → `/dashboard/services` — 10, 11 | Who + what you offer |
| 7 | 0:39–0:57 | **Booking workflow (money moment)** | `/braiders/amara-braids/book` | Style → slot → deposit → **locked** |
| 8 | 0:57–1:04 | KPIs / no commission | `/dashboard` KPI band — 06-dashboard-overview | It all rolls up, 0% cut |
| 9 | 1:04–1:10 | Responsive mobile | `/dashboard` @ 390px — 16-mobile-dashboard | Runs from the phone |
| 10 | 1:10–1:15 | Outro CTA | Brand card + URL | Quit the DMs |

---

## Scene 1 — Logo intro
- **Time:** 0:00–0:04 (4s)
- **On-screen action:** Cream card, centered. The onyx BraidFlow mark draws in (gold braid-knot glyph), wordmark fades up beside it with the serif "flow" in gold. A single gold hairline sweeps left-to-right beneath it and settles.
- **Screen / route:** Brand title card (motion graphic, not the app).
- **On-screen text / lower-third:** `BraidFlow` (wordmark). No lower-third.
- **VO:** "The booking's in your DMs. The deposit never came."
- **Transition out:** The gold hairline extends and wipes the card away to the right, revealing the landing hero underneath (match-cut the hairline to the landing's gold wave lines).

## Scene 2 — Landing hero
- **Time:** 0:04–0:12 (8s)
- **On-screen action:** Land on the hero already loaded. Hold 1s on the headline "Quit the DMs. Get paid up front." Slow 3% push-in toward the floating booking card on the right; as we push, the card's "Deposit secured" pill and "$40.00 — Pay & book" button read clearly. Cursor idles off-screen.
- **Screen / route:** `/` (01-landing-hero.png). Real headline, "BOOKING, MADE FOR BRAIDERS" eyebrow, gold wave field, the Nia's Braids booking card mock.
- **On-screen text / lower-third:** lower-third → **Set up in ~15 minutes**
- **VO:** "BraidFlow is the fix. One link — a booking page you set up in about fifteen minutes."
- **Transition out:** Quick 150ms whip-pan left following the cursor as it moves up to "Log in"; cut on the motion blur into the split-screen login.

## Scene 3 — Sign in
- **Time:** 0:12–0:18 (6s)
- **On-screen action:** Login screen loads (onyx left panel "The booking platform built for braiders.", cream right panel "Welcome back"). Cursor eases to the Email field; `amara@braidflow.app` types in at a natural cadence, a short password of dots fills, cursor moves to the gold **Sign in** button, click-pulse. Hold 0.5s on the button press before it navigates.
- **Screen / route:** `/login` (05-login.png).
- **On-screen text / lower-third:** lower-third → **One login. Your whole week.**
- **VO:** "You sign in — and the whole week is already waiting."
- **Transition out:** Soft cream dissolve (250ms) as the dashboard paints in; the gold accent carries across the cut.

## Scene 4 — Dashboard overview
- **Time:** 0:18–0:26 (8s)
- **On-screen action:** Land on "Hi, Amara / Here's how the week is shaping up." Beat, then a gentle 4% push-in across the KPI row. As VO names each metric, a soft gold underline sweeps under that card in turn: **Booked this week — 1**, **Revenue this month — $740**, **Awaiting deposit — 3**, **Total clients — 6**. Settle on the "Up next" card (Nia Williams · Knotless Box Braids · Tomorrow · Confirmed).
- **Screen / route:** `/dashboard` (06-dashboard-overview.png).
- **On-screen text / lower-third:** lower-third → **One dashboard. The whole week.**
- **VO:** "Booked this week. Revenue this month. Deposits still owed. You're caught up in one glance."
- **Transition out:** Cursor moves to the left rail and clicks **Calendar**; cut on the click.

## Scene 5 — Calendar
- **Time:** 0:26–0:33 (7s)
- **On-screen action:** "This week / Jun 29 – Jul 5" with the seven day-columns. Subtle left-to-right parallax drift across the week strip. Push in slightly on Sunday's card — the 6:00 AM Nia Williams · Knotless Box Braids block with the green "confirmed" edge and the $180 booked-value in the corner. The legend "CONFIRMED / AWAITING DEPOSIT" reads at the top.
- **Screen / route:** `/dashboard/calendar` (08-calendar.png).
- **On-screen text / lower-third:** lower-third → **Confirmed vs. awaiting deposit**
- **VO:** "Every appointment on the calendar — confirmed, or still waiting on a deposit."
- **Transition out:** Speed-ramp: quick cursor move to **Clients** in the rail, cut, then a fast 200ms cross-dissolve through Clients into Services (see Scene 6). This ramp signals "and there's more here."

## Scene 6 — Clients & services (quick double-beat)
- **Time:** 0:33–0:39 (6s)
- **On-screen action:**
  - **0:33–0:36** — `/dashboard/clients`: "Clients / Everyone who's booked with you." Hold on the list; a gold underline traces "3 visits · $90 lifetime" on **Zoe Adams**, then "$220 lifetime" on **Imani Clarke**. (Registered clients + guests roll up together.)
  - **0:36–0:39** — cut to `/dashboard/services`: "Services / The styles you offer. Clients pick from this list." Push gently down the list; highlight **Knotless Box Braids — $180 · 5 hr · deposit $40** (this is the style we're about to book).
- **Screen / route:** `/dashboard/clients` (10) → `/dashboard/services` (11).
- **On-screen text / lower-third:** lower-third → **Clients + styles, priced with a deposit**
- **VO:** "Your clients, their lifetime value — and every style you offer, priced, with a deposit set."
- **Transition out:** Cursor clicks **View site** in the lower-left profile card (or open a new tab). Cut to the public booking page. The onyx sidebar slides off-frame left as the cream public page slides in — we're crossing from "the braider's side" to "the client's side."

## Scene 7 — Booking workflow · THE MONEY MOMENT
- **Time:** 0:39–0:57 (18s) — *emotional peak; music builds toward the deposit*
- **On-screen action (client's-eye view, guest checkout — no account):**
  - **0:39–0:42** — Public booking page for **Amara Braids** (`/braiders/amara-braids`). Quick pan across the style list; cursor lands on **Knotless Box Braids · $180 · $40 deposit** and clicks. (Music: begins the build.)
  - **0:42–0:47** — Slot picker on the book route (`/braiders/amara-braids/book`). Day is chosen; three time chips appear. Cursor hovers, then selects a slot chip — it fills gold and locks in (mirrors the landing card's "11:30 AM" state).
  - **0:47–0:51** — Guest details entered fast: name **Simone Carter**, email **simone.carter@gmail.com**. Cursor moves to the dark **"PAY DEPOSIT TO CONFIRM — $40.00 · Pay & book"** bar.
  - **0:51–0:54** — Stripe Elements card field: `4242 4242 4242 4242` types in; the gold **Pay & book** button is clicked. Brief spinner.
  - **0:54–0:57** — Confirmation lands: green check, **"Deposit secured"** / booking confirmed, slot locked. **This is the drop.** Hold dead-still on the confirmation for a full beat. (Music: beat drops exactly on the green check.)
- **Screen / route:** `/braiders/amara-braids` → `/braiders/amara-braids/book` → Stripe checkout → booking confirmation.
- **On-screen text / lower-third:**
  - 0:42 → **Pick the style**
  - 0:45 → **Pick the slot**
  - 0:52 → **Deposit via Stripe**
  - 0:55 → **Slot locked** (large, gold, animates in on the drop)
- **VO:** "Now the client's view. Pick the style. Pick the slot. Pay the deposit through Stripe. No back-and-forth — in about ninety seconds, the chair is locked."
- **Transition out:** Slow 4% push-in over the last 2s on the confirmation, then a warm cream flash-dissolve back into the braider dashboard KPI band — the booking we just made is now part of the numbers.

## Scene 8 — KPIs / no commission
- **Time:** 0:57–1:04 (7s)
- **On-screen action:** Tight framing on the KPI band (06-dashboard-overview.png): **Booked this week / Revenue this month $740 / Awaiting deposit / Total clients**. Slow push-in on **Revenue this month — $740**. A small gold callout stamps in near the revenue card: **0% commission**. The point: the deposit we just took is the braider's, in full.
- **Screen / route:** `/dashboard` KPI band (06-dashboard-overview.png).
- **On-screen text / lower-third:** callout chip → **0% commission · 100% yours**
- **VO:** "Every dollar of that deposit is yours — zero commission, no per-booking cut."
- **Transition out:** The KPI band scales/reflows into a phone frame — a device-morph transition into mobile (the cards restack vertically as they would responsively).

## Scene 9 — Responsive mobile
- **Time:** 1:04–1:10 (6s)
- **On-screen action:** App shown inside a clean phone frame at 390px (16-mobile-dashboard.png): "Hi, Amara", stacked KPI cards, the top tab row (Overview / Calendar / Appointments), "Up next — Nia Williams · Confirmed." A thumb-style cursor gives one short scroll; subtle parallax on the phone. No horizontal overflow — everything fits.
- **Screen / route:** `/dashboard` at mobile width (16-mobile-dashboard.png); optionally flash 14-mobile-landing for 0.5s.
- **On-screen text / lower-third:** lower-third → **Built mobile-first**
- **VO:** "And it runs from the phone in your apron pocket."
- **Transition out:** The phone screen's cream fills the frame and dissolves to the outro card.

## Scene 10 — Outro CTA
- **Time:** 1:10–1:15 (5s)
- **On-screen action:** Return to the brand card. BraidFlow mark centered; the tagline sets in the serif display; the URL underlines with a gold sweep. Hold, clean, quiet. End on stillness (no busy motion under the final line).
- **Screen / route:** Brand title card.
- **On-screen text / lower-third:**
  - Line 1 (serif, large): **Quit the DMs. Get paid up front.**
  - Line 2 (gold, mono-ish caption): **braidflow.vercel.app**
- **VO:** "BraidFlow. Quit the DMs. Get paid up front. braidflow-dot-vercel-dot-app."
- **Transition out:** Fade to cream. End frame holds the URL for 1s past the last word so it's screenshot-able.

---

### Notes for the editor
- The **only** hard emotional beat is Scene 7's confirmation. Everything before it is setup; land the music drop on the green check, not a frame early.
- Keep cuts on cursor motion where possible (whip/blur) so the walkthrough feels intentional, not scrubbed.
- All numbers on screen are the app's own seeded sample data ($740, 6 clients, $180 / $40 deposit). Do not overlay any invented business metrics (no "40% fewer no-shows," etc.).
- If a route paints slowly on record day, capture each scene separately and trim the load; never show a spinner except the intentional ~0.5s Stripe spinner in Scene 7.
