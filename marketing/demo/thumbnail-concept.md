# BraidFlow — Video Thumbnail Concepts

Three cover options for YouTube (1280×720) and the social recuts (1:1 / 9:16). All three share the brand system so they read as one campaign:

- **Palette:** warm cream/paper (`#F3EBDD`-ish) grounds, onyx/ink text (`#1C1712`), a single gold accent (`#D6A24E`-ish). Never introduce a second accent color.
- **Type:** editorial serif display for the headline (the same family as the app's "Quit the DMs" hero — a high-contrast didone/transitional serif). Small ALL-CAPS let-spaced label in a mono/grotesk for eyebrows, matching the app's "BOOKING, MADE FOR BRAIDERS" tag.
- **Texture:** the soft gold wave-field from the landing hero as a low-contrast background motif; soft gold corner-glow. Rounded cards with a subtle drop.
- **Rules:** high contrast for small sizes, ≤ 5 headline words, one gold keyword max, BraidFlow mark bottom-corner. No stock faces, no invented stats, no emoji.

---

## Concept 1 — "Hero + phone" (recommended default)
**The click:** shows the product doing the one thing that matters — a deposit landing — on a real device, so the value is legible before a word is read.

- **Layout:** split. Left ~55% = headline on cream. Right ~45% = a phone mockup, tilted ~8° with the atelier gold-glow behind it, bleeding off the right edge.
- **Focal image:** the phone shows the **booking confirmation / "Deposit secured"** state (from the landing hero card in `01-landing-hero.png`, or a clean crop of the Scene 7 confirmation). The green check + "$40.00 · Pay & book" → "Deposit secured" pill must be readable.
- **Headline (serif, ink):** **"Get paid** ***up front.****"** — with *up front* in gold italic (mirrors the app's hero styling).
- **Eyebrow (caps, gold, small):** `BOOKING, BUILT FOR BRAIDERS`
- **Supporting chip:** small cream pill, bottom-left over the wave field: **"Deposit locks the slot."**
- **Brand mark:** BraidFlow knot + wordmark, bottom-left corner.
- **Why it earns the click:** it's concrete — a phone, a real payment confirmation, money terms. A braider sees "deposit" + "paid up front" and knows exactly what this solves. The gold keyword pulls the eye to the promise.

---

## Concept 2 — "Big claim" (text-forward)
**The click:** a bold, opinionated statement that names the enemy (the DMs) — pure typography, unmistakable at any size.

- **Layout:** full-bleed onyx (like the login's left panel), the gold wave-field faint behind. Headline centered-left, huge, stacked in 3 lines. No screenshot — this one is a statement.
- **Focal image:** none — the type *is* the image. Optional: one small floating booking card (the "$40 deposit" chip) in the lower-right, glowing, as the only UI hint.
- **Headline (serif display, cream + gold):**
  - Line 1: **Quit the**
  - Line 2: **DMs.** *(gold)*
  - Line 3 (smaller): **Get paid up front.**
- **Eyebrow (caps, gold, small, top):** `THE BOOKING APP FOR BRAIDERS`
- **Brand mark:** BraidFlow wordmark, bottom-center, small.
- **Why it earns the click:** it's the tagline, and it's a fight the audience already has. High-contrast cream-on-onyx serif reads at thumbnail size and in the feed; the single gold "DMs." is the hook word. Zero UI means it works even where screenshots read as "boring software."

---

## Concept 3 — "Before / after" (problem → product)
**The click:** the transformation in one frame — chaos vs. calm — which braiders feel instantly.

- **Layout:** vertical or diagonal split. Left = the problem, desaturated; right = BraidFlow, warm and lit. A thin gold seam (a braid strand) runs down the divide.
- **Focal image:** **Left:** a stylized "DM pile" — overlapping message bubbles ("what's the deposit?", "still available?", "she never paid") rendered in muted gray, deliberately messy. **Right:** a clean crop of the **dashboard KPI band** (`07-analytics.png`) or the calendar (`08-calendar.png`) — "$740," "Confirmed," one tidy week.
- **Headline (serif, ink, top or bottom bar on cream):** **"From the DMs → to** ***done.****"** — *done* in gold.
- **Eyebrow (caps, gold):** `ONE LINK. DEPOSIT UP FRONT.`
- **Brand mark:** BraidFlow mark on the calm (right) side, bottom corner.
- **Why it earns the click:** it dramatizes the exact pain (endless DMs, no deposit) against the payoff (a clean, paid, locked week). The eye travels left-to-right into the product; the gold seam and "done" resolve the tension the messy side creates.

---

### Production notes for all three
- Export **1280×720** (YouTube), plus **1080×1080** and **1080×1920** crops that keep the headline and gold keyword inside the safe area.
- Test each at **~120px wide** (feed/sidebar size): the headline and the one gold word must still read. If not, cut words.
- Pull screenshots from `marketing/screenshots/` — Concept 1 uses `01-landing-hero.png`; Concept 3 uses `07-analytics.png` and/or `08-calendar.png`. Crop tight, keep the app's own type crisp, don't restyle the UI.
- Keep all figures true to the seeded demo ($740, $40 deposit, $180 style). No invented metrics anywhere on the cover.
