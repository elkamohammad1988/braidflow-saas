# BraidFlow — SEO & Metadata Package

Copy-ready metadata for the marketing site and social cards, plus structured-data
recommendations. Canonical URL: **https://braidflow.vercel.app**

---

## Meta title
Primary (58 chars):
> **BraidFlow — Booking & Deposits for Hair Braiders**

Alternates:
- BraidFlow · Take Deposits, Stop No-Shows | Braider Booking (59)
- Booking Software for Braiders with Stripe Deposits — BraidFlow (61)

> Keep titles ≤ 60 chars. Lead with the brand for branded search, keyword ("booking",
> "deposits", "braiders") in the first half for the rest.

## Meta description
Primary (154 chars):
> BraidFlow gives hair braiders a booking page that takes the deposit up front through
> Stripe — so no-shows stop costing a whole day. Set up in 15 minutes.

Alternate (148 chars):
> A booking-and-deposit platform built for braiders. Clients pick a style, pay a Stripe
> deposit, and lock the slot. Run your whole week from one dashboard.

## Keywords / target queries
**Head:** braider booking app · booking software for braiders · hair braiding
appointment app · take deposits for appointments · no-show protection booking
**Long-tail:** how to take a deposit for braiding appointments · booking site that
requires a deposit · Stripe deposit booking system · appointment booking for long
services · booking page for hair stylists with deposits · braider scheduling software
with payouts · stop no-shows braiding business

## Open Graph
- **og:type** — `website`
- **og:site_name** — `BraidFlow`
- **og:title** — `BraidFlow — Quit the DMs. Get paid up front.`
- **og:description** — `A booking page for braiders that takes the deposit up front through Stripe and runs your whole week from one dashboard.`
- **og:url** — `https://braidflow.vercel.app`
- **og:image** — 1200×630 (the app already generates one at `/opengraph-image`); alt: "BraidFlow — booking and deposits for hair braiders."

## Twitter / X card
- **twitter:card** — `summary_large_image`
- **twitter:title** — `BraidFlow — Quit the DMs. Get paid up front.`
- **twitter:description** — `Booking + deposits for hair braiders. Clients pay a Stripe deposit before the slot is held. Set up in 15 minutes.`
- **twitter:image** — same 1200×630 OG image
- **twitter:creator** — `@elkamohammad1988`

---

## Structured data recommendations (JSON-LD)

The braider profile pages already emit structured data; extend coverage on the marketing
and directory pages. Use `application/ld+json` in the document head.

**1. Marketing home → `SoftwareApplication`**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "BraidFlow",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "A booking-and-deposit platform for hair braiders. Clients pay a Stripe deposit before a slot is held.",
  "url": "https://braidflow.vercel.app",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
```

**2. Brand → `Organization`** (name, logo, url, `sameAs` → social profiles) so the brand
can earn a knowledge panel.

**3. Braider public profiles → `LocalBusiness` / `HairSalon`** with `aggregateRating`
(from the review data already on the page), `priceRange`, `areaServed`, and an
`makesOffer` list of services with `Offer` + `price`. This is the highest-value markup —
it makes individual braider pages eligible for rich results.

**4. Directory / listing pages → `ItemList`** of the braider profiles.

**5. Marketing FAQ section → `FAQPage`** (reuse the questions from the landing FAQ and
the README FAQ) for FAQ rich results.

**6. Breadcrumbs → `BreadcrumbList`** on nested routes (directory → profile → booking).

### Technical SEO already in place (keep/verify)
- `app/sitemap.ts` and `app/robots.ts` — driven by `NEXT_PUBLIC_SITE_URL` (set to the
  production domain so URLs resolve to the canonical host, not the fallback).
- `app/opengraph-image.tsx` — dynamic 1200×630 social image.
- `app/manifest.ts` — installable PWA metadata.
- Dashboard routes set `robots: { index: false }` — keep private app UI out of search.
- Per-page `metadata` with unique titles/descriptions; add `alternates.canonical`
  on public pages.

### Quick wins
- Set a real production domain (custom domain) and update `NEXT_PUBLIC_SITE_URL` +
  canonical so all absolute URLs match.
- Add `aggregateRating` markup wherever ratings are shown.
- Ensure every public page has one `<h1>` and a unique meta description.
- Submit the sitemap in Google Search Console once a custom domain is live.
