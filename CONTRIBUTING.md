# Contributing & development guide

BraidFlow is a **proprietary project** (see [`LICENSE`](LICENSE)) and isn't accepting
outside contributions or pull requests. This guide exists so anyone **evaluating the
code or taking it over** can get productive in minutes and understand the conventions
it's held to.

## Local setup

**Prerequisites:** Node.js 20+ and npm.

```bash
git clone https://github.com/elkamohammad1988/braidflow-saas.git
cd braidflow-saas
npm install
npm run dev          # http://localhost:3000
```

No environment variables are required — the app runs on local session auth and an
in-memory dataset. Sign in with any email/password; use `amara@braidflow.app` to enter
the braider dashboard. Copy `.env.example` to `.env.local` only to switch on optional
integrations (Stripe, Resend, Sentry, cron).

## The checks that must pass

CI (`.github/workflows/ci.yml`) runs on every push and pull request. Run the same
checks locally before considering a change done:

```bash
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # next lint
npm run test         # vitest
npm run build        # production build must succeed
```

A change isn't finished until typecheck, lint, tests, and the production build are all
green.

## Conventions

- **TypeScript, strict.** No `any` escapes; model data with real types (`types/db.ts`).
- **Server-first.** Reads happen in server components. Mutations are **server actions**
  and every input is validated with **Zod** before it touches data.
- **Data through one seam.** Feature code never reaches into the store directly — it goes
  through `db()` / `dbAdmin()` (`lib/db/`). Keep it that way so the backend stays swappable.
- **Auth in one place.** Session logic lives in `lib/auth/`. Route protection is the
  Edge middleware reading the signed cookie; don't scatter auth checks.
- **Money and time are exact.** Amounts are integer cents. Dates that a braider sees are
  computed in their timezone (`lib/timezones.ts`, `@date-fns/tz`) — never the server's.
- **Payments are webhook-driven.** Stripe webhooks are the source of truth for confirming
  a booking; keep handlers idempotent.
- **Design system first.** Reuse the primitives in `components/ui/` and the tokens in
  `tailwind.config.ts` rather than one-off styles.
- **Commits.** Conventional-style, imperative subject (`feat:`, `fix:`, `chore:`,
  `docs:`), focused and self-contained.

## Project layout

See the **Project structure** section of the [README](README.md#project-structure) for a
full map of `app/`, `components/`, and `lib/`.
