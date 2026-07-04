# GitHub Presentation Package

The GitHub-facing assets live at the **repository root** (where GitHub renders them) and
are indexed here so the marketing package is self-documenting.

## Files (at repo root)
| File | Purpose |
|---|---|
| [`../../README.md`](../../README.md) | World-class README: badges, hero, features, screenshots, architecture diagram, tech stack, project structure, install, deployment, FAQ, license, credits |
| [`../../LICENSE`](../../LICENSE) | Proprietary — All Rights Reserved (available for acquisition/licensing) |
| [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) | Local setup, the CI checks that must pass, and engineering conventions |
| [`../screenshots`](../screenshots) | 16 retina screenshots used across the README and case study |

## Repo "About" blurb (paste into GitHub → About)
> Booking & deposits for hair braiders. A shareable booking page that takes a Stripe
> deposit before a slot is held, plus a full dashboard for the week. Next.js 14 ·
> TypeScript · Stripe · Vercel. Deploys with zero config. Live demo → braidflow.vercel.app

**Website field:** `https://braidflow.vercel.app`

**Topics:** `nextjs` `typescript` `stripe` `tailwindcss` `booking-system`
`appointment-scheduling` `saas` `react` `vercel` `stripe-connect`

## Badge set used in the README
- CI status (GitHub Actions — `ci.yml`: typecheck · lint · test)
- Next.js 14 · TypeScript (strict) · Tailwind CSS 3 · Stripe (Connect + Elements)
- Deployed on Vercel · License: Proprietary

## README section map
Why BraidFlow → Features → Screenshots → Architecture (mermaid) → Tech stack →
Project structure → Getting started → Deployment → Demo & walkthrough → FAQ →
License → Contributing → Credits.

## Pre-publish checklist
- [ ] Repo description + topics + website set (above)
- [ ] Social preview image uploaded (Settings → General → Social preview) — use
      `../screenshots/01-landing-hero.png`
- [ ] Default branch `main`; CI green
- [ ] Release/tag cut if handing over a version
