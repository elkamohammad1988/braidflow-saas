# BraidFlow — Production Guide

Everything a recorder + editor needs to cut the 75s demo from https://braidflow.vercel.app.
Brand look to protect at every step: warm cream/paper, onyx ink, one gold accent, editorial serif. Quiet luxury / atelier — the motion should feel spring-eased and unhurried, never snappy-corporate.

---

## 1. Recording checklist

### Pre-flight (do all of these before you hit record)
- **Display:** record on a retina / HiDPI screen at **2× scaling**. Target a crisp 1440×900 logical canvas (→ 2880×1800 captured). If you only have 1080p, record 1920×1080 at 2× and downscale on export.
- **Frame rate:** **60fps** capture. Constant, not variable. (ScreenFlow, CleanShot X, or OBS with a display capture at 60fps all work.)
- **Browser:** Chrome, clean **guest/incognito profile** — no extensions, no other tabs.
- **Chrome:** hide the bookmarks bar (`Ctrl/Cmd+Shift+B`). Use a plain window; if you can, record the **viewport only** (hide the address bar via a kiosk/app-mode window, or crop it in post) so no URL bar, no tab strip.
- **Cursor:** default arrow, **normal size** (not enlarged). Turn OFF any OS "shake to find / grow cursor."
- **Demo Mode badge:** open the app, **dismiss the floating "Demo Mode" badge** so it never appears on camera. Confirm it stays dismissed after navigation.
- **Notifications:** enable macOS **Do Not Disturb** / Windows **Focus Assist**. Silence Slack, Mail, calendar, battery, AirDrop, screen-time popups.
- **Seeded data (verify it's present before rolling):** sign in as **Amara Johnson** (`amara@braidflow.app`, any password). Confirm KPIs read **Booked this week 1 · Revenue this month $740 · Awaiting deposit 3 · Total clients 6**; clients include **Zoe Adams, Nia Williams, Imani Clarke**; services include **Knotless Box Braids $180 (5 hr · deposit $40)**. If numbers differ, the seed reset — re-check the brand kit before overlaying any figure.
- **Public page:** confirm `braidflow.vercel.app/braiders/amara-braids` and its `/book` route load and that Stripe checkout is in **test mode** (use card `4242 4242 4242 4242`).
- **Zoom level:** browser at **100%** zoom. Consistent across every scene.
- **Two capture profiles:** desktop (1440×900) for Scenes 2–8, and a separate **390px mobile** profile for Scene 9 (device toolbar, iPhone 12/13/14, 2×).
- **Dry run once** end-to-end untimed, so the booking flow and Stripe test card are muscle-memory before the real take.

### During the record
- One clean take per scene is better than one long take. Record each scene with a few seconds of head/tail to trim.
- Move slowly. Let each screen fully paint before you touch anything — **never** record a loading spinner (the only allowed spinner is the intentional ~0.5s Stripe one in Scene 7).
- Pause ~400ms before every click so the editor can place a click-highlight and a cursor settle.
- On the Scene 7 confirmation, **stop moving entirely** for 3 full seconds. That still frame is the payoff.
- Keep typing at a human pace — no instant paste for the email/card; it should look real.

### Post (export)
- **Master:** 1920×1080 (or 3840×2160 / 4K if the source supports it), **H.264 .mp4**, 60fps, ~16–24 Mbps for 1080p / ~45 Mbps for 4K, `yuv420p`, faststart on.
- **Audio:** stereo AAC, 320kbps. Master loudness **−14 LUFS** integrated (see §4), true-peak ≤ −1 dBTP.
- **Captions:** deliver **two** versions — burned-in (for silent social autoplay) and a separate sidecar **`.srt`** (from scripts.md §c) for YouTube/LinkedIn.
- **Recuts:** from the same 16:9 source, export **9:16 (1080×1920)** and **1:1 (1080×1080)** — reframe on the active element each scene (see §2 notes); keep the booking money moment centered.
- **Color:** do not crush the creams. Keep the paper backgrounds warm (don't let auto-contrast gray them). Protect the single gold accent — it should read the same hue in every scene.

---

## 2. Camera movement (motion on the screen recording)

Treat the flat recording like footage — slow, motivated moves only. Everything spring/ease-in-out, nothing linear. Default push-ins are 3–4% scale over the scene length so they're felt, not seen.

| Scene | Move |
|-------|------|
| 1 · Logo | Mark and wordmark ease up (spring); gold hairline sweep L→R. No push. |
| 2 · Landing | **Slow 3% push-in over 4s** toward the floating booking card (settle on "$40.00 · Pay & book"). End on a 150ms whip-pan left following the cursor to "Log in." |
| 3 · Login | Static hold, then a **subtle 2% push toward the Sign-in button** as the password fills. |
| 4 · Dashboard | **4% push-in across the KPI row over 5s**, drifting slightly right card-to-card so each KPI is "arrived at" as it's named. |
| 5 · Calendar | **Left-to-right parallax drift** across the week strip (~20px), then a **gentle push into Sunday's booking block**. |
| 6 · Clients/Services | Two quick **200ms cross-dissolves** with a small settle-push on each highlighted row. Slight speed-ramp to signal density. |
| 7 · Booking (peak) | Style select: hold. Slot pick: small 2% punch-in as the chip locks. Payment: static, steady. **Confirmation: slow 4% push-in over the last 2s** on the green check — then hold. |
| 8 · KPIs | **Slow push-in on "$740"** while the "0% commission" chip stamps in with a small spring overshoot. |
| 9 · Mobile | Phone floats with **subtle parallax** (2–3° tilt drift); one motivated scroll. |
| 10 · Outro | Dead still. Only the gold underline sweeps under the URL. Let it rest. |

**Speed ramps:** use them only twice — the Calendar→Clients→Services stretch (Scene 5→6) to compress "there's a lot here," and the tiny ramp into the Scene 7 confirmation. Elsewhere, real-time.

**Transitions:** cream flash-dissolves (200–250ms) between dashboard sections; whip-pan/blur cuts on cursor motion; one **device-morph** (KPI cards reflow into the phone) from Scene 8→9. Avoid slides, cubes, or any "PowerPoint" transition.

---

## 3. Cursor movement

The cursor is a character — it should feel like a calm hand, not a nervous mouse.
- **Easing:** every cursor move is **ease-in-out**, arriving and departing slowly. No straight-line constant-velocity drags. Use a smooth-cursor tool to enforce this: **CleanShot X** (built-in cursor smoothing + click highlights), **Screen Studio** (excellent auto-smoothing, cursor-size control, auto-zoom on clicks), or **Cursorful / Screen.studio**-style post smoothing. Screen Studio is the recommended default here — its auto-zoom-to-click pairs perfectly with the push-ins above.
- **Pause before click:** the cursor **settles for ~400ms** on a target before clicking. Never click mid-motion.
- **Click feedback:** add a **soft gold click ring** (single pulse, ~300ms, low opacity) on every click. Keep it small and on-brand — no bright blue system rings.
- **Idle = hidden:** when nothing is being pointed at (holds on the hero, the confirmation, KPI reads), **fade the cursor out** so it doesn't distract. Bring it back only when it's about to act.
- **Pacing:** slow overall. During the booking flow, the cursor can move a touch more purposefully (we're "doing a task"), but still eased.
- **Typing:** show the caret; type at a human ~4 chars/sec for the email and card. No instant fills.
- **Never:** jitter, circle-hunting, double-backs, or overshoot-and-correct. If a take has a wobbly move, re-record the scene.

---

## 4. Background music

Warm, textured, atelier — think a quiet, tasteful maker's-brand film, not a SaaS explainer. Single build across 75s with **one drop that lands exactly on the Scene 7 deposit confirmation (~0:54–0:57)**.

**Option A — "Warm neo-soul / lo-fi" (recommended, most on-brand)**
- Genre/mood: neo-soul-tinged lo-fi; intimate, hand-made, a little gold-hour.
- BPM ~**82–90**. Rhodes/electric piano, soft finger-snaps or brushed kit, warm upright bass, a little vinyl texture, one clean guitar motif.
- Arrangement: sparse intro under the hook; add the bass + keys through the dashboard tour; **drop the full groove (bass + drums land together) on the green "Deposit secured" check**; strip back to keys for the outro.

**Option B — "Editorial acoustic / atelier"**
- Genre/mood: fingerpicked nylon guitar + felt piano + subtle strings; boutique, tactile, confident-calm.
- BPM ~**76–84**. Builds with a light kick + shaker; the **downbeat/swell hits on the deposit confirmation**; resolves warm and open on the tagline.

**Option C — "Modern R&B / downtempo"**
- Genre/mood: polished but soulful; sub-bass warmth, soft trap-adjacent hats kept gentle, airy pad.
- BPM ~**88–96** (half-time feel). The **bass + hats drop on the money moment**; keep it classy, low-mid warmth, nothing aggressive.

**Where the beat drops:** align the track so its biggest moment (bass/drum entry or main swell) hits the **green check in Scene 7 (~0:55)**. Time-stretch or trim the track's intro to make that frame land the drop — this is the one non-negotiable sync point.

**Royalty-free sources:** **Musicbed**, **Artlist**, **Epidemic Sound**, **Uppbeat**, **Soundstripe** (search: "neo soul," "warm lo-fi," "atelier acoustic," "boutique R&B instrumental"). Confirm a license that covers paid social/YouTube. Keep the attribution/license terms with the project files.

**Loudness & mix:**
- Master to **−14 LUFS** integrated for social (YouTube/IG/TikTok/LinkedIn), true-peak ≤ **−1 dBTP**.
- **Duck the music under the VO by ~−8 to −10 dB** (sidechain to the narration) so every line is clear; let the music come back up in the VO gaps and fully at the drop.
- Optional tasteful SFX, low in the mix: a soft click on the slot-chip lock, and a single warm "confirm" chime on the deposit check. Nothing cartoonish.
- No music under the outro URL read except the resolved tail — let "braidflow.vercel.app" sit clean.
