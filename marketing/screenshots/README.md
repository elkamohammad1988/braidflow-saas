# BraidFlow — Portfolio Screenshot Set

Curated for hiring. Quality over quantity — only shots that make a prospective
client want to work with the person who built this. Present them **in this order**;
it walks the funnel: land → browse → **book (the money moment)** → run the business
→ it's mobile.

## Before you recapture

Screenshots are captured manually (no headless browser in this repo). For the
fullest dashboard and calendar:

1. **Restart the dev/prod server, then capture Monday–Wednesday.** The demo data
   is anchored to the *current* week and to the braider's timezone, so an
   early-week capture shows a full "Booked this week / Up next"; late in the week
   most of it has already passed.
2. Capture at **2× / retina**, viewport **1440×900** for desktop, **390×844**
   (iPhone) for mobile.
3. Sign in as the braider with any credentials (email `amara@braidflow.app`).

## The set (present in this order)

| # | File | Route | Why it's in |
|---|------|-------|-------------|
| 1 | `01-landing-hero.png` | `/` | The hook. The whole pitch + the real booking card, not a stock mock. Best single asset — lead with it everywhere. |
| 2 | `04-braiders-directory.png` | `/braiders` | Proves it's a two-sided product (marketplace + booking). **Recapture once real braider photos are in** — the empty cards are the one weak spot. |
| 3 | `03-booking-confirmed.png` | `/bookings/e0000000-0000-4000-8000-0000000000f1/confirmation?t=demo-confirm-simone` | **The money shot.** "You're on the books" + the gold deposit receipt (Amara Braids · Knotless Box Braids · $40 paid / $140 balance). The product's entire thesis in one screen. |
| 4 | `05-login.png` | `/login` | Premium split-screen. The craft signal that separates "designed" from "bootstrapped." Transitions the story to the braider's side. |
| 5 | `06-dashboard-overview.png` | `/dashboard` | The command center — KPI cards + a full "Up next" (now several appointments, not one). |
| 6 | `09-bookings.png` | `/dashboard/appointments` | The strongest data screen. Dense, real data, all five status states incl. a **no-show** (deposit kept) and a **cancelled → deposit refunded**. Real names on every row now. |
| 7 | `08-calendar.png` | `/dashboard/calendar` | Distinctive week view built for 4–8h blocks — a full week, sane hours. Product thinking specific to the domain. |
| 8 | `11-services.png` | `/dashboard/services` | The deposit-pricing model made visible — per-style price, duration, deposit. On-brand and on-thesis. |
| 9 | `14-mobile-landing.png` | `/` @ 390px | Responsive proof. The hero holds up at 390px. |
| 10 | `16-mobile-dashboard.png` | `/dashboard` @ 390px | Responsive dashboard — the app runs from the phone in the apron pocket. |

Tight "greatest hits 8": drop #7 (calendar) and #10 (mobile-dashboard) if you need
a leaner gallery. Never drop #1, #3, or #5.

## The one video (record this — it does not exist yet)

A 45–60s screen-recording of the live app, cut **money-moment-first**: open on the
"Slot locked / Deposit secured" confirmation, rewind to the pitch, then walk
style → slot → Stripe deposit → *slot locked*. See `../demo/storyboard.md` for the
full shot list. **Lead the Upwork profile and portfolio page with the video, not a
still.**

## Removed (recoverable via git) — and why

- `02-landing-features.png` — awkward crop; **re-shoot a clean crop of just the
  "Three steps. Then it runs itself." section** — that content is worth keeping.
- `03-landing-full.png` — 11k-px full-page stitch; unwieldy in a gallery.
- `07-analytics.png` — just a crop of the dashboard stat cards; redundant.
- `12-availability.png` / `13-settings.png` — utility screens; keep for the written
  case study, not the gallery.
- `15-mobile-navigation.png` — weakest mobile; #9 and #10 already prove responsive.
