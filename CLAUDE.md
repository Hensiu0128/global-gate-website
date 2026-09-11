# CLAUDE.md

Standing context for Claude Code sessions in this repository. Read before acting.

## What this is

The Global Gate Logistics website (`global-gate.us`) — a freight forwarder in Queens, NY.
Astro 7 static site + Tailwind 4, deployed on Vercel, quote emails via Resend.
17 pages, 269 tests. **Phase 1 is complete.** The roadmap for everything else is
[docs/HANDOFF.md](docs/HANDOFF.md) — read it before starting any substantial work.

The site owner is **not a developer**. Explain trade-offs in plain language, recommend a
specific option rather than presenting a menu, and never assume familiarity with the
toolchain.

## Load-bearing guarantees — do not break these

Each has a test that fails the build if violated. Each exists for a concrete reason.

1. **Every page must be fully readable with JavaScript disabled.** AI crawlers (GPTBot,
   ClaudeBot, PerplexityBot) do not execute JS. This is the entire reason the site can be
   cited by AI search. Never introduce a component whose *content* requires JS to appear.
   Progressive enhancement only — native `<details>` over JS toggles, real `action`/`method`
   on forms before any `fetch` enhancement.
2. **The quote form must never report success unless the email was actually delivered.**
   The previous site silently discarded every lead. `src/pages/api/quote.ts` returns 200 /
   redirects to `/quote/sent` *only* after Resend confirms. The honeypot is the one
   deliberate exception and is commented as such.
3. **Never publish an unverified business fact.** No invented license numbers, no
   anonymous testimonials, no carrier logos without a confirmed relationship, no invented
   pricing, review counts, or founding dates. Unknown facts are `null` and the section
   simply does not render. If a fact is needed and unknown, ask — do not fill it in.
4. **Every company fact comes from `src/config/site.ts`.** It feeds the visible page, the
   JSON-LD structured data, and `public/llms.txt` together. Never hardcode an address,
   phone, email, or credential anywhere else.
5. **The privacy policy must describe only what the site actually does.** It currently
   states there is zero analytics and zero tracking — which is true. If analytics is ever
   added, `src/pages/privacy-policy.astro` and the accuracy test in
   `tests/components/utility-pages.test.ts` must be updated **in the same commit**.
6. **Never write "24/7"** anywhere. The business runs business hours.
7. **Never send personal data to analytics.** No name, email, phone, company, or cargo
   description may reach GA4 or any tracking tool. Categories and opaque IDs only.

## Commands

```bash
npm install          # once
npm run dev          # local preview at http://localhost:4321
npm run build        # production build
npm test             # 212 unit + component tests
npm run test:build   # builds, then 54 tests against the real built HTML
npm run test:e2e     # 3 real-browser tests incl. the full quote flow
```

All three test commands must pass before any deploy.

## Gotchas

- **Built HTML lands in `dist/client/`, not `dist/`** — the Vercel adapter nests it. Any
  script or test reading build output must target `dist/client/**`.
- **`npm run preview` does not work here** — the Vercel adapter doesn't support it. To
  inspect a real build locally: `npm run build && npx serve dist/client`.
- **Tailwind 4** — design tokens live in `@theme` inside `src/styles/global.css`. There is
  no `tailwind.config.js` and adding one is wrong.
- Windows host. The Bash tool is available for POSIX scripts; PowerShell is the default shell.
- `.superpowers/sdd/2026-08-09-global-gate-phase-1/progress.md` is the build ledger — every
  task, every defect found, and 20 deferred minor issues. It is git-ignored but present on disk.

## Where to change what

| To change | Edit |
|---|---|
| Any company fact (address, phone, hours, licenses, social, founded) | `src/config/site.ts` |
| Service page copy, bullets, FAQs | `src/data/services.ts` |
| Testimonials / partner logos / homepage stats | `src/data/testimonials.ts`, `partners.ts`, `stats.ts` |
| Quote form fields and validation | `src/lib/quote-validation.ts` |
| Email delivery, redirects, failure handling | `src/pages/api/quote.ts` |
| Structured data (JSON-LD) | `src/lib/schema.ts` |
| Titles, meta descriptions, canonicals | `src/lib/seo.ts` |
| Site-wide `<head>` | `src/layouts/BaseLayout.astro` |
| Redirects, security headers, caching | `vercel.json` |
| AI crawler permissions / AI-readable summary | `public/robots.txt`, `public/llms.txt` |

## Working style for this project

- **Test-first.** Write the failing test, watch it fail, then implement. The existing suite
  was built this way and several real bugs were caught only because a test was written before
  the fix.
- **Verify before claiming.** Run the command and show the output. Never report "done" or
  "fixed" without evidence in the transcript.
- **Facts the owner hasn't supplied stay empty.** See guarantee 3. There is a list of the
  outstanding ones in Part B of `docs/HANDOFF.md`.
- **Deployment, DNS, account creation, and `git push` are the owner's decisions.** Prepare
  the change and explain the step; do not execute account-level or outward-facing actions
  without being asked.
