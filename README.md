# Global Gate Logistics — global-gate.us

This is the source code for the Global Gate Logistics website. It is built with
[Astro](https://astro.build), a tool that turns this code into plain HTML pages before
anyone visits the site. That matters for two reasons: pages load fast, and search
engines (and AI tools that read the web) can read every page's text directly, without
needing to run any JavaScript first.

This file is written for whoever owns or maintains the site next — it assumes no
prior knowledge of the codebase.

## Commands

Run these from a terminal in this folder, after running `npm install` once to
download the project's dependencies.

| Command | What it does |
|---|---|
| `npm run dev` | Starts a local preview at `http://localhost:4321` that updates live as you edit files. Use this while making changes. |
| `npm run build` | Builds the real site into the `dist/` folder (and into `.vercel/output/` in the format Vercel needs to deploy it). This is what runs automatically every time the site is deployed. |
| `npm run preview` | Astro's built-in "preview the production build" command. Note: this project deploys through the Vercel adapter, which this command does not support — it will error rather than serve the site. To see the real built output locally, build the site and serve the `dist/client` folder with any static file server. |
| `npm run astro` | Runs the underlying Astro command-line tool directly (for example `npm run astro -- --help`). Only needed for one-off Astro CLI tasks; day-to-day work uses the other commands. |
| `npm test` | Runs the automated test suite once (currently 260 tests covering components, page content, and site-wide rules such as "the copyright year is always correct" and "the site never claims 24/7 support"). Run this after any change. |
| `npm run test:watch` | Same tests as `npm test`, but stays running and re-checks automatically as you edit files. Useful while actively making changes. |
| `npm run test:build` | Builds the site, then runs an additional set of tests against the real built files (checking things like the sitemap and SEO tags exactly as they will appear live). These particular tests are kept separate from `npm test` because they need a finished build to check — running them before a build exists would just fail for the wrong reason. This command guarantees a fresh build happens first, using a second test configuration file, `vitest.build.config.ts`. |
| `npm run test:e2e` | Runs end-to-end browser tests that simulate a real visitor: loading pages and submitting the quote form, using a real (headless) browser via Playwright. |

Before deploying or handing off work, `npm test`, `npm run test:build`, and
`npm run test:e2e` should all pass.

## Editing content

Almost everything visible on the site is stored as plain data files, not mixed in
with code, so most changes do not require any coding knowledge — just careful
editing of the values in these files:

- **`src/config/site.ts`** — the single source of truth for every company fact:
  address, phone numbers, email, business hours, licenses/certifications, social
  media links, year founded, and more. Changing a value here updates it everywhere
  it appears on the site, including the hidden data search engines read (structured
  data). If a fact needs to change, this is almost always the file to edit.
- **`src/data/services.ts`** — the text for each service page: descriptions, bullet
  points, and FAQs.
- **`src/data/testimonials.ts`** — client testimonials shown on the site.
- **`src/data/partners.ts`** — carrier and association logos shown on the site.
- **`src/data/stats.ts`** — the three highlight numbers shown near the top of the
  homepage (e.g. "20+ Years Experience").

After editing any of these files, run `npm test` to confirm nothing broke, then
`npm run build` to confirm the site still builds.

## Facts still to supply

A few real facts were not available when this site was built, so the site was
built to handle their absence honestly: each one is currently set to an empty
value (`null` or an empty list) in the data files above, and the site simply does
not show that section at all until a real value is supplied. Nothing needs to be
"turned on" in the code — filling in the value in the data file is enough to make
the corresponding section appear.

Still needed:

- **FMC license number** — `credentials.fmcNumber` in `src/config/site.ts`
- **IATA membership number** — `credentials.iataNumber` in `src/config/site.ts`
- **Business hours** — `hours.schema` and `hours.display` in `src/config/site.ts`
- **Year founded** — `founded` in `src/config/site.ts`
- **Real social media URLs** — `social.facebook`, `social.instagram`, and
  `social.linkedin` in `src/config/site.ts` are all currently empty; the site never
  links to a social profile that isn't real
- **Testimonials** — `src/data/testimonials.ts` is currently an empty list; each
  entry needs a real name, title, and company, since anonymous quotes were judged
  not to build trust
- **Carrier and association logos** — `src/data/partners.ts` is currently an empty
  list; showing a carrier's logo without a real relationship is a legal risk, so
  this stays empty until confirmed
- **Real facility and cargo photos** — the images currently used for the hero
  banner and service pages are placeholders, not real photos of this company's
  warehouse, staff, or operations

## Replacing images

Images can be swapped by overwriting the file in `public/images/` with the same
filename (e.g. replacing `service-warehouse.webp` with a real photo saved under
that same name). The site is configured so a replaced image reaches visitors
within about an hour, rather than being cached for a year.

## Environment variables (set in Vercel)

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | API key for Resend, the service that delivers quote request emails |
| `QUOTE_FROM_EMAIL` | The verified sending address, e.g. `website@global-gate.us` |
| `QUOTE_TO_EMAIL` | The address quote requests are delivered to |

Copy `.env.example` to `.env` for local development if you need the quote form
to actually send email from your machine — `.env` is git-ignored and never
committed. In production these three values are set directly in Vercel
(Settings → Environment Variables), not in a file.

## Deploying (GitHub + Vercel)

This site is not deployed yet. Once it is, **pushing to the `main` branch
builds and publishes automatically** — no manual deploy step after the initial
setup below.

1. **Create an empty GitHub repository** at [github.com/new](https://github.com/new).
   Do **not** check "Add a README", "Add .gitignore", or "Choose a license" —
   this project already has all of those; an initialized repo would conflict
   with the code being pushed.
2. **Push this code to it:**
   ```bash
   git remote add origin <the URL GitHub gives you>
   git checkout main
   git merge feat/website-rebuild
   git push -u origin main
   ```
3. **Connect Vercel:** sign in at [vercel.com](https://vercel.com) with your
   GitHub account, click **Add New → Project**, and import the repository you
   just pushed. Vercel detects Astro automatically — accept the defaults.
4. **Add the three environment variables above** under Vercel's
   **Settings → Environment Variables** (apply each to Production, Preview,
   and Development) before the first deploy.
5. **Deploy.** You'll get a `*.vercel.app` URL — test the quote form there
   first (confirm a real email arrives) before pointing the real domain at it
   in Vercel's **Settings → Domains**.

`npm test`, `npm run test:build`, and `npm run test:e2e` all pass as of this
handover — see [docs/HANDOFF.md](docs/HANDOFF.md) for the full status and
everything still outstanding (a few company facts, most of the planned blog
articles, and analytics).

## A note on privacy and analytics

The privacy policy (`src/pages/privacy-policy.astro`) currently states, truthfully,
that this site runs no analytics or tracking scripts of any kind — and an
automated test (`tests/components/utility-pages.test.ts`) checks that the policy
never claims otherwise. If analytics is ever added to the site in the future, the
privacy policy text and that test must both be updated in the same change, so the
policy never says something the site no longer does.
