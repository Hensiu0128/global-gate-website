# Global Gate Logistics — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a live, fast, crawlable, conversion-optimized website for Global Gate Logistics at `https://global-gate.us`, replacing the JavaScript-only Manus single-pager with static HTML across 13 pages and a quote form that actually delivers leads.

**Architecture:** Astro outputs static HTML at build time (zero JavaScript required to read any content), so Google, GPTBot, PerplexityBot, and ClaudeBot all receive full content on first request. A single `src/config/site.ts` module is the sole source of truth for name, address, phone, credentials, and hours — every component and every JSON-LD block reads from it, making the NAP inconsistency that breaks local SEO structurally impossible. One serverless endpoint (`/api/quote`) handles form delivery via Resend. Tailwind CSS 4 carries the design tokens extracted from the existing site.

**Tech Stack:** Astro 5 · Tailwind CSS 4 · TypeScript (strict) · Vitest + `astro/container` for component tests · Playwright for end-to-end · Resend for transactional email · Vercel for hosting

**Spec:** [`docs/superpowers/specs/2026-08-09-global-gate-website-design.md`](../specs/2026-08-09-global-gate-website-design.md)

**Phase 1 scope:** Foundation, design system, layout, homepage, about, contact, quote page, 6 service pages + hub, working quote form, SEO/GEO plumbing, live deployment.
**Not in Phase 1:** Blog, trade-lane pages, location pages, partner pages, search engine registration. Those are Phases 2 and 3, each with its own plan.

---

## Global Constraints

These apply to **every** task. Do not restate them per task; do not violate them.

- **Node:** ≥ 20.11. **Package manager:** npm.
- **Shell commands in this plan are Bash**, not PowerShell. On Windows, run them through the Bash tool (Git Bash). `mkdir -p`, `printf`, `curl`, and `$VAR` all fail in PowerShell.
- **TypeScript strict mode on.** No `any` without an inline justification comment.
- **Zero client-side JavaScript is required to read content.** JS may only enhance (menu toggle, form stepper, FAQ accordion). Every page must be fully readable with JS disabled. This is the entire reason for the rebuild — a violation here defeats the project.
- **Exactly one `<h1>` per page.** Heading levels never skip.
- **Canonical host is `https://global-gate.us`** (apex, no `www`, no trailing slash except root).
- **All facts come from `src/config/site.ts`.** Never hardcode a phone number, address, email, or credential in a component or page. Enforced by a test.
- **Unknown facts are `null`, never placeholder strings.** No "TBD", "XXX", "Coming soon", or "Lorem ipsum" may ever reach the built output. Enforced by a test. Components render nothing when a fact is `null`.
- **The quote form must never show success unless the lead was actually captured.** This is defect D1 from the spec, the single most expensive bug on the old site.
- **Copyright year is computed at build time**, never hardcoded (defect D6).
- **Business hours only.** Never write "24/7" anywhere (defect D8).
- **Commit after every task.** Conventional Commits format (`feat:`, `fix:`, `test:`, `chore:`).
- **Colors, verbatim:** navy-900 `#0A1628` · navy-800 `#1E3A5F` · navy-950 `#060E1A` · amber-500 `#F59E0B` · amber-400 `#FBBF24`
- **Fonts, verbatim:** Barlow Condensed (400/600/700/800) display · Source Sans 3 (300/400/500/600) body. Self-hosted, `font-display: swap`.
- **H1 type scale, verbatim:** `clamp(3rem, 8vw, 5.5rem)`, weight 800, line-height 0.95, letter-spacing −0.01em.
- **Performance budget:** Lighthouse mobile ≥ 95 in all four categories.

---

## File Structure

```
astro.config.mjs              Astro + Tailwind + Vercel adapter + sitemap
vitest.config.ts              Vitest via astro/config getViteConfig
playwright.config.ts          E2E against the production build
tsconfig.json                 strict
vercel.json                   security headers, www redirect
.env.example                  documents required secrets
.gitignore

public/
  robots.txt                  explicit AI-crawler allowances
  llms.txt                    AI-readable company + page summary
  fonts/                      self-hosted woff2
  images/                     migrated + optimized source assets

src/
  config/site.ts              ← SINGLE SOURCE OF TRUTH. NAP, credentials, hours, socials, nav.
  data/
    services.ts               6 services: slug, names, copy, image, FAQs
    testimonials.ts           real-name testimonials (empty until supplied)
    stats.ts                  hero stat trio
  lib/
    seo.ts                    title/description/canonical builders
    schema.ts                 JSON-LD generators (Organization, LocalBusiness, Service, FAQPage, Breadcrumb, WebSite)
    quote-validation.ts       shared client+server validation for the quote form
    format.ts                 tel: href, display phone, address formatting
  styles/global.css           @theme design tokens, font faces, base type
  layouts/
    BaseLayout.astro          html shell, SEOHead, Header, Footer, StickyBar
    ServiceLayout.astro       service page template
  components/
    seo/SEOHead.astro         title, description, canonical, OG, twitter
    seo/Schema.astro          renders JSON-LD blocks
    seo/Breadcrumbs.astro     visible trail + BreadcrumbList schema
    layout/Header.astro       nav, always-visible phone + quote CTA
    layout/Nav.astro          desktop nav + services dropdown
    layout/MobileStickyBar.astro  tap-to-call + quote, mobile only
    layout/Footer.astro       4 columns, credentials, computed year
    home/Hero.astro           Option A headline + CTAs
    home/StatsBar.astro       20+ / 50+ / 24-Hr
    home/WhyUs.astro          4 numbered reasons
    trust/TrustBar.astro      FMC / IATA / C-TPAT, hides null values
    trust/LogoStrip.astro     carrier + association logos
    trust/Testimonials.astro  named testimonials, hides when empty
    services/ServiceCard.astro
    services/ServiceGrid.astro
    ui/Button.astro           amber primary / outline secondary
    ui/CTABand.astro          between-section conversion band
    ui/FAQAccordion.astro     details/summary, no-JS friendly
    forms/QuoteWidget.astro   3-field hero widget → /quote
    forms/QuoteForm.astro     2-step full form
  pages/
    index.astro  about.astro  contact.astro  quote.astro
    services/index.astro  services/[slug].astro
    privacy-policy.astro  terms.astro  404.astro
    api/quote.ts            serverless: validate → Resend → honest result

tests/
  unit/           site-config, seo, schema, quote-validation, format
  components/     header, footer, hero, trust, service-card, quote-form
  build/          seo-invariants (crawls dist/), no-placeholders, no-js-content
  e2e/            quote-flow.spec.ts
```

**Responsibility boundaries:** `config/` holds facts. `data/` holds content. `lib/` holds pure functions (fully unit-testable, no Astro imports). `components/` holds presentation only — no business logic, no hardcoded facts. This split is what makes the test suite meaningful.

---

## Task 1: Project foundation

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `.env.example`, `src/styles/global.css`, `src/pages/index.astro`
- Create: `tests/unit/smoke.test.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a working `npm run build`, `npm run dev`, `npm test`; Tailwind theme tokens `--color-navy-900`, `--color-navy-800`, `--color-navy-950`, `--color-amber-500`, `--color-amber-400`, `--font-display`, `--font-body`

- [ ] **Step 1: Initialize git and the Astro project**

```bash
git init
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git --skip-houston
npm install
npm install -D tailwindcss @tailwindcss/vite vitest @vitest/ui
npm install @astrojs/sitemap @astrojs/vercel
```

- [ ] **Step 2: Write `.gitignore`**

```
node_modules/
dist/
.astro/
.vercel/
.env
.env.local
test-results/
playwright-report/
```

- [ ] **Step 3: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://global-gate.us',
  trailingSlash: 'never',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
});
```

- [ ] **Step 4: Write `src/styles/global.css` with the design tokens**

```css
@import "tailwindcss";

@theme {
  --color-navy-950: #060E1A;
  --color-navy-900: #0A1628;
  --color-navy-800: #1E3A5F;
  --color-amber-500: #F59E0B;
  --color-amber-400: #FBBF24;

  --font-display: "Barlow Condensed", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Source Sans 3", ui-sans-serif, system-ui, sans-serif;
}

@layer base {
  html { scroll-behavior: smooth; }
  body {
    font-family: var(--font-body);
    background-color: #ffffff;
    color: #334155;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4, .font-display { font-family: var(--font-display); }
  h1 {
    font-size: clamp(3rem, 8vw, 5.5rem);
    font-weight: 800;
    line-height: 0.95;
    letter-spacing: -0.01em;
  }
  :focus-visible { outline: 2px solid var(--color-amber-400); outline-offset: 2px; }
}

@layer components {
  .container-gg { width: 100%; max-width: 80rem; margin-inline: auto; padding-inline: 1.25rem; }
  .btn-amber {
    display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
    background-color: var(--color-amber-500); color: var(--color-navy-900);
    font-family: var(--font-display); font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    transition: background-color .2s ease;
  }
  .btn-amber:hover { background-color: var(--color-amber-400); }
  .btn-outline {
    display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
    border: 1px solid rgba(255,255,255,.3); color: #fff;
    font-family: var(--font-display); font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
    transition: color .2s ease, border-color .2s ease;
  }
  .btn-outline:hover { color: var(--color-amber-400); border-color: var(--color-amber-400); }
}
```

- [ ] **Step 5: Write `vitest.config.ts`**

```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // seo-invariants.test.ts reads dist/, so it only runs after a build via `npm run test:build`.
    exclude: ['node_modules/**', 'tests/build/seo-invariants.test.ts'],
  },
});
```

- [ ] **Step 6: Add test scripts to `package.json`**

Add to the `"scripts"` object:

```json
"test": "vitest run",
"test:watch": "vitest",
"build": "astro build",
"dev": "astro dev",
"preview": "astro preview"
```

- [ ] **Step 7: Write the failing smoke test**

Create `tests/unit/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('project foundation', () => {
  it('declares the canonical site URL', () => {
    const config = readFileSync('astro.config.mjs', 'utf8');
    expect(config).toContain("site: 'https://global-gate.us'");
  });

  it('defines the brand design tokens', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).toContain('--color-navy-900: #0A1628');
    expect(css).toContain('--color-amber-500: #F59E0B');
    expect(css).toContain('Barlow Condensed');
    expect(css).toContain('Source Sans 3');
  });
});
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 2 tests. If it fails, the config or CSS above was not written correctly — fix before continuing.

- [ ] **Step 9: Verify the build works**

Run: `npm run build`
Expected: build completes, `dist/` is created.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro + Tailwind project with brand design tokens"
```

---

## Task 2: Site config — the single source of truth

**Files:**
- Create: `src/config/site.ts`
- Create: `src/lib/format.ts`
- Test: `tests/unit/site-config.test.ts`, `tests/unit/format.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `SITE: SiteConfig` — the exported constant every component and schema generator reads
  - `type SiteConfig` with `name`, `legalName`, `tagline`, `url`, `email`, `phones: Phone[]`, `address: Address`, `hours: Hours`, `credentials: Credentials`, `social: Social`, `founded: number | null`
  - `telHref(raw: string): string` — `"631-596-5591"` → `"tel:+16315965591"`
  - `formatPhone(raw: string): string` — display form
  - `formatAddressOneLine(a: Address): string`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/site-config.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { SITE } from '../../src/config/site';

const PLACEHOLDER = /\b(TBD|TODO|XXX+|lorem ipsum|coming soon|placeholder)\b/i;

function allStrings(value: unknown, acc: string[] = []): string[] {
  if (typeof value === 'string') acc.push(value);
  else if (Array.isArray(value)) value.forEach((v) => allStrings(v, acc));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => allStrings(v, acc));
  return acc;
}

describe('SITE config', () => {
  it('uses the canonical apex URL with no trailing slash', () => {
    expect(SITE.url).toBe('https://global-gate.us');
  });

  it('carries the verified NAP exactly once, in one place', () => {
    expect(SITE.legalName).toBe('Global Gate Logistics Inc');
    expect(SITE.address.street).toBe('153-04 Rockaway Blvd');
    expect(SITE.address.city).toBe('Queens');
    expect(SITE.address.region).toBe('NY');
    expect(SITE.address.postalCode).toBe('11434');
    expect(SITE.email).toBe('Op01@global-gate.us');
    expect(SITE.phones.map((p) => p.number)).toEqual(['631-596-5591', '631-596-5592']);
  });

  it('contains no placeholder text anywhere', () => {
    for (const s of allStrings(SITE)) {
      expect(s, `placeholder leaked: "${s}"`).not.toMatch(PLACEHOLDER);
    }
  });

  it('never claims 24/7 availability', () => {
    for (const s of allStrings(SITE)) {
      expect(s.toLowerCase()).not.toContain('24/7');
    }
  });

  it('represents unknown facts as null rather than empty or fake strings', () => {
    const unknowns = [SITE.credentials.fmcNumber, SITE.credentials.iataNumber, SITE.founded];
    for (const u of unknowns) {
      expect(u === null || (typeof u === 'string' && u.length > 0) || typeof u === 'number').toBe(true);
    }
  });
});
```

Create `tests/unit/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { telHref, formatPhone, formatAddressOneLine } from '../../src/lib/format';

describe('telHref', () => {
  it('produces an E.164 tel: URI from a dashed US number', () => {
    expect(telHref('631-596-5591')).toBe('tel:+16315965591');
  });
  it('is idempotent for already-clean input', () => {
    expect(telHref('+16315965591')).toBe('tel:+16315965591');
  });
});

describe('formatPhone', () => {
  it('renders a readable display number', () => {
    expect(formatPhone('631-596-5591')).toBe('(631) 596-5591');
  });
});

describe('formatAddressOneLine', () => {
  it('joins the address into a single NAP-consistent line', () => {
    expect(
      formatAddressOneLine({
        street: '153-04 Rockaway Blvd',
        city: 'Queens',
        region: 'NY',
        postalCode: '11434',
        country: 'US',
      })
    ).toBe('153-04 Rockaway Blvd, Queens, NY 11434');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../../src/config/site'`

- [ ] **Step 3: Write `src/lib/format.ts`**

```ts
import type { Address } from '../config/site';

/** Strips formatting and returns an E.164 tel: URI. Assumes US (+1) when no country code is present. */
export function telHref(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const withCountry = digits.length === 10 ? `1${digits}` : digits;
  return `tel:+${withCountry}`;
}

/** Renders a US 10-digit number as (AAA) BBB-CCCC. Returns the input unchanged if it is not 10 digits. */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 10) return raw;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Single-line address used in the footer and in JSON-LD. Must match the Google Business Profile byte for byte. */
export function formatAddressOneLine(a: Address): string {
  return `${a.street}, ${a.city}, ${a.region} ${a.postalCode}`;
}
```

- [ ] **Step 4: Write `src/config/site.ts`**

Facts marked `null` are the open items from spec §16. They are `null`, never placeholder strings, so nothing fake can reach production — components skip null values entirely.

```ts
export interface Address {
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface Phone {
  number: string;
  label: string;
}

export interface Hours {
  /** Schema.org openingHours format, e.g. "Mo-Fr 09:00-17:00". null until confirmed (spec F4). */
  schema: string | null;
  /** Human-readable form shown on the contact page. null until confirmed. */
  display: string | null;
  timezone: string;
}

export interface Credentials {
  fmcNumber: string | null;   // spec F1
  iataNumber: string | null;  // spec F2
  ctpatCertified: boolean;    // spec F3
  nvocc: boolean;
}

export interface Social {
  facebook: string | null;    // spec F7 — null until a real profile URL is supplied
  instagram: string | null;
  linkedin: string | null;
}

export interface SiteConfig {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phones: Phone[];
  address: Address;
  hours: Hours;
  credentials: Credentials;
  social: Social;
  founded: number | null;     // spec F6
  quoteTurnaroundHours: number;
}

export const SITE: SiteConfig = {
  name: 'Global Gate Logistics',
  legalName: 'Global Gate Logistics Inc',
  tagline: 'International Freight Forwarder · NVOCC · IATA Member',
  description:
    'Global Gate Logistics is a US international freight forwarder and NVOCC specializing in Asia–America cargo. Ocean FCL & LCL, air freight, customs clearance, JFK warehousing, and nationwide trucking handled in-house.',
  url: 'https://global-gate.us',
  email: 'Op01@global-gate.us',
  phones: [
    { number: '631-596-5591', label: 'Main' },
    { number: '631-596-5592', label: 'Alternate' },
  ],
  address: {
    street: '153-04 Rockaway Blvd',
    city: 'Queens',
    region: 'NY',
    postalCode: '11434',
    country: 'US',
  },
  hours: {
    schema: null,
    display: null,
    timezone: 'America/New_York',
  },
  credentials: {
    fmcNumber: null,
    iataNumber: null,
    ctpatCertified: true,
    nvocc: true,
  },
  social: {
    facebook: null,
    instagram: null,
    linkedin: null,
  },
  founded: null,
  quoteTurnaroundHours: 24,
};

export const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, all site-config and format tests green.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add site config as single source of truth for NAP and credentials"
```

---

## Task 3: SEO and JSON-LD schema libraries

**Files:**
- Create: `src/lib/seo.ts`, `src/lib/schema.ts`
- Test: `tests/unit/seo.test.ts`, `tests/unit/schema.test.ts`

**Interfaces:**
- Consumes: `SITE` from Task 2; `formatAddressOneLine`, `telHref` from Task 2
- Produces:
  - `buildTitle(pageTitle?: string): string`
  - `canonicalUrl(pathname: string): string`
  - `organizationSchema(): object`
  - `localBusinessSchema(): object`
  - `serviceSchema(input: { name: string; description: string; url: string }): object`
  - `faqSchema(faqs: { question: string; answer: string }[]): object`
  - `breadcrumbSchema(trail: { name: string; href: string }[]): object`
  - `websiteSchema(): object`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/seo.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildTitle, canonicalUrl } from '../../src/lib/seo';

describe('buildTitle', () => {
  it('appends the brand to a page title', () => {
    expect(buildTitle('Ocean Freight')).toBe('Ocean Freight | Global Gate Logistics');
  });
  it('returns the full brand title for the homepage', () => {
    expect(buildTitle()).toBe(
      'Global Gate Logistics | International Freight Forwarder & NVOCC'
    );
  });
  it('keeps titles within the 60-character display limit', () => {
    expect(buildTitle('Ocean Freight').length).toBeLessThanOrEqual(60);
  });
});

describe('canonicalUrl', () => {
  it('builds an absolute apex URL', () => {
    expect(canonicalUrl('/services/ocean-freight')).toBe(
      'https://global-gate.us/services/ocean-freight'
    );
  });
  it('normalizes the homepage to the bare origin', () => {
    expect(canonicalUrl('/')).toBe('https://global-gate.us');
  });
  it('strips a trailing slash', () => {
    expect(canonicalUrl('/about/')).toBe('https://global-gate.us/about');
  });
});
```

Create `tests/unit/schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  organizationSchema,
  localBusinessSchema,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '../../src/lib/schema';

describe('organizationSchema', () => {
  const s = organizationSchema() as Record<string, any>;

  it('is a valid schema.org Organization', () => {
    expect(s['@context']).toBe('https://schema.org');
    expect(s['@type']).toBe('Organization');
    expect(s.legalName).toBe('Global Gate Logistics Inc');
  });

  it('omits sameAs entirely when no real social profiles are known', () => {
    expect(s.sameAs).toBeUndefined();
  });

  it('never emits null values, which break Google validation', () => {
    expect(JSON.stringify(s)).not.toContain('null');
  });
});

describe('localBusinessSchema', () => {
  it('publishes the exact NAP for local search consistency', () => {
    const s = localBusinessSchema() as Record<string, any>;
    expect(s.address.streetAddress).toBe('153-04 Rockaway Blvd');
    expect(s.address.postalCode).toBe('11434');
    expect(s.telephone).toBe('+16315965591');
  });
});

describe('faqSchema', () => {
  it('maps questions and answers into FAQPage format', () => {
    const s = faqSchema([{ question: 'How long?', answer: 'About 3 days.' }]) as Record<string, any>;
    expect(s['@type']).toBe('FAQPage');
    expect(s.mainEntity[0]['@type']).toBe('Question');
    expect(s.mainEntity[0].acceptedAnswer.text).toBe('About 3 days.');
  });
});

describe('breadcrumbSchema', () => {
  it('numbers positions from 1 and uses absolute URLs', () => {
    const s = breadcrumbSchema([
      { name: 'Home', href: '/' },
      { name: 'Services', href: '/services' },
    ]) as Record<string, any>;
    expect(s.itemListElement[0].position).toBe(1);
    expect(s.itemListElement[1].item).toBe('https://global-gate.us/services');
  });
});

describe('serviceSchema', () => {
  it('links the service to the providing organization', () => {
    const s = serviceSchema({
      name: 'Ocean Freight',
      description: 'FCL and LCL ocean freight.',
      url: 'https://global-gate.us/services/ocean-freight',
    }) as Record<string, any>;
    expect(s['@type']).toBe('Service');
    expect(s.provider['@type']).toBe('Organization');
    expect(s.provider.name).toBe('Global Gate Logistics');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `src/lib/seo` and `src/lib/schema`.

- [ ] **Step 3: Write `src/lib/seo.ts`**

```ts
import { SITE } from '../config/site';

const BRAND_TITLE = 'Global Gate Logistics | International Freight Forwarder & NVOCC';

/** Page title with brand suffix. Homepage gets the full descriptive brand title. */
export function buildTitle(pageTitle?: string): string {
  if (!pageTitle) return BRAND_TITLE;
  return `${pageTitle} | ${SITE.name}`;
}

/** Absolute canonical URL on the apex host, without a trailing slash. */
export function canonicalUrl(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '');
  return clean === '' ? SITE.url : `${SITE.url}${clean.startsWith('/') ? clean : `/${clean}`}`;
}
```

- [ ] **Step 4: Write `src/lib/schema.ts`**

The `compact` helper strips `undefined` keys so no `null` ever reaches the JSON-LD — Google rejects null-valued properties.

```ts
import { SITE } from '../config/site';
import { canonicalUrl } from './seo';

/** Removes undefined values so unknown facts are omitted rather than emitted as null. */
function compact<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)) as T;
}

function e164(raw: string): string {
  const d = raw.replace(/\D/g, '');
  return `+${d.length === 10 ? `1${d}` : d}`;
}

function sameAs(): string[] | undefined {
  const links = [SITE.social.facebook, SITE.social.instagram, SITE.social.linkedin].filter(
    (v): v is string => typeof v === 'string' && v.length > 0
  );
  return links.length > 0 ? links : undefined;
}

function postalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
  };
}

export function organizationSchema() {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    description: SITE.description,
    email: SITE.email,
    telephone: e164(SITE.phones[0].number),
    address: postalAddress(),
    foundingDate: SITE.founded ? String(SITE.founded) : undefined,
    sameAs: sameAs(),
    identifier: SITE.credentials.fmcNumber
      ? { '@type': 'PropertyValue', name: 'FMC License', value: SITE.credentials.fmcNumber }
      : undefined,
  });
}

export function localBusinessSchema() {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#localbusiness`,
    name: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    telephone: e164(SITE.phones[0].number),
    address: postalAddress(),
    openingHours: SITE.hours.schema ?? undefined,
    priceRange: '$$',
  });
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE.url,
    name: SITE.name,
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

export function serviceSchema(input: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: input.url,
    serviceType: input.name,
    provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    areaServed: { '@type': 'Country', name: 'United States' },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: canonicalUrl(t.href),
    })),
  };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all seo and schema tests green.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add SEO helpers and JSON-LD schema generators"
```

---

## Task 4: Base layout, SEO head, and schema rendering

**Files:**
- Create: `src/components/seo/SEOHead.astro`, `src/components/seo/Schema.astro`, `src/components/seo/Breadcrumbs.astro`, `src/layouts/BaseLayout.astro`
- Create: `public/fonts/` (self-hosted woff2 files)
- Test: `tests/components/base-layout.test.ts`

**Interfaces:**
- Consumes: `buildTitle`, `canonicalUrl` (Task 3); `organizationSchema`, `localBusinessSchema`, `websiteSchema`, `breadcrumbSchema` (Task 3); `SITE` (Task 2)
- Produces:
  - `BaseLayout` props: `{ title?: string; description: string; pathname: string; schemas?: object[]; breadcrumbs?: { name: string; href: string }[] }`
  - `Schema` props: `{ items: object[] }`
  - `Breadcrumbs` props: `{ trail: { name: string; href: string }[] }`

- [ ] **Step 1: Download and self-host the fonts**

```bash
mkdir -p public/fonts
# Barlow Condensed 400/600/700/800 and Source Sans 3 300/400/500/600, latin subset, woff2
npx google-font-installer download "Barlow Condensed" -d public/fonts
npx google-font-installer download "Source Sans 3" -d public/fonts
```

If `google-font-installer` is unavailable, download the woff2 files directly from `https://fonts.google.com` and place them in `public/fonts/`. Self-hosting removes two render-blocking third-party requests and eliminates a privacy dependency.

- [ ] **Step 2: Add `@font-face` rules to `src/styles/global.css`**

Insert directly after the `@import "tailwindcss";` line:

```css
@font-face {
  font-family: "Barlow Condensed";
  src: url("/fonts/barlow-condensed-latin-700.woff2") format("woff2");
  font-weight: 700; font-style: normal; font-display: swap;
}
@font-face {
  font-family: "Barlow Condensed";
  src: url("/fonts/barlow-condensed-latin-800.woff2") format("woff2");
  font-weight: 800; font-style: normal; font-display: swap;
}
@font-face {
  font-family: "Source Sans 3";
  src: url("/fonts/source-sans-3-latin-400.woff2") format("woff2");
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: "Source Sans 3";
  src: url("/fonts/source-sans-3-latin-600.woff2") format("woff2");
  font-weight: 600; font-style: normal; font-display: swap;
}
```

- [ ] **Step 3: Write the failing test**

Create `tests/components/base-layout.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BaseLayout from '../../src/layouts/BaseLayout.astro';

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(BaseLayout, { props });
}

describe('BaseLayout', () => {
  it('emits a canonical link on the apex domain', async () => {
    const html = await render({ description: 'Test page', pathname: '/about' });
    expect(html).toContain('<link rel="canonical" href="https://global-gate.us/about"');
  });

  it('emits the page title with the brand suffix', async () => {
    const html = await render({ title: 'About', description: 'Test', pathname: '/about' });
    expect(html).toContain('<title>About | Global Gate Logistics</title>');
  });

  it('emits the meta description', async () => {
    const html = await render({ description: 'A specific description.', pathname: '/' });
    expect(html).toContain('name="description" content="A specific description."');
  });

  it('always includes Organization and LocalBusiness JSON-LD', async () => {
    const html = await render({ description: 'Test', pathname: '/' });
    expect(html).toContain('"@type":"Organization"');
    expect(html).toContain('"@type":"LocalBusiness"');
  });

  it('sets lang and viewport for accessibility and mobile', async () => {
    const html = await render({ description: 'Test', pathname: '/' });
    expect(html).toContain('<html lang="en"');
    expect(html).toContain('name="viewport"');
  });

  it('does not lock zoom, which fails accessibility audits', async () => {
    const html = await render({ description: 'Test', pathname: '/' });
    expect(html).not.toContain('maximum-scale=1');
  });
});
```

Note the last assertion: the original Manus site set `maximum-scale=1`, which blocks pinch-zoom and fails WCAG. The rebuild must not carry that over.

- [ ] **Step 4: Run the test to verify it fails**

Run: `npm test -- base-layout`
Expected: FAIL — cannot resolve `src/layouts/BaseLayout.astro`.

- [ ] **Step 5: Write `src/components/seo/Schema.astro`**

```astro
---
interface Props { items: object[]; }
const { items } = Astro.props;
---
{items.map((item) => (
  <script type="application/ld+json" set:html={JSON.stringify(item)} />
))}
```

- [ ] **Step 6: Write `src/components/seo/SEOHead.astro`**

```astro
---
import { buildTitle, canonicalUrl } from '../../lib/seo';
import { SITE } from '../../config/site';

interface Props {
  title?: string;
  description: string;
  pathname: string;
  ogImage?: string;
  noindex?: boolean;
}

const { title, description, pathname, ogImage = '/images/og-default.jpg', noindex = false } = Astro.props;
const fullTitle = buildTitle(title);
const canonical = canonicalUrl(pathname);
const ogImageUrl = new URL(ogImage, SITE.url).href;
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{fullTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
{noindex && <meta name="robots" content="noindex, nofollow" />}

<meta property="og:type" content="website" />
<meta property="og:site_name" content={SITE.name} />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImageUrl} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={fullTitle} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImageUrl} />

<link rel="sitemap" href="/sitemap-index.xml" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

- [ ] **Step 7: Write `src/components/seo/Breadcrumbs.astro`**

```astro
---
interface Props { trail: { name: string; href: string }[]; }
const { trail } = Astro.props;
---
<nav aria-label="Breadcrumb" class="container-gg py-4">
  <ol class="flex flex-wrap items-center gap-2 text-sm text-slate-500">
    {trail.map((crumb, i) => (
      <li class="flex items-center gap-2">
        {i < trail.length - 1 ? (
          <>
            <a href={crumb.href} class="hover:text-amber-500 transition-colors">{crumb.name}</a>
            <span aria-hidden="true">/</span>
          </>
        ) : (
          <span aria-current="page" class="text-slate-700 font-medium">{crumb.name}</span>
        )}
      </li>
    ))}
  </ol>
</nav>
```

- [ ] **Step 8: Write `src/layouts/BaseLayout.astro`**

Header, Footer, and MobileStickyBar are imported here but built in Tasks 5 and 6. Create empty stubs for them now so the build passes, then fill them in.

```astro
---
import '../styles/global.css';
import SEOHead from '../components/seo/SEOHead.astro';
import Schema from '../components/seo/Schema.astro';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';
import MobileStickyBar from '../components/layout/MobileStickyBar.astro';
import { organizationSchema, localBusinessSchema, websiteSchema, breadcrumbSchema } from '../lib/schema';

interface Props {
  title?: string;
  description: string;
  pathname: string;
  ogImage?: string;
  noindex?: boolean;
  schemas?: object[];
  breadcrumbs?: { name: string; href: string }[];
}

const { title, description, pathname, ogImage, noindex, schemas = [], breadcrumbs } = Astro.props;

const allSchemas = [
  organizationSchema(),
  localBusinessSchema(),
  websiteSchema(),
  ...(breadcrumbs ? [breadcrumbSchema(breadcrumbs)] : []),
  ...schemas,
];
---
<!doctype html>
<html lang="en">
  <head>
    <SEOHead {title} {description} {pathname} {ogImage} {noindex} />
    <Schema items={allSchemas} />
  </head>
  <body class="bg-white text-slate-700 antialiased">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-amber-500 focus:text-navy-900 focus:px-4 focus:py-2">
      Skip to content
    </a>
    <Header />
    <main id="main" class="pb-20 md:pb-0">
      <slot />
    </main>
    <Footer />
    <MobileStickyBar />
  </body>
</html>
```

Create the three stubs so the build compiles:

```bash
mkdir -p src/components/layout
printf -- '---\n---\n<header></header>\n' > src/components/layout/Header.astro
printf -- '---\n---\n<footer></footer>\n' > src/components/layout/Footer.astro
printf -- '---\n---\n<div></div>\n' > src/components/layout/MobileStickyBar.astro
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `npm test -- base-layout`
Expected: PASS, 6 tests.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add base layout with SEO head, JSON-LD, and breadcrumbs"
```

---

## Task 5: Header, navigation, and mobile sticky bar

Fixes defect **D9** — the old site hid its only call-to-action behind a hamburger menu and offered no tap-to-call, losing the highest-intent mobile visitors.

**Files:**
- Modify: `src/components/layout/Header.astro`, `src/components/layout/MobileStickyBar.astro`
- Create: `src/components/layout/Nav.astro`, `src/components/ui/Button.astro`
- Test: `tests/components/header.test.ts`

**Interfaces:**
- Consumes: `SITE`, `NAV_LINKS` (Task 2); `telHref`, `formatPhone` (Task 2)
- Produces: `Button` props `{ href: string; variant?: 'amber' | 'outline'; class?: string }` with a default slot for the label

- [ ] **Step 1: Write the failing test**

Create `tests/components/header.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Header from '../../src/components/layout/Header.astro';
import MobileStickyBar from '../../src/components/layout/MobileStickyBar.astro';

async function render(Component: any) {
  const container = await AstroContainer.create();
  return container.renderToString(Component);
}

describe('Header', () => {
  it('exposes a tap-to-call link outside the collapsed mobile menu', async () => {
    const html = await render(Header);
    expect(html).toContain('tel:+16315965591');
  });

  it('shows the quote CTA without requiring the hamburger', async () => {
    const html = await render(Header);
    const beforeMenu = html.split('id="mobile-menu"')[0];
    expect(beforeMenu).toContain('/quote');
  });

  it('links every primary nav destination', async () => {
    const html = await render(Header);
    for (const href of ['/services', '/about', '/contact']) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it('gives the mobile menu button an accessible name and state', async () => {
    const html = await render(Header);
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-controls="mobile-menu"');
  });
});

describe('MobileStickyBar', () => {
  it('offers both call and quote actions', async () => {
    const html = await render(MobileStickyBar);
    expect(html).toContain('tel:+16315965591');
    expect(html).toContain('/quote');
  });

  it('is hidden on desktop where the header already shows both actions', async () => {
    const html = await render(MobileStickyBar);
    expect(html).toContain('md:hidden');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- header`
Expected: FAIL — stubs render empty elements, so no assertion matches.

- [ ] **Step 3: Write `src/components/ui/Button.astro`**

```astro
---
interface Props {
  href: string;
  variant?: 'amber' | 'outline';
  class?: string;
}
const { href, variant = 'amber', class: className = '' } = Astro.props;
const base = variant === 'amber' ? 'btn-amber' : 'btn-outline';
---
<a href={href} class={`${base} ${className}`}><slot /></a>
```

- [ ] **Step 4: Write `src/components/layout/Nav.astro`**

```astro
---
import { NAV_LINKS } from '../../config/site';
const { pathname } = Astro.url;
---
<nav aria-label="Primary" class="hidden lg:flex items-center gap-8">
  {NAV_LINKS.map((link) => (
    <a
      href={link.href}
      aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
      class="font-display uppercase tracking-[0.08em] text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors"
    >
      {link.label}
    </a>
  ))}
</nav>
```

- [ ] **Step 5: Write `src/components/layout/Header.astro`**

The phone number and quote button sit **outside** `#mobile-menu`, so they are visible at every breakpoint without opening anything.

```astro
---
import Nav from './Nav.astro';
import Button from '../ui/Button.astro';
import { SITE, NAV_LINKS } from '../../config/site';
import { telHref, formatPhone } from '../../lib/format';

const primary = SITE.phones[0];
---
<header class="sticky top-0 z-50 bg-navy-900/98 backdrop-blur-md shadow-lg">
  <div class="container-gg flex items-center justify-between h-20 md:h-24 gap-4">
    <a href="/" class="flex items-center gap-3 shrink-0" aria-label={`${SITE.name} home`}>
      <img src="/images/logo.png" alt="" width="72" height="72" class="h-12 md:h-16 w-auto object-contain" />
      <span class="hidden sm:block">
        <span class="block font-display font-black leading-none text-xl md:text-2xl text-white">
          {SITE.name}
        </span>
        <span class="block font-display font-bold text-amber-400 text-xs md:text-sm leading-tight mt-0.5">
          NVOCC &middot; IATA Member
        </span>
      </span>
    </a>

    <Nav />

    <div class="flex items-center gap-3">
      <a
        href={telHref(primary.number)}
        class="hidden sm:flex items-center gap-2 font-display font-bold text-white hover:text-amber-400 transition-colors"
      >
        <span aria-hidden="true">&#9742;</span>
        <span>{formatPhone(primary.number)}</span>
      </a>
      <Button href="/quote" class="px-4 py-2 text-sm rounded">Get a Quote</Button>
      <button
        type="button"
        id="menu-toggle"
        aria-expanded="false"
        aria-controls="mobile-menu"
        aria-label="Open menu"
        class="lg:hidden text-white p-2"
      >
        <span aria-hidden="true">&#9776;</span>
      </button>
    </div>
  </div>

  <div id="mobile-menu" hidden class="lg:hidden bg-navy-900 border-t border-white/10 pb-4">
    <nav aria-label="Mobile" class="container-gg flex flex-col">
      {NAV_LINKS.map((link) => (
        <a href={link.href} class="font-display uppercase tracking-[0.08em] text-sm text-slate-300 hover:text-amber-400 py-3 border-b border-white/5">
          {link.label}
        </a>
      ))}
      <a href={telHref(primary.number)} class="font-display uppercase tracking-[0.08em] text-sm text-amber-400 py-3">
        Call {formatPhone(primary.number)}
      </a>
    </nav>
  </div>
</header>

<script>
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    menu?.toggleAttribute('hidden', open);
  });
</script>
```

- [ ] **Step 6: Write `src/components/layout/MobileStickyBar.astro`**

```astro
---
import { SITE } from '../../config/site';
import { telHref, formatPhone } from '../../lib/format';
const primary = SITE.phones[0];
---
<div class="md:hidden fixed bottom-0 inset-x-0 z-50 grid grid-cols-2 border-t border-white/10 bg-navy-900">
  <a
    href={telHref(primary.number)}
    class="flex items-center justify-center gap-2 py-4 font-display font-bold uppercase tracking-[0.08em] text-sm text-white"
  >
    <span aria-hidden="true">&#9742;</span> Call {formatPhone(primary.number)}
  </a>
  <a
    href="/quote"
    class="flex items-center justify-center py-4 font-display font-bold uppercase tracking-[0.08em] text-sm bg-amber-500 text-navy-900"
  >
    Get a Quote
  </a>
</div>
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -- header`
Expected: PASS, 6 tests.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add header, nav, and mobile sticky call bar"
```

---

## Task 6: Footer

Fixes defects **D6** (hardcoded `© 2024`) and **D7** (social links pointing at `facebook.com` rather than a real profile).

**Files:**
- Modify: `src/components/layout/Footer.astro`
- Test: `tests/components/footer.test.ts`

**Interfaces:**
- Consumes: `SITE` (Task 2); `telHref`, `formatPhone`, `formatAddressOneLine` (Task 2)
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Write the failing test**

Create `tests/components/footer.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from '../../src/components/layout/Footer.astro';

async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Footer);
}

describe('Footer', () => {
  it('shows the current year, never a stale hardcoded one', async () => {
    const html = await render();
    expect(html).toContain(String(new Date().getFullYear()));
    expect(html).not.toContain('© 2024 Global Gate');
  });

  it('publishes the NAP consistently with the site config', async () => {
    const html = await render();
    expect(html).toContain('153-04 Rockaway Blvd, Queens, NY 11434');
    expect(html).toContain('tel:+16315965591');
  });

  it('omits social icons entirely when no real profile URLs are configured', async () => {
    const html = await render();
    expect(html).not.toContain('href="https://www.facebook.com"');
    expect(html).not.toContain('href="https://www.instagram.com"');
  });

  it('links the legal pages required for trust and ad platforms', async () => {
    const html = await render();
    expect(html).toContain('/privacy-policy');
    expect(html).toContain('/terms');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- footer`
Expected: FAIL — the stub renders an empty `<footer>`.

- [ ] **Step 3: Write `src/components/layout/Footer.astro`**

`socialLinks` filters out nulls, so an unconfirmed profile renders nothing rather than a dead link.

```astro
---
import { SITE } from '../../config/site';
import { telHref, formatPhone, formatAddressOneLine } from '../../lib/format';

const year = new Date().getFullYear();
const addressLine = formatAddressOneLine(SITE.address);

const socialLinks = (
  [
    ['Facebook', SITE.social.facebook],
    ['Instagram', SITE.social.instagram],
    ['LinkedIn', SITE.social.linkedin],
  ] as const
).filter((entry): entry is readonly [string, string] => typeof entry[1] === 'string' && entry[1].length > 0);

const serviceLinks = [
  ['Ocean Freight', '/services/ocean-freight'],
  ['Air Freight', '/services/air-freight'],
  ['Warehousing', '/services/warehousing-distribution'],
  ['Customs Clearance', '/services/customs-clearance'],
  ['Domestic Trucking', '/services/domestic-trucking'],
  ['Agent Network', '/services/overseas-agent-network'],
];
---
<footer class="bg-navy-950 border-t border-white/10 text-slate-400">
  <div class="container-gg py-12 grid gap-10 md:grid-cols-4">
    <div>
      <p class="font-display font-black text-xl text-white leading-none">{SITE.name}</p>
      <p class="font-display font-bold text-amber-400 text-sm mt-1">{SITE.tagline}</p>
      <p class="text-sm mt-4 leading-relaxed">{SITE.description}</p>
    </div>

    <nav aria-labelledby="footer-services">
      <h2 id="footer-services" class="font-display uppercase tracking-[0.08em] text-white text-sm mb-4">Services</h2>
      <ul class="space-y-2 text-sm">
        {serviceLinks.map(([label, href]) => (
          <li><a href={href} class="hover:text-amber-400 transition-colors">{label}</a></li>
        ))}
      </ul>
    </nav>

    <nav aria-labelledby="footer-company">
      <h2 id="footer-company" class="font-display uppercase tracking-[0.08em] text-white text-sm mb-4">Company</h2>
      <ul class="space-y-2 text-sm">
        <li><a href="/about" class="hover:text-amber-400 transition-colors">About</a></li>
        <li><a href="/contact" class="hover:text-amber-400 transition-colors">Contact</a></li>
        <li><a href="/quote" class="hover:text-amber-400 transition-colors">Request a Quote</a></li>
        <li><a href="/privacy-policy" class="hover:text-amber-400 transition-colors">Privacy Policy</a></li>
        <li><a href="/terms" class="hover:text-amber-400 transition-colors">Terms</a></li>
      </ul>
    </nav>

    <div>
      <h2 class="font-display uppercase tracking-[0.08em] text-white text-sm mb-4">Contact</h2>
      <address class="not-italic text-sm space-y-2">
        <p>{addressLine}</p>
        {SITE.phones.map((p) => (
          <p><a href={telHref(p.number)} class="hover:text-amber-400 transition-colors">{formatPhone(p.number)}</a></p>
        ))}
        <p><a href={`mailto:${SITE.email}`} class="hover:text-amber-400 transition-colors">{SITE.email}</a></p>
        {SITE.hours.display && <p class="text-slate-500">{SITE.hours.display}</p>}
      </address>
      {socialLinks.length > 0 && (
        <ul class="flex gap-3 mt-4">
          {socialLinks.map(([label, href]) => (
            <li>
              <a href={href} rel="noopener noreferrer" target="_blank" class="text-sm hover:text-amber-400 transition-colors">
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>

  <div class="border-t border-white/5">
    <div class="container-gg py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
      <p>&copy; {year} {SITE.legalName}. All Rights Reserved.</p>
      <p>{addressLine} &middot; {formatPhone(SITE.phones[0].number)}</p>
    </div>
  </div>
</footer>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- footer`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add footer with computed year and null-safe social links"
```

---

## Task 7: Migrate image assets

**Files:**
- Create: `public/images/` (5 migrated files), `src/assets/` (originals for Astro optimization)
- Test: `tests/build/assets.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `/images/logo.png`, `/images/hero-bg.webp`, `/images/service-ocean.webp`, `/images/service-air.webp`, `/images/service-warehouse.webp`, `/images/og-default.jpg`

- [ ] **Step 1: Download the five source assets**

```bash
mkdir -p public/images
BASE="https://d2xsxph8kpxj0f.cloudfront.net/310519663435963838/drgU8VAEUk2E9VsqMbmsR8"
curl -fsSL "$BASE/hero-bg-e8neDCQ2rrW9uCEuhCo6Ya.webp"            -o public/images/hero-bg.webp
curl -fsSL "$BASE/services-ocean-TbSpE4rwyrutTg32rDbfQd.webp"      -o public/images/service-ocean.webp
curl -fsSL "$BASE/services-air-4UuLQhVnywL6ABbMqyMVhL.webp"        -o public/images/service-air.webp
curl -fsSL "$BASE/services-warehouse-659sFAdPczCmXA7oKQYLsg.webp"  -o public/images/service-warehouse.webp
curl -fsSL "https://globalgate-drgu8vae.manus.space/manus-storage/gg-logo-black_7924a5e7.png" -o public/images/logo.png
```

- [ ] **Step 2: Generate the Open Graph share image**

Create a 1200×630 JPG at `public/images/og-default.jpg` using the hero background with the logo and the wordmark "Global Gate Logistics — International Freight Forwarder & NVOCC" overlaid. This is what appears when the site is shared on LinkedIn, WhatsApp, or Slack.

```bash
npx sharp-cli -i public/images/hero-bg.webp -o public/images/og-default.jpg resize 1200 630 --fit cover
```

Then composite the logo and wordmark over it in any image editor, or with `sharp` programmatically. Verify the result is exactly 1200×630.

- [ ] **Step 3: Write the failing test**

Create `tests/build/assets.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';

const REQUIRED = [
  'public/images/logo.png',
  'public/images/hero-bg.webp',
  'public/images/service-ocean.webp',
  'public/images/service-air.webp',
  'public/images/service-warehouse.webp',
  'public/images/og-default.jpg',
];

describe('migrated assets', () => {
  it.each(REQUIRED)('%s exists locally, with no dependency on the Manus CDN', (path) => {
    expect(existsSync(path)).toBe(true);
  });

  it.each(REQUIRED)('%s is non-empty', (path) => {
    expect(statSync(path).size).toBeGreaterThan(1024);
  });

  it('keeps the hero background under 250KB for mobile performance', () => {
    expect(statSync('public/images/hero-bg.webp').size).toBeLessThan(250 * 1024);
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npm test -- assets`
Expected: PASS once all six files exist. If the hero exceeds 250KB, re-encode it:

```bash
npx sharp-cli -i public/images/hero-bg.webp -o public/images/hero-bg.webp resize 1920 --format webp --quality 72
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: migrate image assets off the Manus CDN"
```

---

## Task 8: Hero and stats bar

Implements the approved **Option A** hero and fixes defects **D8** (the false 24/7 claim) and **D10** (the generic headline that buried the real differentiator in 20px grey text).

**Files:**
- Create: `src/components/home/Hero.astro`, `src/components/home/StatsBar.astro`, `src/data/stats.ts`
- Test: `tests/components/hero.test.ts`

**Interfaces:**
- Consumes: `SITE` (Task 2); `Button` (Task 5); `telHref`, `formatPhone` (Task 2)
- Produces: `STATS: { value: string; label: string }[]` from `src/data/stats.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/components/hero.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Hero from '../../src/components/home/Hero.astro';
import { STATS } from '../../src/data/stats';

async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Hero);
}

describe('Hero', () => {
  it('leads with the route-specific headline, not a generic platitude', async () => {
    const html = await render();
    expect(html).toContain('ASIA TO AMERICA');
    expect(html).toContain('DOOR TO DOOR');
    expect(html).not.toContain('YOU CAN TRUST');
  });

  it('renders exactly one h1', async () => {
    const html = await render();
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });

  it('names the concrete services in the subheadline', async () => {
    const html = await render();
    for (const term of ['Ocean FCL', 'air freight', 'customs clearance', 'trucking']) {
      expect(html).toContain(term);
    }
  });

  it('offers a quote CTA and a tap-to-call as the two actions', async () => {
    const html = await render();
    expect(html).toContain('href="/quote"');
    expect(html).toContain('tel:+16315965591');
  });

  it('does not offer a low-intent "Our Services" as the secondary action', async () => {
    const html = await render();
    expect(html).not.toContain('Our Services');
  });

  it('gives the hero background an empty alt, since it is decorative', async () => {
    const html = await render();
    expect(html).toContain('alt=""');
  });
});

describe('STATS', () => {
  it('never claims round-the-clock availability', () => {
    for (const stat of STATS) {
      expect(`${stat.value} ${stat.label}`.toLowerCase()).not.toContain('24/7');
    }
  });

  it('promises a quote turnaround the business can actually meet', () => {
    expect(STATS.some((s) => /24-hr quote/i.test(s.label))).toBe(true);
  });

  it('shows exactly three stats to match the three-column layout', () => {
    expect(STATS).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- hero`
Expected: FAIL — cannot resolve `src/components/home/Hero.astro`.

- [ ] **Step 3: Write `src/data/stats.ts`**

```ts
/**
 * Hero stat trio. The third slot replaced the old site's "24/7 Customer Support",
 * which was false — the business runs business hours only (spec defect D8).
 * "24-Hr Quote Turnaround" is a promise the business confirmed it can keep.
 */
export const STATS: { value: string; label: string }[] = [
  { value: '20+', label: 'Years Experience' },
  { value: '50+', label: 'Global Partners' },
  { value: '24-Hr', label: 'Quote Turnaround' },
];
```

- [ ] **Step 4: Write `src/components/home/StatsBar.astro`**

```astro
---
import { STATS } from '../../data/stats';
---
<div class="absolute bottom-0 inset-x-0 z-10 bg-navy-900/80 backdrop-blur-sm border-t border-white/10">
  <div class="container-gg">
    <dl class="grid grid-cols-3 divide-x divide-white/10 py-5">
      {STATS.map((stat) => (
        <div class="text-center px-2">
          <dt class="sr-only">{stat.label}</dt>
          <dd>
            <span class="block font-display text-amber-400 text-2xl md:text-3xl font-bold">{stat.value}</span>
            <span class="block text-slate-400 text-[0.7rem] md:text-xs tracking-wider uppercase mt-0.5">{stat.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  </div>
</div>
```

- [ ] **Step 5: Write `src/components/home/Hero.astro`**

Height is `85vh` rather than the old `min-h-screen`, so the next section peeks above the fold and invites scrolling. The FMC badge renders only when the number is known.

```astro
---
import Button from '../ui/Button.astro';
import StatsBar from './StatsBar.astro';
import { SITE } from '../../config/site';
import { telHref, formatPhone } from '../../lib/format';

const primary = SITE.phones[0];
const badgeText = SITE.credentials.fmcNumber
  ? `NVOCC & IATA Member · FMC ${SITE.credentials.fmcNumber}`
  : 'NVOCC & IATA Member';
---
<section class="relative min-h-[85vh] flex items-center overflow-hidden">
  <img
    src="/images/hero-bg.webp"
    alt=""
    fetchpriority="high"
    decoding="async"
    width="1920"
    height="1080"
    class="absolute inset-0 w-full h-full object-cover"
  />
  <div class="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/75 to-navy-900/40"></div>

  <div class="container-gg relative z-10 pt-16 pb-32">
    <p class="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
      <span class="w-1.5 h-1.5 bg-amber-400 rounded-full" aria-hidden="true"></span>
      {badgeText}
    </p>

    <h1 class="text-white mb-6">
      ASIA TO AMERICA,<br />
      <span class="text-amber-400">DOOR TO DOOR.</span>
    </h1>

    <p class="text-slate-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
      Ocean FCL &amp; LCL, air freight, customs clearance, JFK warehousing, and nationwide
      trucking &mdash; handled in-house by one team.
      <strong class="text-white font-semibold">Rates back in {SITE.quoteTurnaroundHours} hours.</strong>
    </p>

    <div class="flex flex-wrap gap-4">
      <Button href="/quote" class="px-8 py-4 text-base rounded">Get My Rate</Button>
      <a
        href={telHref(primary.number)}
        class="btn-outline px-8 py-4 text-base rounded"
      >
        <span aria-hidden="true">&#9742;</span> {formatPhone(primary.number)}
      </a>
    </div>
  </div>

  <StatsBar />
</section>
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- hero`
Expected: PASS, 9 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Option A hero with honest stats bar"
```

---

## Task 9: Trust stack — credentials, logos, testimonials

Fixes defects **D4** (no social proof of any kind) and **D5** (credentials claimed but unverifiable). Every component here renders nothing when its data is absent, so the site never shows an empty shell waiting to be filled.

**Files:**
- Create: `src/components/trust/TrustBar.astro`, `src/components/trust/LogoStrip.astro`, `src/components/trust/Testimonials.astro`, `src/data/testimonials.ts`, `src/data/partners.ts`
- Test: `tests/components/trust.test.ts`

**Interfaces:**
- Consumes: `SITE.credentials` (Task 2)
- Produces:
  - `TESTIMONIALS: Testimonial[]` where `Testimonial = { quote: string; name: string; title: string; company: string }`
  - `PARTNER_LOGOS: { name: string; src: string }[]`

- [ ] **Step 1: Write the failing test**

Create `tests/components/trust.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import TrustBar from '../../src/components/trust/TrustBar.astro';
import Testimonials from '../../src/components/trust/Testimonials.astro';
import { TESTIMONIALS } from '../../src/data/testimonials';

async function render(C: any) {
  const container = await AstroContainer.create();
  return container.renderToString(C);
}

describe('TrustBar', () => {
  it('states the NVOCC and C-TPAT credentials the business confirmed it holds', async () => {
    const html = await render(TrustBar);
    expect(html).toContain('NVOCC');
    expect(html).toContain('C-TPAT');
  });

  it('omits the FMC number rather than printing a placeholder when it is unknown', async () => {
    const html = await render(TrustBar);
    expect(html).not.toMatch(/FMC\s*#?\s*(TBD|XXX|_+)/i);
  });
});

describe('Testimonials', () => {
  it('renders nothing while no real testimonials have been supplied', async () => {
    const html = await render(Testimonials);
    if (TESTIMONIALS.length === 0) {
      expect(html.trim()).toBe('');
    }
  });
});

describe('TESTIMONIALS data', () => {
  it('requires a real name, title, and company on every entry', () => {
    for (const t of TESTIMONIALS) {
      expect(t.name.length).toBeGreaterThan(1);
      expect(t.title.length).toBeGreaterThan(1);
      expect(t.company.length).toBeGreaterThan(1);
      expect(t.name.toLowerCase()).not.toContain('anonymous');
    }
  });
});
```

The last assertion encodes a real conversion finding: anonymous testimonials do not convert. The data shape makes an anonymous entry impossible.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- trust`
Expected: FAIL — modules do not exist.

- [ ] **Step 3: Write `src/data/testimonials.ts`**

```ts
export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
}

/**
 * Empty until real, attributable testimonials are supplied (spec F8).
 * Anonymous testimonials do not convert, so the type forbids them:
 * every entry needs a name, a title, and a company.
 */
export const TESTIMONIALS: Testimonial[] = [];
```

- [ ] **Step 4: Write `src/data/partners.ts`**

```ts
/**
 * Carrier, airline, and association logos (spec F9).
 * Empty until confirmed — showing logos of carriers you do not work with is a legal risk.
 */
export const PARTNER_LOGOS: { name: string; src: string }[] = [];
```

- [ ] **Step 5: Write `src/components/trust/TrustBar.astro`**

```astro
---
import { SITE } from '../../config/site';

const items = [
  SITE.credentials.nvocc ? 'Licensed NVOCC' : null,
  SITE.credentials.fmcNumber ? `FMC License ${SITE.credentials.fmcNumber}` : null,
  SITE.credentials.iataNumber ? `IATA ${SITE.credentials.iataNumber}` : 'IATA Member',
  SITE.credentials.ctpatCertified ? 'C-TPAT Certified' : null,
].filter((v): v is string => v !== null);
---
{items.length > 0 && (
  <section aria-label="Certifications and licenses" class="bg-navy-800/40 border-y border-white/10">
    <ul class="container-gg flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5">
      {items.map((item) => (
        <li class="flex items-center gap-2 font-display uppercase tracking-[0.08em] text-xs md:text-sm text-slate-300">
          <span class="text-amber-400" aria-hidden="true">&#10003;</span>
          {item}
        </li>
      ))}
    </ul>
  </section>
)}
```

- [ ] **Step 6: Write `src/components/trust/LogoStrip.astro`**

```astro
---
import { PARTNER_LOGOS } from '../../data/partners';
---
{PARTNER_LOGOS.length > 0 && (
  <section aria-label="Carrier and association partners" class="bg-white py-10">
    <div class="container-gg">
      <p class="text-center font-display uppercase tracking-[0.08em] text-xs text-slate-400 mb-6">
        Working with the world's major carriers
      </p>
      <ul class="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {PARTNER_LOGOS.map((logo) => (
          <li>
            <img src={logo.src} alt={logo.name} height="32" loading="lazy" decoding="async"
                 class="h-8 w-auto object-contain opacity-60 grayscale" />
          </li>
        ))}
      </ul>
    </div>
  </section>
)}
```

- [ ] **Step 7: Write `src/components/trust/Testimonials.astro`**

```astro
---
import { TESTIMONIALS } from '../../data/testimonials';
---
{TESTIMONIALS.length > 0 && (
  <section aria-labelledby="testimonials-heading" class="bg-white py-16 md:py-24">
    <div class="container-gg">
      <p class="text-amber-500 text-sm font-bold tracking-widest uppercase">Client Feedback</p>
      <h2 id="testimonials-heading" class="text-navy-900 text-3xl md:text-4xl font-bold mt-2 mb-10">
        What our clients say
      </h2>
      <ul class="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <li class="bg-white border border-slate-100 rounded-xl p-7 shadow-sm">
            <blockquote class="text-slate-600 leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
            <footer class="mt-5 pt-5 border-t border-slate-100">
              <p class="font-display font-bold text-navy-900">{t.name}</p>
              <p class="text-sm text-slate-500">{t.title}, {t.company}</p>
            </footer>
          </li>
        ))}
      </ul>
    </div>
  </section>
)}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- trust`
Expected: PASS, 4 tests.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add trust bar, logo strip, and testimonials with null-safe rendering"
```

---

## Task 10: Service data, cards, and CTA band

**Files:**
- Create: `src/data/services.ts`, `src/components/services/ServiceCard.astro`, `src/components/services/ServiceGrid.astro`, `src/components/ui/CTABand.astro`, `src/components/ui/FAQAccordion.astro`
- Test: `tests/unit/services.test.ts`, `tests/components/service-card.test.ts`

**Interfaces:**
- Consumes: nothing new
- Produces:
  - `SERVICES: Service[]` where `Service = { slug, name, shortName, tagline, cardCopy, heroCopy, bullets: string[], faqs: FAQ[], image: string | null, metaTitle, metaDescription }`
  - `FAQ = { question: string; answer: string }`
  - `getService(slug: string): Service | undefined`
  - `CTABand` props `{ heading?: string; body?: string }`
  - `FAQAccordion` props `{ faqs: FAQ[]; heading?: string }`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/services.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { SERVICES, getService } from '../../src/data/services';

describe('SERVICES', () => {
  it('covers all six services from the original site', () => {
    expect(SERVICES.map((s) => s.slug).sort()).toEqual(
      [
        'air-freight',
        'customs-clearance',
        'domestic-trucking',
        'ocean-freight',
        'overseas-agent-network',
        'warehousing-distribution',
      ].sort()
    );
  });

  it('gives every service a unique slug', () => {
    expect(new Set(SERVICES.map((s) => s.slug)).size).toBe(SERVICES.length);
  });

  it('keeps every meta title within the 60-character search display limit', () => {
    for (const s of SERVICES) {
      expect(s.metaTitle.length, `${s.slug} title too long`).toBeLessThanOrEqual(60);
    }
  });

  it('keeps every meta description between 120 and 160 characters', () => {
    for (const s of SERVICES) {
      expect(s.metaDescription.length, `${s.slug} description length`).toBeGreaterThanOrEqual(120);
      expect(s.metaDescription.length, `${s.slug} description length`).toBeLessThanOrEqual(160);
    }
  });

  it('gives every service at least three FAQs, the format AI engines cite most', () => {
    for (const s of SERVICES) {
      expect(s.faqs.length, `${s.slug} needs more FAQs`).toBeGreaterThanOrEqual(3);
    }
  });

  it('opens every FAQ answer with a self-contained sentence, not a pronoun', () => {
    for (const s of SERVICES) {
      for (const f of s.faqs) {
        expect(f.answer, `${s.slug}: "${f.answer}"`).not.toMatch(/^(It|They|This|That|These|Those)\b/);
      }
    }
  });

  it('resolves a service by slug', () => {
    expect(getService('ocean-freight')?.name).toBe('Ocean Freight');
    expect(getService('nope')).toBeUndefined();
  });
});
```

The pronoun assertion enforces the spec's answer-first rule: AI engines extract single sentences, and a sentence starting with "It" is unquotable out of context.

Create `tests/components/service-card.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ServiceCard from '../../src/components/services/ServiceCard.astro';
import { SERVICES } from '../../src/data/services';

describe('ServiceCard', () => {
  it('links to the real service page rather than an in-page anchor', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ServiceCard, { props: { service: SERVICES[0] } });
    expect(html).toContain(`href="/services/${SERVICES[0].slug}"`);
    expect(html).not.toContain('href="#services"');
  });

  it('uses a heading element so the card is navigable by screen reader', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ServiceCard, { props: { service: SERVICES[0] } });
    expect(html).toMatch(/<h3[\s>]/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- services service-card`
Expected: FAIL — `src/data/services.ts` does not exist.

- [ ] **Step 3: Write `src/data/services.ts`**

Copy is expanded from the original site's card text. Each FAQ answer opens with a self-contained factual sentence.

```ts
export interface FAQ { question: string; answer: string; }

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  cardCopy: string;
  heroCopy: string;
  bullets: string[];
  faqs: FAQ[];
  image: string | null;
  metaTitle: string;
  metaDescription: string;
}

export const SERVICES: Service[] = [
  {
    slug: 'ocean-freight',
    name: 'Ocean Freight',
    shortName: 'Ocean',
    tagline: 'FCL & LCL',
    cardCopy:
      'Full container load (FCL) and less-than-container load (LCL) ocean freight with competitive rates on major trade lanes.',
    heroCopy:
      'Global Gate Logistics moves full and partial container loads between Asia and the United States as a licensed NVOCC. Because we hold service contracts directly with the major ocean carriers, we quote from our own rates rather than reselling someone else’s.',
    bullets: [
      'FCL in 20′, 40′, 40′HC and 45′ equipment',
      'Weekly LCL consolidations from major Asian ports',
      'Direct carrier service contracts as a licensed NVOCC',
      'Port-to-port, port-to-door, and full door-to-door routing',
      'Customs clearance and inland trucking arranged in-house',
    ],
    faqs: [
      {
        question: 'What is the difference between FCL and LCL?',
        answer:
          'FCL means your cargo occupies an entire container that nobody else shares, while LCL means your cargo is consolidated with other shippers’ goods in one container. FCL usually becomes cheaper per cubic meter once a shipment exceeds roughly 15 CBM.',
      },
      {
        question: 'How long does ocean freight take from Asia to the United States?',
        answer:
          'Transit time from major Asian ports to the US West Coast typically runs 14 to 20 days, and to the US East Coast 28 to 38 days depending on routing. LCL shipments add 3 to 7 days for consolidation and deconsolidation.',
      },
      {
        question: 'What information do you need to quote ocean freight?',
        answer:
          'A quote requires the origin port or city, the destination address or port, the cargo weight and volume, the commodity description, and the target ready date. Global Gate Logistics returns ocean quotes within 24 business hours.',
      },
      {
        question: 'Do you handle customs clearance for ocean shipments?',
        answer:
          'Yes. Customs clearance is handled in-house alongside the ocean booking, so a single team owns the shipment from origin port through delivery.',
      },
    ],
    image: '/images/service-ocean.webp',
    metaTitle: 'Ocean Freight FCL & LCL Shipping',
    metaDescription:
      'Licensed NVOCC ocean freight from Asia to the USA. FCL and LCL container shipping with direct carrier contracts, in-house customs clearance, and 24-hour quotes.',
  },
  {
    slug: 'air-freight',
    name: 'Air Freight',
    shortName: 'Air',
    tagline: 'Import & Export',
    cardCopy:
      'Fast, reliable air freight for time-sensitive cargo. Import and export services via major airlines worldwide.',
    heroCopy:
      'Global Gate Logistics is an IATA member handling air import and export through JFK and every major US gateway. Air freight suits cargo where the cost of waiting exceeds the cost of shipping — high-value goods, production-critical parts, and perishables.',
    bullets: [
      'IATA member with direct airline relationships',
      'Airport-to-airport and full door-to-door service',
      'Consolidated and direct services for urgent cargo',
      'Dangerous goods handling by certified staff',
      'Customs clearance at JFK and all major US gateways',
    ],
    faqs: [
      {
        question: 'How long does air freight take from Asia to the United States?',
        answer:
          'Air freight from major Asian airports to the United States typically takes 3 to 7 days door to door, including pickup, flight, customs clearance, and final delivery. Direct services can move urgent cargo in 2 to 3 days.',
      },
      {
        question: 'When is air freight cheaper than ocean freight?',
        answer:
          'Air freight becomes competitive when a shipment is light relative to its value, generally under about 500 kilograms, or when delayed arrival would cost more than the freight itself. Ocean freight is almost always cheaper per kilogram for heavy cargo.',
      },
      {
        question: 'How is air freight priced?',
        answer:
          'Airlines charge on chargeable weight, which is the greater of actual gross weight and volumetric weight. Volumetric weight is calculated by dividing the shipment volume in cubic centimeters by 6,000.',
      },
      {
        question: 'Can you handle dangerous goods by air?',
        answer:
          'Yes. Certified staff prepare dangerous goods declarations and packaging in line with IATA regulations. Provide the material safety data sheet when requesting a quote.',
      },
    ],
    image: '/images/service-air.webp',
    metaTitle: 'Air Freight Import & Export Services',
    metaDescription:
      'IATA member air freight forwarding for time-sensitive cargo. Import and export via JFK and all major US gateways, with dangerous goods handling and 24-hour quotes.',
  },
  {
    slug: 'warehousing-distribution',
    name: 'Warehousing & Distribution',
    shortName: 'Warehouse',
    tagline: 'Storage & Fulfillment',
    cardCopy:
      'Secure warehousing and distribution with real-time inventory management and flexible storage.',
    heroCopy:
      'Global Gate Logistics operates warehousing near JFK for cargo that needs to be received, stored, deconsolidated, or redistributed. Storage sits alongside our freight and customs operations, so cargo does not change hands between companies on arrival.',
    bullets: [
      'Short-term and long-term storage near JFK',
      'Container deconsolidation and cargo redistribution',
      'Pick, pack, and palletizing',
      'Real-time inventory visibility',
      'Direct connection to our trucking and customs operations',
    ],
    faqs: [
      {
        question: 'Where is your warehouse located?',
        answer:
          'Global Gate Logistics operates from 153-04 Rockaway Blvd in Queens, New York, minutes from JFK International Airport and within reach of the Port of New York and New Jersey.',
      },
      {
        question: 'What is container deconsolidation?',
        answer:
          'Deconsolidation is the process of unloading a shared container and separating cargo by consignee for onward delivery. LCL shipments require deconsolidation before final delivery can begin.',
      },
      {
        question: 'How is warehouse storage priced?',
        answer:
          'Storage is typically priced per pallet position per week or per square foot per month, depending on how cargo is stored. Handling charges for receiving and dispatch are quoted separately.',
      },
      {
        question: 'Can you store cargo before customs clearance?',
        answer:
          'Arrangements for cargo awaiting clearance can be made as part of a combined customs and warehousing booking. Contact the team with your entry details to confirm what applies to your shipment.',
      },
    ],
    image: '/images/service-warehouse.webp',
    metaTitle: 'Warehousing & Distribution Near JFK',
    metaDescription:
      'Secure warehousing and distribution in Queens, NY, minutes from JFK. Deconsolidation, pick and pack, real-time inventory, and direct links to customs and trucking.',
  },
  {
    slug: 'customs-clearance',
    name: 'Customs Clearance',
    shortName: 'Customs',
    tagline: 'Brokerage & Compliance',
    cardCopy:
      'Expert customs brokerage ensuring smooth, compliant clearance through U.S. and international customs.',
    heroCopy:
      'Customs clearance is handled in-house rather than subcontracted, which means the team booking your freight is the team filing your entry. Global Gate Logistics is C-TPAT certified and files entries electronically with U.S. Customs and Border Protection.',
    bullets: [
      'C-TPAT certified customs operations',
      'Electronic entry filing with U.S. CBP',
      'HTS classification and duty estimation',
      'ISF (10+2) filing for ocean imports',
      'Partner government agency filings including FDA and USDA',
    ],
    faqs: [
      {
        question: 'How long does customs clearance take in the United States?',
        answer:
          'Most US customs entries clear within 24 to 48 hours of arrival when documentation is complete and correct. Shipments selected for examination can take an additional 3 to 7 days.',
      },
      {
        question: 'What documents are needed to clear US customs?',
        answer:
          'A standard import entry requires the commercial invoice, the packing list, the bill of lading or air waybill, and a customs bond. Regulated commodities require additional partner government agency filings.',
      },
      {
        question: 'What is an ISF filing and when is it due?',
        answer:
          'ISF, also called Importer Security Filing or 10+2, is a data submission required for US ocean imports. The filing must reach CBP at least 24 hours before the cargo is loaded at the origin port, and late filings carry penalties.',
      },
      {
        question: 'Do I need my own customs bond?',
        answer:
          'Importers need either a single-entry bond covering one shipment or a continuous bond covering a year of entries. A continuous bond usually costs less once an importer exceeds roughly four entries per year.',
      },
    ],
    image: null,
    metaTitle: 'US Customs Clearance & Brokerage',
    metaDescription:
      'C-TPAT certified customs brokerage with in-house entry filing, HTS classification, ISF filing, and FDA and USDA submissions. Clear US customs without the handoffs.',
  },
  {
    slug: 'domestic-trucking',
    name: 'Domestic Trucking',
    shortName: 'Trucking',
    tagline: 'Drayage & Delivery',
    cardCopy:
      'Comprehensive domestic trucking connecting ports and airports to your final destination across the United States.',
    heroCopy:
      'Global Gate Logistics arranges drayage from the port and airport plus onward delivery anywhere in the United States. Because trucking is booked alongside the ocean or air leg, there is no gap where cargo sits waiting for a separate carrier to be arranged.',
    bullets: [
      'Port and airport drayage in the New York metro area',
      'Nationwide FTL and LTL delivery',
      'Container drayage to and from our JFK-area warehouse',
      'Delivery appointment scheduling with receivers',
      'Coordinated with the ocean, air, and customs legs',
    ],
    faqs: [
      {
        question: 'What is drayage?',
        answer:
          'Drayage is the short-haul trucking move that takes a container from a port or airport to a nearby warehouse or delivery point. Drayage is billed separately from ocean or air freight and is a common source of surprise charges.',
      },
      {
        question: 'Do you deliver outside the New York area?',
        answer:
          'Yes. Global Gate Logistics arranges delivery to any address in the continental United States, using full truckload for larger shipments and less-than-truckload for smaller consignments.',
      },
      {
        question: 'What are demurrage and detention charges?',
        answer:
          'Demurrage is charged when a container stays at the terminal beyond its free time, and detention is charged when the container stays outside the terminal too long before being returned. Booking drayage early is the most reliable way to avoid both.',
      },
      {
        question: 'Can you schedule a delivery appointment with my warehouse?',
        answer:
          'Yes. Delivery appointments are booked directly with the receiving facility, which most large distribution centers require before a truck will be accepted.',
      },
    ],
    image: null,
    metaTitle: 'Domestic Trucking & Port Drayage',
    metaDescription:
      'Port and airport drayage plus nationwide FTL and LTL delivery. Trucking booked alongside your ocean or air freight, with appointment scheduling and no coverage gaps.',
  },
  {
    slug: 'overseas-agent-network',
    name: 'Overseas Agent Network',
    shortName: 'Agents',
    tagline: 'Global Partnerships',
    cardCopy:
      'An extensive network of overseas cargo agents providing seamless logistics regardless of origin or destination.',
    heroCopy:
      'Global Gate Logistics acts as the United States partner for freight forwarders and cargo agents abroad. Overseas agents get a single US counterpart handling ocean, air, customs, warehousing, and final delivery, instead of coordinating four separate vendors across time zones.',
    bullets: [
      'Established agent relationships across Asia, Europe, and the Americas',
      'One US partner for freight, customs, warehousing, and delivery',
      'Competitive net rates for agent-routed cargo',
      'Prompt quote turnaround across time zones',
      'Full destination handling for your clients’ cargo',
    ],
    faqs: [
      {
        question: 'Do you work with overseas freight forwarders as agents?',
        answer:
          'Yes. Global Gate Logistics acts as the United States destination partner for forwarders and cargo agents worldwide, handling ocean, air, customs, warehousing, and final delivery on their behalf.',
      },
      {
        question: 'What does Global Gate Logistics handle for an overseas agent?',
        answer:
          'A destination agent handles arrival notice, customs entry, deconsolidation, warehousing, and final delivery. Global Gate Logistics performs all of these in-house rather than subcontracting them out.',
      },
      {
        question: 'How do overseas agents request rates?',
        answer:
          'Agents can email the operations team directly or submit the quote form on this website. Rate requests are answered within 24 business hours.',
      },
      {
        question: 'Which trade lanes do you specialize in?',
        answer:
          'Global Gate Logistics specializes in Asia to America routing, with particular depth on shipments moving into the New York and New Jersey gateway through JFK and the Port of New York and New Jersey.',
      },
    ],
    image: null,
    metaTitle: 'Overseas Agent Network & US Partner',
    metaDescription:
      'Your United States destination partner for ocean, air, customs, warehousing, and delivery. One counterpart for overseas forwarders, with 24-hour rate turnaround.',
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
```

- [ ] **Step 4: Write `src/components/services/ServiceCard.astro`**

```astro
---
import type { Service } from '../../data/services';
interface Props { service: Service; }
const { service } = Astro.props;
---
<li class="bg-navy-800/50 border border-white/10 rounded-xl overflow-hidden group transition-transform hover:-translate-y-1">
  <a href={`/services/${service.slug}`} class="block h-full">
    {service.image ? (
      <div class="relative h-44 overflow-hidden">
        <img src={service.image} alt="" loading="lazy" decoding="async" width="600" height="400"
             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div class="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent"></div>
      </div>
    ) : (
      <div class="h-20 bg-gradient-to-br from-navy-800 to-navy-900 border-b border-white/10"></div>
    )}
    <div class="p-6">
      <h3 class="font-display text-white text-xl font-bold mb-1">{service.name}</h3>
      <p class="text-amber-400 text-xs font-semibold tracking-wider uppercase mb-3">{service.tagline}</p>
      <p class="text-slate-400 text-sm leading-relaxed">{service.cardCopy}</p>
      <p class="mt-4 font-display uppercase tracking-[0.08em] text-xs text-amber-400">
        Learn more <span aria-hidden="true">&rarr;</span>
      </p>
    </div>
  </a>
</li>
```

- [ ] **Step 5: Write `src/components/services/ServiceGrid.astro`**

```astro
---
import ServiceCard from './ServiceCard.astro';
import { SERVICES } from '../../data/services';
---
<section aria-labelledby="services-heading" class="bg-navy-900 py-16 md:py-24">
  <div class="container-gg">
    <div class="text-center mb-12">
      <p class="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-5">
        What We Do
      </p>
      <h2 id="services-heading" class="font-display text-white text-3xl md:text-5xl font-bold">
        Every step, one team
      </h2>
      <p class="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mt-4">
        Ocean, air, customs, warehousing, and trucking handled in-house &mdash; so your cargo
        never waits at a handoff between vendors.
      </p>
    </div>
    <ul class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {SERVICES.map((service) => <ServiceCard service={service} />)}
    </ul>
  </div>
</section>
```

- [ ] **Step 6: Write `src/components/ui/CTABand.astro`**

```astro
---
import Button from './Button.astro';
import { SITE } from '../../config/site';
import { telHref, formatPhone } from '../../lib/format';

interface Props { heading?: string; body?: string; }
const {
  heading = 'Ready to move your cargo?',
  body = `Send us your route and we’ll come back with rates within ${SITE.quoteTurnaroundHours} business hours.`,
} = Astro.props;
const primary = SITE.phones[0];
---
<section class="bg-amber-500">
  <div class="container-gg py-10 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
    <div>
      <h2 class="font-display text-navy-900 text-2xl md:text-3xl font-bold">{heading}</h2>
      <p class="text-navy-900/80 mt-2 max-w-xl">{body}</p>
    </div>
    <div class="flex flex-wrap gap-3 shrink-0">
      <a href="/quote" class="inline-flex items-center justify-center bg-navy-900 text-white font-display font-bold uppercase tracking-[0.08em] px-7 py-4 rounded hover:bg-navy-800 transition-colors">
        Get My Rate
      </a>
      <a href={telHref(primary.number)} class="inline-flex items-center justify-center border border-navy-900 text-navy-900 font-display font-bold uppercase tracking-[0.08em] px-7 py-4 rounded hover:bg-navy-900 hover:text-white transition-colors">
        {formatPhone(primary.number)}
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 7: Write `src/components/ui/FAQAccordion.astro`**

Built on `<details>`/`<summary>`, so it expands and collapses with no JavaScript at all — every answer is present in the HTML for crawlers regardless.

```astro
---
import type { FAQ } from '../../data/services';
interface Props { faqs: FAQ[]; heading?: string; }
const { faqs, heading = 'Frequently asked questions' } = Astro.props;
---
{faqs.length > 0 && (
  <section aria-labelledby="faq-heading" class="bg-white py-16 md:py-20">
    <div class="container-gg max-w-3xl">
      <h2 id="faq-heading" class="font-display text-navy-900 text-3xl md:text-4xl font-bold mb-8">
        {heading}
      </h2>
      <div class="divide-y divide-slate-200 border-y border-slate-200">
        {faqs.map((faq) => (
          <details class="group py-5">
            <summary class="flex items-center justify-between gap-4 cursor-pointer list-none font-display font-bold text-navy-900 text-lg">
              {faq.question}
              <span class="text-amber-500 shrink-0 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p class="mt-3 text-slate-600 leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npm test -- services service-card`
Expected: PASS, 9 tests.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add service data, cards, CTA band, and no-JS FAQ accordion"
```

---

## Task 11: Homepage

**Files:**
- Create: `src/components/home/About.astro`, `src/components/home/WhyUs.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/components/homepage.test.ts`

**Interfaces:**
- Consumes: `BaseLayout` (Task 4), `Hero` (Task 8), `TrustBar`/`LogoStrip`/`Testimonials` (Task 9), `ServiceGrid`/`CTABand` (Task 10)
- Produces: the rendered homepage

- [ ] **Step 1: Write the failing test**

Create `tests/components/homepage.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Index from '../../src/pages/index.astro';

async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Index);
}

describe('Homepage', () => {
  it('renders exactly one h1', async () => {
    const html = await render();
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });

  it('never skips a heading level', async () => {
    const html = await render();
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1], `jump from h${levels[i - 1]} to h${levels[i]}`).toBeLessThanOrEqual(1);
    }
  });

  it('links all six service pages', async () => {
    const html = await render();
    for (const slug of [
      'ocean-freight', 'air-freight', 'warehousing-distribution',
      'customs-clearance', 'domestic-trucking', 'overseas-agent-network',
    ]) {
      expect(html).toContain(`/services/${slug}`);
    }
  });

  it('offers multiple conversion points, not just one at the bottom', async () => {
    const html = await render();
    expect((html.match(/href="\/quote"/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });

  it('contains the full company description as crawlable text', async () => {
    const html = await render();
    expect(html).toContain('NVOCC');
    expect(html).toContain('Asia');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- homepage`
Expected: FAIL — the scaffolded `index.astro` has no hero or services.

- [ ] **Step 3: Write `src/components/home/About.astro`**

```astro
---
import { SITE } from '../../config/site';

const points = [
  'Trusted by major shipping carriers and airlines',
  'Specialized in Asia–America cargo routing',
  'Worldwide connections to overseas cargo agents',
  'Personalized service for every client',
];
---
<section aria-labelledby="about-heading" class="bg-white py-16 md:py-24">
  <div class="container-gg grid md:grid-cols-2 gap-12 md:gap-16 items-center">
    <div>
      <p class="text-amber-500 text-sm font-bold tracking-widest uppercase">Who We Are</p>
      <h2 id="about-heading" class="font-display text-navy-900 text-3xl md:text-5xl font-bold mt-2 mb-6">
        One forwarder, every leg of the journey
      </h2>
      <p class="text-slate-600 text-base md:text-lg leading-relaxed mb-5">
        {SITE.name} is an international freight forwarder and a full non-vessel operating common
        carrier (NVOCC) and IATA member. Direct service contracts with the major shipping carriers
        and airlines mean we quote from our own rates rather than reselling another forwarder's.
      </p>
      <p class="text-slate-600 text-base md:text-lg leading-relaxed">
        That lets us move cargo worldwide regardless of origin or destination, supported by our
        Queens operation and a well-developed agent network abroad.
      </p>
      <a href="/about" class="inline-block mt-6 font-display uppercase tracking-[0.08em] text-sm text-amber-500 hover:text-amber-400">
        More about us <span aria-hidden="true">&rarr;</span>
      </a>
    </div>

    <div class="bg-navy-900 rounded-2xl p-8 md:p-10">
      <h3 class="font-display text-white text-xl font-bold mb-6 tracking-wide">Why shippers choose us</h3>
      <ul class="space-y-4">
        {points.map((point) => (
          <li class="flex gap-3 text-slate-300 text-sm md:text-base leading-snug">
            <span class="text-amber-400 shrink-0" aria-hidden="true">&#10003;</span>
            {point}
          </li>
        ))}
      </ul>
      <p class="mt-8 pt-6 border-t border-white/10 text-slate-400 text-sm italic leading-relaxed">
        Our team takes the time to understand each client's requirements and finds the solution
        that best meets their needs.
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Write `src/components/home/WhyUs.astro`**

```astro
---
const reasons = [
  {
    title: 'Asia–America specialists',
    body: 'Deep expertise in Asia to America routing, earning the daily support of businesses moving goods in and out of the United States.',
  },
  {
    title: 'Solutions, not just bookings',
    body: 'Our team understands each shipment’s time and cost requirements before recommending a routing, rather than quoting the first option available.',
  },
  {
    title: 'Direct carrier rates',
    body: 'Trust built with major shipping carriers and airlines secures reasonable service contract rates that we pass on to our customers.',
  },
  {
    title: 'End-to-end under one roof',
    body: 'Ocean, air, warehousing, customs clearance, and domestic trucking are handled in-house, so nothing is lost between vendors.',
  },
];
---
<section aria-labelledby="why-heading" class="bg-slate-50 py-16 md:py-24">
  <div class="container-gg">
    <div class="mb-12">
      <p class="text-amber-500 text-sm font-bold tracking-widest uppercase">Why Global Gate</p>
      <h2 id="why-heading" class="font-display text-navy-900 text-3xl md:text-5xl font-bold mt-2">
        What you get working with us
      </h2>
    </div>
    <ol class="grid sm:grid-cols-2 gap-6 md:gap-8">
      {reasons.map((reason, i) => (
        <li class="bg-white rounded-xl p-7 md:p-8 border border-slate-100 flex gap-5">
          <span class="font-display text-5xl font-bold text-slate-100 leading-none select-none" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 class="font-display text-navy-900 text-xl font-bold mb-2">{reason.title}</h3>
            <p class="text-slate-500 text-sm leading-relaxed">{reason.body}</p>
          </div>
        </li>
      ))}
    </ol>
  </div>
</section>
```

- [ ] **Step 5: Write `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/home/Hero.astro';
import TrustBar from '../components/trust/TrustBar.astro';
import About from '../components/home/About.astro';
import ServiceGrid from '../components/services/ServiceGrid.astro';
import WhyUs from '../components/home/WhyUs.astro';
import LogoStrip from '../components/trust/LogoStrip.astro';
import Testimonials from '../components/trust/Testimonials.astro';
import CTABand from '../components/ui/CTABand.astro';
import { SITE } from '../config/site';

const description =
  'International freight forwarder and NVOCC specializing in Asia–America cargo. Ocean FCL & LCL, air freight, customs clearance, JFK warehousing, and nationwide trucking.';
---
<BaseLayout description={description} pathname="/">
  <Hero />
  <TrustBar />
  <About />
  <ServiceGrid />
  <CTABand />
  <WhyUs />
  <LogoStrip />
  <Testimonials />
  <CTABand
    heading="Tell us where it's going."
    body={`Ocean, air, customs, warehousing, trucking — one team handles all of it. Rates within ${SITE.quoteTurnaroundHours} business hours.`}
  />
</BaseLayout>
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- homepage`
Expected: PASS, 5 tests.

- [ ] **Step 7: Verify visually**

Run: `npm run dev` and open `http://localhost:4321`. Confirm the hero matches the navy/amber design, the stats bar sits at the hero's base, and the mobile sticky bar appears at narrow widths.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: assemble homepage with multiple conversion points"
```

---

## Task 12: Quote form validation

Shared by the browser and the serverless endpoint, so a bypassed client check cannot produce a malformed lead.

**Files:**
- Create: `src/lib/quote-validation.ts`
- Test: `tests/unit/quote-validation.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `type QuoteSubmission` — `{ mode, origin, destination, cargo, readyDate, commodity, name, company, email, phone, notes }`, all strings
  - `type ValidationResult` — `{ ok: true; data: QuoteSubmission } | { ok: false; errors: Record<string, string> }`
  - `validateQuote(input: unknown): ValidationResult`
  - `SHIPPING_MODES: readonly string[]`
  - `formatQuoteSubject(data: QuoteSubmission): string`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/quote-validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validateQuote, formatQuoteSubject, SHIPPING_MODES } from '../../src/lib/quote-validation';

const valid = {
  mode: 'Ocean LCL',
  origin: 'Ningbo, China',
  destination: 'Chicago, IL 60601',
  cargo: '12 CBM, 3200 kg',
  readyDate: '2026-09-02',
  commodity: 'Furniture',
  name: 'Jane Doe',
  company: 'Doe Imports',
  email: 'jane@doeimports.com',
  phone: '312-555-0100',
  notes: '',
};

describe('validateQuote', () => {
  it('accepts a complete submission', () => {
    const result = validateQuote(valid);
    expect(result.ok).toBe(true);
  });

  it('requires the fields the sales team needs to actually quote', () => {
    const result = validateQuote({ ...valid, origin: '', destination: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.origin).toBeDefined();
      expect(result.errors.destination).toBeDefined();
    }
  });

  it('rejects a malformed email', () => {
    const result = validateQuote({ ...valid, email: 'not-an-email' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeDefined();
  });

  it('rejects an unknown shipping mode', () => {
    const result = validateQuote({ ...valid, mode: 'Teleportation' });
    expect(result.ok).toBe(false);
  });

  it('accepts every offered shipping mode', () => {
    for (const mode of SHIPPING_MODES) {
      expect(validateQuote({ ...valid, mode }).ok, mode).toBe(true);
    }
  });

  it('trims whitespace so " " does not pass as a name', () => {
    const result = validateQuote({ ...valid, name: '   ' });
    expect(result.ok).toBe(false);
  });

  it('rejects non-object input without throwing', () => {
    expect(validateQuote(null).ok).toBe(false);
    expect(validateQuote('string').ok).toBe(false);
  });

  it('caps field length to prevent abuse', () => {
    const result = validateQuote({ ...valid, notes: 'x'.repeat(6000) });
    expect(result.ok).toBe(false);
  });

  it('treats notes and commodity as genuinely optional', () => {
    const result = validateQuote({ ...valid, notes: '', commodity: '' });
    expect(result.ok).toBe(true);
  });
});

describe('formatQuoteSubject', () => {
  it('front-loads route and mode so the inbox is triageable at a glance', () => {
    expect(formatQuoteSubject(valid)).toBe(
      '[QUOTE] Ocean LCL · Ningbo, China → Chicago, IL 60601 · Doe Imports'
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- quote-validation`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/quote-validation.ts`**

```ts
export const SHIPPING_MODES = [
  'Ocean FCL',
  'Ocean LCL',
  'Air Freight',
  'Not sure yet',
] as const;

export type ShippingMode = (typeof SHIPPING_MODES)[number];

export interface QuoteSubmission {
  mode: string;
  origin: string;
  destination: string;
  cargo: string;
  readyDate: string;
  commodity: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
}

export type ValidationResult =
  | { ok: true; data: QuoteSubmission }
  | { ok: false; errors: Record<string, string> };

const MAX_LENGTH = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const REQUIRED: (keyof QuoteSubmission)[] = [
  'mode', 'origin', 'destination', 'cargo', 'name', 'company', 'email', 'phone',
];

const LABELS: Record<string, string> = {
  mode: 'Shipping mode',
  origin: 'Origin',
  destination: 'Destination',
  cargo: 'Cargo details',
  name: 'Name',
  company: 'Company',
  email: 'Email',
  phone: 'Phone',
};

export function validateQuote(input: unknown): ValidationResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, errors: { form: 'Invalid submission.' } };
  }

  const raw = input as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const str = (key: string): string => (typeof raw[key] === 'string' ? (raw[key] as string).trim() : '');

  const data: QuoteSubmission = {
    mode: str('mode'),
    origin: str('origin'),
    destination: str('destination'),
    cargo: str('cargo'),
    readyDate: str('readyDate'),
    commodity: str('commodity'),
    name: str('name'),
    company: str('company'),
    email: str('email'),
    phone: str('phone'),
    notes: str('notes'),
  };

  for (const field of REQUIRED) {
    if (data[field] === '') errors[field] = `${LABELS[field]} is required.`;
  }

  if (data.email !== '' && !EMAIL_RE.test(data.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (data.mode !== '' && !SHIPPING_MODES.includes(data.mode as ShippingMode)) {
    errors.mode = 'Select a shipping mode from the list.';
  }

  for (const [key, value] of Object.entries(data)) {
    if (value.length > MAX_LENGTH) errors[key] = 'This field is too long.';
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, data };
}

/** Subject line front-loads route and mode so operations can triage without opening the email. */
export function formatQuoteSubject(data: QuoteSubmission): string {
  return `[QUOTE] ${data.mode} · ${data.origin} → ${data.destination} · ${data.company}`;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- quote-validation`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add shared quote form validation"
```

---

## Task 13: Quote delivery endpoint

**This task fixes defect D1**, the single most expensive bug on the old site: a form that displayed a success message while silently discarding every lead. The rule enforced here is absolute — the endpoint returns success **only** when the lead was actually delivered.

**Files:**
- Create: `src/pages/api/quote.ts`, `.env.example`
- Test: `tests/unit/quote-endpoint.test.ts`

**Interfaces:**
- Consumes: `validateQuote`, `formatQuoteSubject` (Task 12); `SITE` (Task 2)
- Produces: `POST /api/quote` accepting JSON, returning `200 {ok:true}`, `400 {ok:false, errors}`, or `502 {ok:false, message, fallback:{email, phone}}`

- [ ] **Step 1: Install Resend**

```bash
npm install resend
```

- [ ] **Step 2: Write `.env.example`**

```
# Resend API key — https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxx

# Verified sender on the global-gate.us domain
QUOTE_FROM_EMAIL=website@global-gate.us

# Where quote requests are delivered
QUOTE_TO_EMAIL=Op01@global-gate.us
```

- [ ] **Step 3: Write the failing test**

Create `tests/unit/quote-endpoint.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: class { emails = { send: sendMock }; },
}));

const valid = {
  mode: 'Ocean FCL', origin: 'Shanghai', destination: 'Newark, NJ',
  cargo: '1x40HC', readyDate: '2026-09-10', commodity: 'Textiles',
  name: 'Jane Doe', company: 'Doe Imports', email: 'jane@doeimports.com',
  phone: '312-555-0100', notes: '',
};

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://global-gate.us/api/quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  sendMock.mockReset();
  process.env.RESEND_API_KEY = 'test-key';
  process.env.QUOTE_FROM_EMAIL = 'website@global-gate.us';
  process.env.QUOTE_TO_EMAIL = 'Op01@global-gate.us';
});

describe('POST /api/quote', () => {
  it('returns 200 only after the email is accepted', async () => {
    sendMock.mockResolvedValue({ data: { id: 'abc' }, error: null });
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post(valid) } as any);
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledOnce();
  });

  it('delivers to the configured operations address', async () => {
    sendMock.mockResolvedValue({ data: { id: 'abc' }, error: null });
    const { POST } = await import('../../src/pages/api/quote');
    await POST({ request: post(valid) } as any);
    expect(sendMock.mock.calls[0][0].to).toBe('Op01@global-gate.us');
  });

  it('sets a reply-to of the enquirer so staff can reply directly', async () => {
    sendMock.mockResolvedValue({ data: { id: 'abc' }, error: null });
    const { POST } = await import('../../src/pages/api/quote');
    await POST({ request: post(valid) } as any);
    expect(sendMock.mock.calls[0][0].replyTo).toBe('jane@doeimports.com');
  });

  it('rejects an invalid submission with 400 and never sends', async () => {
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post({ ...valid, email: 'bad' }) } as any);
    expect(res.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('NEVER reports success when delivery fails — this is defect D1', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'domain not verified' } });
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post(valid) } as any);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.fallback.email).toBe('Op01@global-gate.us');
    expect(body.fallback.phone).toBe('631-596-5591');
  });

  it('also reports failure when the mail client throws', async () => {
    sendMock.mockRejectedValue(new Error('network down'));
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post(valid) } as any);
    expect(res.status).toBe(502);
  });

  it('silently accepts and discards submissions that fill the honeypot', async () => {
    const { POST } = await import('../../src/pages/api/quote');
    const res = await POST({ request: post({ ...valid, company_website: 'http://spam.example' }) } as any);
    expect(res.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npm test -- quote-endpoint`
Expected: FAIL — endpoint does not exist.

- [ ] **Step 5: Write `src/pages/api/quote.ts`**

```ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { validateQuote, formatQuoteSubject, type QuoteSubmission } from '../../lib/quote-validation';
import { SITE } from '../../config/site';

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildEmailBody(data: QuoteSubmission): string {
  const rows: [string, string][] = [
    ['Mode', data.mode],
    ['Origin', data.origin],
    ['Destination', data.destination],
    ['Cargo', data.cargo],
    ['Ready date', data.readyDate || '—'],
    ['Commodity', data.commodity || '—'],
    ['Name', data.name],
    ['Company', data.company],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Notes', data.notes || '—'],
  ];
  const cells = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;background:#f1f5f9">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 12px">${escapeHtml(value)}</td></tr>`
    )
    .join('');
  return `<h2 style="font-family:sans-serif">New quote request</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${cells}</table>`;
}

export const POST: APIRoute = async ({ request }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, errors: { form: 'Invalid request body.' } }, 400);
  }

  // Honeypot: a real browser leaves this hidden field empty. Bots fill everything.
  // Respond 200 so the bot believes it succeeded and does not retry.
  const honeypot = (payload as Record<string, unknown>)?.company_website;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return json({ ok: true }, 200);
  }

  const result = validateQuote(payload);
  if (!result.ok) {
    return json({ ok: false, errors: result.errors }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.QUOTE_FROM_EMAIL;
  const to = process.env.QUOTE_TO_EMAIL ?? SITE.email;

  const failure = () =>
    json(
      {
        ok: false,
        message:
          'We could not send your request automatically. Please email or call us and we will respond right away.',
        fallback: { email: SITE.email, phone: SITE.phones[0].number },
      },
      502
    );

  if (!apiKey || !from) return failure();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: result.data.email,
      subject: formatQuoteSubject(result.data),
      html: buildEmailBody(result.data),
    });
    if (error) return failure();
    return json({ ok: true }, 200);
  } catch {
    return failure();
  }
};
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- quote-endpoint`
Expected: PASS, 7 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add quote endpoint that never reports false success"
```

---

## Task 14: Quote form and hero widget

Fixes defect **D12** — the old CTA promised "Get a Free Quote" and delivered a blank message textarea. The form posts natively when JavaScript is unavailable, so it works for every visitor.

**Files:**
- Create: `src/components/forms/QuoteForm.astro`, `src/components/forms/QuoteWidget.astro`
- Test: `tests/components/quote-form.test.ts`

**Interfaces:**
- Consumes: `SHIPPING_MODES` (Task 12); `SITE` (Task 2)
- Produces: `QuoteForm` props `{ compact?: boolean }`; `QuoteWidget` takes no props

- [ ] **Step 1: Write the failing test**

Create `tests/components/quote-form.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import QuoteForm from '../../src/components/forms/QuoteForm.astro';
import { SHIPPING_MODES } from '../../src/lib/quote-validation';

async function render(props: Record<string, unknown> = {}) {
  const container = await AstroContainer.create();
  return container.renderToString(QuoteForm, { props });
}

describe('QuoteForm', () => {
  it('collects every field the sales team needs to quote', async () => {
    const html = await render();
    for (const name of ['mode', 'origin', 'destination', 'cargo', 'name', 'company', 'email', 'phone']) {
      expect(html, `missing field: ${name}`).toContain(`name="${name}"`);
    }
  });

  it('offers all shipping modes as selectable options', async () => {
    const html = await render();
    for (const mode of SHIPPING_MODES) expect(html).toContain(mode);
  });

  it('posts to the API endpoint so it works without JavaScript', async () => {
    const html = await render();
    expect(html).toContain('action="/api/quote"');
    expect(html).toContain('method="post"');
  });

  it('includes a hidden honeypot field for spam filtering', async () => {
    const html = await render();
    expect(html).toContain('name="company_website"');
    expect(html).toContain('tabindex="-1"');
  });

  it('states the response-time promise beside the submit button', async () => {
    const html = await render();
    expect(html).toMatch(/24 business hours/i);
  });

  it('labels every input for screen readers', async () => {
    const html = await render();
    const inputs = [...html.matchAll(/name="([a-z_]+)"/g)].map((m) => m[1]).filter((n) => n !== 'company_website');
    for (const name of new Set(inputs)) {
      expect(html, `no label for ${name}`).toContain(`for="q-${name}"`);
    }
  });

  it('marks required fields with the required attribute', async () => {
    const html = await render();
    expect((html.match(/required/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- quote-form`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Write `src/components/forms/QuoteForm.astro`**

Two visual steps driven by progressive enhancement. Without JavaScript both fieldsets show and the form posts natively; with JavaScript it steps and submits via `fetch`.

```astro
---
import { SHIPPING_MODES } from '../../lib/quote-validation';
import { SITE } from '../../config/site';
import { telHref, formatPhone } from '../../lib/format';

interface Props { compact?: boolean; }
const { compact = false } = Astro.props;

const inputClass =
  'w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors';
const labelClass = 'block text-slate-300 text-sm font-semibold mb-2 tracking-wide';
---
<form id="quote-form" action="/api/quote" method="post" class="space-y-8" novalidate>
  <fieldset data-step="1" class="space-y-5 border-0 p-0 m-0">
    <legend class="font-display text-white text-lg font-bold mb-2">1. Your shipment</legend>

    <div>
      <label class={labelClass} for="q-mode">Shipping mode</label>
      <select id="q-mode" name="mode" required class={inputClass}>
        <option value="">Select a mode</option>
        {SHIPPING_MODES.map((mode) => <option value={mode}>{mode}</option>)}
      </select>
    </div>

    <div class="grid sm:grid-cols-2 gap-5">
      <div>
        <label class={labelClass} for="q-origin">Origin</label>
        <input id="q-origin" name="origin" required class={inputClass} placeholder="Port, city, or country" />
      </div>
      <div>
        <label class={labelClass} for="q-destination">Destination</label>
        <input id="q-destination" name="destination" required class={inputClass} placeholder="US city or ZIP" />
      </div>
    </div>

    <div class="grid sm:grid-cols-2 gap-5">
      <div>
        <label class={labelClass} for="q-cargo">Cargo weight &amp; volume</label>
        <input id="q-cargo" name="cargo" required class={inputClass} placeholder="e.g. 12 CBM, 3200 kg — or 1x40HC" />
      </div>
      <div>
        <label class={labelClass} for="q-readyDate">Ready date</label>
        <input id="q-readyDate" name="readyDate" type="date" class={inputClass} />
      </div>
    </div>

    <div>
      <label class={labelClass} for="q-commodity">Commodity <span class="text-slate-500 font-normal">(optional)</span></label>
      <input id="q-commodity" name="commodity" class={inputClass} placeholder="What are you shipping?" />
    </div>

    <button type="button" data-next class="btn-amber w-full py-4 text-base rounded-lg hidden">
      Continue &rarr;
    </button>
  </fieldset>

  <fieldset data-step="2" class="space-y-5 border-0 p-0 m-0">
    <legend class="font-display text-white text-lg font-bold mb-2">2. Where to send the rate</legend>

    <div class="grid sm:grid-cols-2 gap-5">
      <div>
        <label class={labelClass} for="q-name">Your name</label>
        <input id="q-name" name="name" required class={inputClass} />
      </div>
      <div>
        <label class={labelClass} for="q-company">Company</label>
        <input id="q-company" name="company" required class={inputClass} />
      </div>
    </div>

    <div class="grid sm:grid-cols-2 gap-5">
      <div>
        <label class={labelClass} for="q-email">Email</label>
        <input id="q-email" name="email" type="email" required class={inputClass} />
      </div>
      <div>
        <label class={labelClass} for="q-phone">Phone</label>
        <input id="q-phone" name="phone" type="tel" required class={inputClass} />
      </div>
    </div>

    {!compact && (
      <div>
        <label class={labelClass} for="q-notes">Anything else? <span class="text-slate-500 font-normal">(optional)</span></label>
        <textarea id="q-notes" name="notes" rows="3" class={inputClass}></textarea>
      </div>
    )}

    <div class="hidden" aria-hidden="true">
      <label for="q-company_website">Leave this field empty</label>
      <input id="q-company_website" name="company_website" tabindex="-1" autocomplete="off" />
    </div>

    <button type="submit" class="btn-amber w-full py-4 text-base rounded-lg">Send My Request</button>
    <p class="text-slate-400 text-sm text-center">
      Rates back within {SITE.quoteTurnaroundHours} business hours. No obligation.
    </p>
  </fieldset>

  <div id="quote-status" role="status" aria-live="polite"></div>
</form>

<script>
  const form = document.getElementById('quote-form') as HTMLFormElement | null;
  const status = document.getElementById('quote-status');
  if (form && status) {
    const stepOne = form.querySelector('[data-step="1"]') as HTMLFieldSetElement;
    const stepTwo = form.querySelector('[data-step="2"]') as HTMLFieldSetElement;
    const next = form.querySelector('[data-next]') as HTMLButtonElement;

    // JS is available: switch to two-step mode.
    next.classList.remove('hidden');
    stepTwo.hidden = true;

    next.addEventListener('click', () => {
      const required = [...stepOne.querySelectorAll('[required]')] as HTMLInputElement[];
      if (required.every((el) => el.reportValidity())) {
        stepOne.hidden = true;
        stepTwo.hidden = false;
        stepTwo.querySelector('input')?.focus();
      }
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = form.querySelector('[type="submit"]') as HTMLButtonElement;
      submit.disabled = true;
      submit.textContent = 'Sending…';
      status.innerHTML = '';

      try {
        const payload = Object.fromEntries(new FormData(form).entries());
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = await res.json();

        if (res.ok && body.ok) {
          form.innerHTML =
            '<div class="bg-amber-500/20 border border-amber-500/40 rounded-xl p-8 text-center">' +
            '<p class="font-display text-amber-400 text-xl font-bold mb-2">Request received</p>' +
            '<p class="text-slate-300 text-sm">We’ve got your details and will send rates within 24 business hours.</p>' +
            '</div>';
          return;
        }

        // Never claim success we did not earn.
        const fallback = body.fallback ?? {};
        status.innerHTML =
          '<div class="border border-red-400/40 bg-red-500/10 rounded-xl p-5 text-sm text-red-200">' +
          '<p class="font-semibold mb-1">We couldn’t send that automatically.</p>' +
          '<p>Please call <a class="underline" href="tel:+1' + String(fallback.phone ?? '').replace(/\D/g, '') + '">' +
          (fallback.phone ?? '') + '</a> or email <a class="underline" href="mailto:' +
          (fallback.email ?? '') + '">' + (fallback.email ?? '') + '</a> and we’ll respond right away.</p>' +
          '</div>';
      } catch {
        status.innerHTML =
          '<div class="border border-red-400/40 bg-red-500/10 rounded-xl p-5 text-sm text-red-200">' +
          '<p>Network error. Please call us and we’ll take the details over the phone.</p></div>';
      } finally {
        submit.disabled = false;
        submit.textContent = 'Send My Request';
      }
    });
  }
</script>
```

- [ ] **Step 4: Write `src/components/forms/QuoteWidget.astro`**

Three fields that hand off to the full form, carrying the entered values in the query string.

```astro
---
const inputClass =
  'w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400';
---
<form action="/quote" method="get" class="bg-navy-800/60 backdrop-blur-sm border border-white/15 rounded-2xl p-5 md:p-6 space-y-4 max-w-md">
  <p class="font-display text-white text-lg font-bold">Get a rate in 24 hours</p>
  <div>
    <label class="sr-only" for="w-origin">Origin</label>
    <input id="w-origin" name="origin" required class={inputClass} placeholder="Origin port or city" />
  </div>
  <div>
    <label class="sr-only" for="w-destination">Destination</label>
    <input id="w-destination" name="destination" required class={inputClass} placeholder="US destination" />
  </div>
  <div>
    <label class="sr-only" for="w-email">Email</label>
    <input id="w-email" name="email" type="email" required class={inputClass} placeholder="Your email" />
  </div>
  <button type="submit" class="btn-amber w-full py-3 rounded-lg">Get My Rate</button>
</form>
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- quote-form`
Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add two-step quote form with no-JS fallback and honest error handling"
```

---

## Task 15: Quote, contact, and about pages

**Files:**
- Create: `src/pages/quote.astro`, `src/pages/contact.astro`, `src/pages/about.astro`
- Test: `tests/components/pages.test.ts`

**Interfaces:**
- Consumes: `BaseLayout` (Task 4), `QuoteForm` (Task 14), `Breadcrumbs` (Task 4), `faqSchema` (Task 3), `SITE` (Task 2)
- Produces: three rendered pages

- [ ] **Step 1: Write the failing test**

Create `tests/components/pages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Quote from '../../src/pages/quote.astro';
import Contact from '../../src/pages/contact.astro';
import About from '../../src/pages/about.astro';

async function render(C: any) {
  const container = await AstroContainer.create();
  return container.renderToString(C);
}

describe.each([
  ['quote', Quote],
  ['contact', Contact],
  ['about', About],
])('%s page', (name, Component) => {
  it('renders exactly one h1', async () => {
    const html = await render(Component);
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });

  it('sets a unique canonical URL', async () => {
    const html = await render(Component);
    expect(html).toContain(`href="https://global-gate.us/${name}"`);
  });

  it('sets a meta description', async () => {
    const html = await render(Component);
    expect(html).toMatch(/name="description" content=".{50,}"/);
  });
});

describe('Quote page', () => {
  it('presents the actual quote form, matching the CTA promise', async () => {
    const html = await render(Quote);
    expect(html).toContain('action="/api/quote"');
    expect(html).toContain('name="origin"');
  });
});

describe('Contact page', () => {
  it('publishes the NAP and both phone numbers', async () => {
    const html = await render(Contact);
    expect(html).toContain('153-04 Rockaway Blvd');
    expect(html).toContain('tel:+16315965591');
    expect(html).toContain('tel:+16315965592');
  });

  it('never advertises round-the-clock availability', async () => {
    const html = await render(Contact);
    expect(html).not.toContain('24/7');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- pages`
Expected: FAIL — pages do not exist.

- [ ] **Step 3: Write `src/pages/quote.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Breadcrumbs from '../components/seo/Breadcrumbs.astro';
import QuoteForm from '../components/forms/QuoteForm.astro';
import { SITE } from '../config/site';
import { telHref, formatPhone } from '../lib/format';

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Request a Quote', href: '/quote' },
];
const description =
  'Request an ocean, air, customs, or trucking quote from Global Gate Logistics. Tell us your route and cargo, and we return rates within 24 business hours.';
---
<BaseLayout title="Request a Quote" {description} pathname="/quote" {breadcrumbs}>
  <div class="bg-navy-900">
    <Breadcrumbs trail={breadcrumbs} />
    <div class="container-gg pb-16 md:pb-24 pt-4 grid lg:grid-cols-2 gap-12">
      <div>
        <h1 class="text-white mb-6" style="font-size:clamp(2.5rem,6vw,4rem)">
          GET YOUR<br /><span class="text-amber-400">RATE.</span>
        </h1>
        <p class="text-slate-300 text-lg leading-relaxed mb-8">
          Give us the route and the cargo. We come back with a rate within
          {SITE.quoteTurnaroundHours} business hours &mdash; no obligation, no account required.
        </p>
        <div class="bg-navy-800/40 border border-white/10 rounded-2xl p-6 space-y-4">
          <p class="font-display text-white font-bold">Prefer to talk it through?</p>
          {SITE.phones.map((p) => (
            <p>
              <a href={telHref(p.number)} class="text-amber-400 hover:text-amber-300 font-display text-lg">
                {formatPhone(p.number)}
              </a>
              <span class="text-slate-500 text-sm ml-2">{p.label}</span>
            </p>
          ))}
          <p>
            <a href={`mailto:${SITE.email}`} class="text-slate-300 hover:text-amber-400 text-sm">{SITE.email}</a>
          </p>
        </div>
      </div>
      <div class="bg-navy-800/40 border border-white/10 rounded-2xl p-6 md:p-8">
        <QuoteForm />
      </div>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Write `src/pages/contact.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Breadcrumbs from '../components/seo/Breadcrumbs.astro';
import QuoteForm from '../components/forms/QuoteForm.astro';
import CTABand from '../components/ui/CTABand.astro';
import { SITE } from '../config/site';
import { telHref, formatPhone, formatAddressOneLine } from '../lib/format';

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Contact', href: '/contact' },
];
const description =
  'Contact Global Gate Logistics in Queens, New York. Call 631-596-5591, email our operations team, or send your shipment details for a rate within 24 business hours.';
---
<BaseLayout title="Contact Us" {description} pathname="/contact" {breadcrumbs}>
  <div class="bg-navy-900">
    <Breadcrumbs trail={breadcrumbs} />
    <div class="container-gg pb-16 md:pb-24 pt-4">
      <h1 class="text-white mb-4" style="font-size:clamp(2.5rem,6vw,4rem)">
        TALK TO<br /><span class="text-amber-400">OUR TEAM.</span>
      </h1>
      <p class="text-slate-400 text-lg max-w-2xl mb-12">
        We're minutes from JFK. Visit during business hours, call, or send your shipment details
        and we'll come straight back to you.
      </p>

      <div class="grid md:grid-cols-2 gap-10 md:gap-14">
        <div class="space-y-4">
          <div class="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-5">
            <div>
              <p class="text-white font-semibold text-sm mb-1">Office</p>
              <address class="not-italic text-slate-400 text-sm leading-relaxed">
                {formatAddressOneLine(SITE.address)}
              </address>
            </div>
          </div>

          <div class="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-5">
            <div>
              <p class="text-white font-semibold text-sm mb-1">Phone</p>
              {SITE.phones.map((p) => (
                <p>
                  <a href={telHref(p.number)} class="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                    {formatPhone(p.number)}
                  </a>
                  <span class="text-slate-600 text-xs ml-2">{p.label}</span>
                </p>
              ))}
            </div>
          </div>

          <div class="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-5">
            <div>
              <p class="text-white font-semibold text-sm mb-1">Email</p>
              <a href={`mailto:${SITE.email}`} class="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                {SITE.email}
              </a>
            </div>
          </div>

          {SITE.hours.display && (
            <div class="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-5">
              <div>
                <p class="text-white font-semibold text-sm mb-1">Business hours</p>
                <p class="text-slate-400 text-sm">{SITE.hours.display}</p>
              </div>
            </div>
          )}
        </div>

        <div class="bg-navy-800/40 border border-white/10 rounded-2xl p-6 md:p-8">
          <QuoteForm compact />
        </div>
      </div>
    </div>
  </div>
  <CTABand />
</BaseLayout>
```

- [ ] **Step 5: Write `src/pages/about.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Breadcrumbs from '../components/seo/Breadcrumbs.astro';
import TrustBar from '../components/trust/TrustBar.astro';
import WhyUs from '../components/home/WhyUs.astro';
import CTABand from '../components/ui/CTABand.astro';
import { SITE } from '../config/site';

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
];
const description =
  'Global Gate Logistics is a licensed NVOCC and IATA member in Queens, New York, specializing in Asia–America freight with ocean, air, customs, and warehousing in-house.';
---
<BaseLayout title="About Us" {description} pathname="/about" {breadcrumbs}>
  <div class="bg-navy-900">
    <Breadcrumbs trail={breadcrumbs} />
    <div class="container-gg pb-16 pt-4">
      <h1 class="text-white mb-6" style="font-size:clamp(2.5rem,6vw,4rem)">
        BUILT ON<br /><span class="text-amber-400">CARRIER TRUST.</span>
      </h1>
      <p class="text-slate-300 text-lg md:text-xl leading-relaxed max-w-3xl">
        {SITE.name} is an international freight forwarder and a full non-vessel operating common
        carrier (NVOCC) and IATA member, operating from Queens, New York.
      </p>
    </div>
  </div>
  <TrustBar />

  <section class="bg-white py-16 md:py-24">
    <div class="container-gg max-w-3xl space-y-6 text-slate-600 text-base md:text-lg leading-relaxed">
      <h2 class="font-display text-navy-900 text-3xl md:text-4xl font-bold">How we work</h2>
      <p>
        We have developed and earned the trust of nearly all the major shipping carriers and
        airlines. That relationship secures reasonable service contract rates, which we pass on to
        our customers rather than marking up someone else's freight.
      </p>
      <p>
        It also means we can offer worldwide logistics regardless of where cargo starts or ends,
        supported by our main office near JFK and a well-developed network of logistics agents abroad.
      </p>
      <h2 class="font-display text-navy-900 text-3xl md:text-4xl font-bold pt-4">Our specialty</h2>
      <p>
        Our depth is in Asia–America cargo routing. We handle ocean FCL and LCL, air import and
        export, customs clearance, warehousing, and domestic trucking in-house &mdash; so a shipment
        never sits idle waiting for the next vendor in a chain to pick it up.
      </p>
      <p>
        We offer quality service not only to you as agent, exporter, or importer &mdash; but also to
        your clients.
      </p>
    </div>
  </section>

  <WhyUs />
  <CTABand />
</BaseLayout>
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test -- pages`
Expected: PASS, 13 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add quote, contact, and about pages"
```

---

## Task 16: Service pages and services hub

Fixes defect **D3** — a single page can rank for only one topic. This adds seven ranking surfaces.

**Files:**
- Create: `src/layouts/ServiceLayout.astro`, `src/pages/services/index.astro`, `src/pages/services/[slug].astro`
- Test: `tests/components/service-pages.test.ts`

**Interfaces:**
- Consumes: `SERVICES`, `getService` (Task 10); `serviceSchema`, `faqSchema` (Task 3); `FAQAccordion`, `CTABand` (Task 10); `BaseLayout`, `Breadcrumbs` (Task 4)
- Produces: 7 routes — `/services` plus six `/services/<slug>`

- [ ] **Step 1: Write the failing test**

Create `tests/components/service-pages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ServicesIndex from '../../src/pages/services/index.astro';
import ServiceDetail from '../../src/pages/services/[slug].astro';
import { SERVICES } from '../../src/data/services';

async function renderDetail(slug: string) {
  const service = SERVICES.find((s) => s.slug === slug)!;
  const container = await AstroContainer.create();
  return container.renderToString(ServiceDetail, {
    props: { service },
    params: { slug },
  });
}

describe('Services hub', () => {
  it('links all six service pages', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ServicesIndex);
    for (const s of SERVICES) expect(html).toContain(`/services/${s.slug}`);
  });
});

describe.each(SERVICES.map((s) => [s.slug, s.name]))('Service page: %s', (slug, name) => {
  it('renders exactly one h1 containing the service name', async () => {
    const html = await renderDetail(slug);
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
    expect(html).toContain(name);
  });

  it('emits Service JSON-LD', async () => {
    const html = await renderDetail(slug);
    expect(html).toContain('"@type":"Service"');
  });

  it('emits FAQPage JSON-LD for AI citation', async () => {
    const html = await renderDetail(slug);
    expect(html).toContain('"@type":"FAQPage"');
  });

  it('renders every FAQ answer as crawlable text, not hidden behind JavaScript', async () => {
    const service = SERVICES.find((s) => s.slug === slug)!;
    const html = await renderDetail(slug);
    for (const faq of service.faqs) {
      expect(html).toContain(faq.question);
    }
  });

  it('offers a conversion path', async () => {
    const html = await renderDetail(slug);
    expect(html).toContain('href="/quote"');
  });

  it('links back to the services hub via breadcrumbs', async () => {
    const html = await renderDetail(slug);
    expect(html).toContain('href="/services"');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- service-pages`
Expected: FAIL — pages do not exist.

- [ ] **Step 3: Write `src/layouts/ServiceLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import Breadcrumbs from '../components/seo/Breadcrumbs.astro';
import FAQAccordion from '../components/ui/FAQAccordion.astro';
import CTABand from '../components/ui/CTABand.astro';
import TrustBar from '../components/trust/TrustBar.astro';
import { serviceSchema, faqSchema } from '../lib/schema';
import { canonicalUrl } from '../lib/seo';
import type { Service } from '../data/services';

interface Props { service: Service; }
const { service } = Astro.props;

const pathname = `/services/${service.slug}`;
const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: service.name, href: pathname },
];

const schemas = [
  serviceSchema({
    name: service.name,
    description: service.metaDescription,
    url: canonicalUrl(pathname),
  }),
  faqSchema(service.faqs),
];
---
<BaseLayout
  title={service.metaTitle}
  description={service.metaDescription}
  {pathname}
  {breadcrumbs}
  {schemas}
>
  <div class="bg-navy-900">
    <Breadcrumbs trail={breadcrumbs} />
    <div class="container-gg pb-14 pt-4 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <p class="text-amber-400 text-xs font-bold tracking-widest uppercase mb-4">{service.tagline}</p>
        <h1 class="text-white mb-6" style="font-size:clamp(2.25rem,5.5vw,3.75rem)">{service.name}</h1>
        <p class="text-slate-300 text-lg leading-relaxed">{service.heroCopy}</p>
      </div>
      {service.image && (
        <img src={service.image} alt={`${service.name} operations`} width="600" height="400"
             loading="eager" decoding="async" class="rounded-2xl w-full h-64 md:h-80 object-cover" />
      )}
    </div>
  </div>
  <TrustBar />

  <section class="bg-white py-16 md:py-20">
    <div class="container-gg max-w-3xl">
      <h2 class="font-display text-navy-900 text-3xl md:text-4xl font-bold mb-8">What's included</h2>
      <ul class="space-y-4">
        {service.bullets.map((bullet) => (
          <li class="flex gap-3 text-slate-600 text-base md:text-lg leading-relaxed">
            <span class="text-amber-500 shrink-0 mt-1" aria-hidden="true">&#10003;</span>
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  </section>

  <CTABand heading={`Need ${service.name.toLowerCase()}?`} />
  <FAQAccordion faqs={service.faqs} heading={`${service.name}: common questions`} />

  <section class="bg-slate-50 py-14">
    <div class="container-gg">
      <h2 class="font-display text-navy-900 text-2xl font-bold mb-6">Other services</h2>
      <slot name="related" />
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 4: Write `src/pages/services/[slug].astro`**

```astro
---
import ServiceLayout from '../../layouts/ServiceLayout.astro';
import { SERVICES, type Service } from '../../data/services';

export function getStaticPaths() {
  return SERVICES.map((service) => ({
    params: { slug: service.slug },
    props: { service },
  }));
}

interface Props { service: Service; }
const { service } = Astro.props;
const related = SERVICES.filter((s) => s.slug !== service.slug);
---
<ServiceLayout {service}>
  <ul slot="related" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {related.map((s) => (
      <li>
        <a href={`/services/${s.slug}`}
           class="block bg-white border border-slate-100 rounded-xl p-5 hover:border-amber-400 transition-colors">
          <span class="font-display text-navy-900 font-bold">{s.name}</span>
          <span class="block text-slate-500 text-sm mt-1">{s.tagline}</span>
        </a>
      </li>
    ))}
  </ul>
</ServiceLayout>
```

- [ ] **Step 5: Write `src/pages/services/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumbs from '../../components/seo/Breadcrumbs.astro';
import ServiceCard from '../../components/services/ServiceCard.astro';
import CTABand from '../../components/ui/CTABand.astro';
import TrustBar from '../../components/trust/TrustBar.astro';
import { SERVICES } from '../../data/services';

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
];
const description =
  'Ocean FCL and LCL, air freight, customs clearance, warehousing near JFK, domestic trucking, and overseas agent services — all handled in-house by Global Gate Logistics.';
---
<BaseLayout title="Freight Forwarding Services" {description} pathname="/services" {breadcrumbs}>
  <div class="bg-navy-900">
    <Breadcrumbs trail={breadcrumbs} />
    <div class="container-gg pb-12 pt-4">
      <h1 class="text-white mb-6" style="font-size:clamp(2.5rem,6vw,4rem)">
        EVERY LEG,<br /><span class="text-amber-400">ONE TEAM.</span>
      </h1>
      <p class="text-slate-300 text-lg max-w-2xl leading-relaxed">
        Ocean, air, customs, warehousing, and trucking are handled in-house rather than
        subcontracted &mdash; so your cargo never waits at a handoff between vendors.
      </p>
    </div>
    <div class="container-gg pb-16">
      <ul class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((service) => <ServiceCard {service} />)}
      </ul>
    </div>
  </div>
  <TrustBar />
  <CTABand />
</BaseLayout>
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test -- service-pages`
Expected: PASS, 37 tests (6 services × 6 assertions, plus the hub).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add services hub and six service pages with Service and FAQ schema"
```

---

## Task 17: Legal pages and 404

**Files:**
- Create: `src/pages/privacy-policy.astro`, `src/pages/terms.astro`, `src/pages/404.astro`
- Test: `tests/components/utility-pages.test.ts`

**Interfaces:**
- Consumes: `BaseLayout` (Task 4), `SITE` (Task 2)
- Produces: three routes

- [ ] **Step 1: Write the failing test**

Create `tests/components/utility-pages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import NotFound from '../../src/pages/404.astro';
import Privacy from '../../src/pages/privacy-policy.astro';
import Terms from '../../src/pages/terms.astro';

async function render(C: any) {
  const container = await AstroContainer.create();
  return container.renderToString(C);
}

describe('404 page', () => {
  it('routes lost visitors back into the site rather than dead-ending', async () => {
    const html = await render(NotFound);
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/services"');
    expect(html).toContain('href="/quote"');
  });

  it('is excluded from search indexes', async () => {
    const html = await render(NotFound);
    expect(html).toContain('name="robots" content="noindex, nofollow"');
  });
});

describe.each([['privacy-policy', Privacy], ['terms', Terms]])('%s', (_name, Component) => {
  it('renders exactly one h1', async () => {
    const html = await render(Component);
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });

  it('names the legal entity and a contact route', async () => {
    const html = await render(Component);
    expect(html).toContain('Global Gate Logistics Inc');
    expect(html).toContain('Op01@global-gate.us');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- utility-pages`
Expected: FAIL — pages do not exist.

- [ ] **Step 3: Write `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout
  title="Page Not Found"
  description="The page you are looking for does not exist. Browse our freight forwarding services or request a quote."
  pathname="/404"
  noindex
>
  <section class="bg-navy-900 min-h-[60vh] flex items-center">
    <div class="container-gg py-20 text-center">
      <p class="font-display text-amber-400 text-6xl md:text-8xl font-bold">404</p>
      <h1 class="text-white mt-4 mb-6" style="font-size:clamp(2rem,5vw,3rem)">Page not found</h1>
      <p class="text-slate-400 text-lg max-w-md mx-auto mb-10">
        That page has moved or never existed. Here's where most people are headed:
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/" class="btn-outline px-7 py-3 rounded">Home</a>
        <a href="/services" class="btn-outline px-7 py-3 rounded">Services</a>
        <a href="/quote" class="btn-amber px-7 py-3 rounded">Get a Quote</a>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 4: Write `src/pages/privacy-policy.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE } from '../config/site';
import { formatAddressOneLine } from '../lib/format';

const updated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
---
<BaseLayout
  title="Privacy Policy"
  description="How Global Gate Logistics Inc collects, uses, and protects the information you submit through this website."
  pathname="/privacy-policy"
>
  <div class="bg-navy-900 py-12">
    <div class="container-gg">
      <h1 class="text-white" style="font-size:clamp(2rem,5vw,3rem)">Privacy Policy</h1>
      <p class="text-slate-400 mt-3">Last updated {updated}</p>
    </div>
  </div>
  <section class="bg-white py-14">
    <div class="container-gg max-w-3xl space-y-6 text-slate-600 leading-relaxed">
      <h2 class="font-display text-navy-900 text-2xl font-bold">Who we are</h2>
      <p>
        {SITE.legalName}, {formatAddressOneLine(SITE.address)}, operates this website. Questions about
        this policy can be sent to <a class="text-amber-600 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2 class="font-display text-navy-900 text-2xl font-bold">What we collect</h2>
      <p>
        When you submit a quote request we collect the name, company, email address, phone number,
        and shipment details you provide. We also collect standard analytics data such as pages
        viewed and approximate location, through Google Analytics.
      </p>

      <h2 class="font-display text-navy-900 text-2xl font-bold">How we use it</h2>
      <p>
        Quote request information is used solely to prepare and send your rate and to follow up on
        your enquiry. Analytics data is used to understand which pages are useful and to improve
        the site. We do not sell your information.
      </p>

      <h2 class="font-display text-navy-900 text-2xl font-bold">Who we share it with</h2>
      <p>
        We share information only with service providers who help us operate: our email delivery
        provider, our website host, and our analytics provider. We may also disclose information
        where required by law or by customs and transport regulations.
      </p>

      <h2 class="font-display text-navy-900 text-2xl font-bold">Your choices</h2>
      <p>
        You can ask us to correct or delete the information you submitted by emailing
        <a class="text-amber-600 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>. You can
        block analytics cookies through your browser settings at any time.
      </p>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 5: Write `src/pages/terms.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE } from '../config/site';
import { formatAddressOneLine } from '../lib/format';

const updated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
---
<BaseLayout
  title="Terms of Use"
  description="Terms governing the use of the Global Gate Logistics website, including quotes, service terms, and limitations."
  pathname="/terms"
>
  <div class="bg-navy-900 py-12">
    <div class="container-gg">
      <h1 class="text-white" style="font-size:clamp(2rem,5vw,3rem)">Terms of Use</h1>
      <p class="text-slate-400 mt-3">Last updated {updated}</p>
    </div>
  </div>
  <section class="bg-white py-14">
    <div class="container-gg max-w-3xl space-y-6 text-slate-600 leading-relaxed">
      <h2 class="font-display text-navy-900 text-2xl font-bold">Website use</h2>
      <p>
        This website is operated by {SITE.legalName}, {formatAddressOneLine(SITE.address)}. By using
        it you agree to these terms. Content is provided for general information about our services.
      </p>

      <h2 class="font-display text-navy-900 text-2xl font-bold">Quotes and estimates</h2>
      <p>
        Rates, transit times, and other figures on this site are indicative and are not an offer.
        Any quotation we issue is subject to the details you supply being accurate, to space and
        equipment availability, and to the terms stated on the quotation itself.
      </p>

      <h2 class="font-display text-navy-900 text-2xl font-bold">Service terms</h2>
      <p>
        Freight forwarding, NVOCC, customs brokerage, warehousing, and trucking services are
        governed by the terms and conditions issued with the relevant booking, bill of lading, air
        waybill, or warehouse receipt, and by applicable United States law and regulation.
      </p>

      <h2 class="font-display text-navy-900 text-2xl font-bold">Accuracy</h2>
      <p>
        Customs requirements, transit times, and regulations change. While we keep this site current,
        we do not warrant that all information is complete or up to date at the time you read it.
        Contact us at <a class="text-amber-600 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        to confirm anything you intend to rely on.
      </p>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- utility-pages`
Expected: PASS, 6 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add privacy policy, terms, and 404 pages"
```

---

## Task 18: robots.txt, llms.txt, and sitemap

The GEO layer. `llms.txt` is the emerging convention for handing AI models a clean summary of a site, and the explicit crawler allowances stop AI bots being blocked by default rules.

**Files:**
- Create: `public/robots.txt`, `public/llms.txt`
- Modify: `astro.config.mjs` (sitemap options)
- Test: `tests/build/geo-files.test.ts`

**Interfaces:**
- Consumes: `SITE` (Task 2)
- Produces: `/robots.txt`, `/llms.txt`, `/sitemap-index.xml`

- [ ] **Step 1: Write the failing test**

Create `tests/build/geo-files.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-Web',
  'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bingbot',
];

describe('robots.txt', () => {
  const robots = readFileSync('public/robots.txt', 'utf8');

  it.each(AI_CRAWLERS)('explicitly allows %s', (bot) => {
    expect(robots).toContain(`User-agent: ${bot}`);
  });

  it('never issues a blanket Disallow of the whole site', () => {
    expect(robots).not.toMatch(/^Disallow:\s*\/\s*$/m);
  });

  it('points crawlers at the sitemap', () => {
    expect(robots).toContain('Sitemap: https://global-gate.us/sitemap-index.xml');
  });

  it('keeps the API endpoint out of the index', () => {
    expect(robots).toContain('Disallow: /api/');
  });
});

describe('llms.txt', () => {
  const llms = readFileSync('public/llms.txt', 'utf8');

  it('exists at the site root', () => {
    expect(existsSync('public/llms.txt')).toBe(true);
  });

  it('identifies the company as a verifiable entity', () => {
    expect(llms).toContain('Global Gate Logistics Inc');
    expect(llms).toContain('153-04 Rockaway Blvd');
    expect(llms).toContain('631-596-5591');
  });

  it('lists every service page so models can navigate the site', () => {
    for (const slug of [
      'ocean-freight', 'air-freight', 'warehousing-distribution',
      'customs-clearance', 'domestic-trucking', 'overseas-agent-network',
    ]) {
      expect(llms).toContain(`/services/${slug}`);
    }
  });

  it('makes no claim of round-the-clock availability', () => {
    expect(llms).not.toContain('24/7');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- geo-files`
Expected: FAIL — files do not exist.

- [ ] **Step 3: Write `public/robots.txt`**

```
# Global Gate Logistics — https://global-gate.us

User-agent: *
Allow: /
Disallow: /api/

# Search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# AI search and answer engines — explicitly welcomed.
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://global-gate.us/sitemap-index.xml
```

- [ ] **Step 4: Write `public/llms.txt`**

```
# Global Gate Logistics

> Global Gate Logistics Inc is a United States international freight forwarder,
> licensed NVOCC, and IATA member based in Queens, New York, specializing in
> Asia-America cargo routing. Ocean, air, customs clearance, warehousing, and
> domestic trucking are handled in-house by one team.

## Company facts

- Legal name: Global Gate Logistics Inc
- Address: 153-04 Rockaway Blvd, Queens, NY 11434, United States
- Phone: 631-596-5591 (main), 631-596-5592 (alternate)
- Email: Op01@global-gate.us
- Website: https://global-gate.us
- Type: International freight forwarder, NVOCC, IATA member, C-TPAT certified
- Specialization: Asia to America cargo routing
- Service area: United States, nationwide
- Quote turnaround: within 24 business hours
- Availability: business hours

## Services

- [Ocean Freight](https://global-gate.us/services/ocean-freight): FCL and LCL container
  shipping with direct carrier service contracts as a licensed NVOCC.
- [Air Freight](https://global-gate.us/services/air-freight): IATA member air import and
  export via JFK and all major US gateways, including dangerous goods.
- [Warehousing & Distribution](https://global-gate.us/services/warehousing-distribution):
  Storage, deconsolidation, and pick and pack near JFK International Airport.
- [Customs Clearance](https://global-gate.us/services/customs-clearance): C-TPAT certified
  in-house customs brokerage, electronic entry filing, HTS classification, and ISF filing.
- [Domestic Trucking](https://global-gate.us/services/domestic-trucking): Port and airport
  drayage plus nationwide FTL and LTL delivery.
- [Overseas Agent Network](https://global-gate.us/services/overseas-agent-network): United
  States destination partner services for freight forwarders and cargo agents abroad.

## Key pages

- [Home](https://global-gate.us/)
- [About](https://global-gate.us/about)
- [All services](https://global-gate.us/services)
- [Request a quote](https://global-gate.us/quote)
- [Contact](https://global-gate.us/contact)
```

- [ ] **Step 5: Configure the sitemap in `astro.config.mjs`**

Replace `integrations: [sitemap()]` with:

```js
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      lastmod: new Date(),
    }),
  ],
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- geo-files`
Expected: PASS, 15 tests.

- [ ] **Step 7: Verify the sitemap builds**

Run: `npm run build && ls dist/sitemap*`
Expected: `dist/sitemap-index.xml` and `dist/sitemap-0.xml` exist. Confirm `/404` is absent from the sitemap.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add robots.txt, llms.txt, and sitemap for search and AI crawlers"
```

---

## Task 19: Build-output verification

Component tests prove components behave. These tests prove the **shipped site** obeys the rules — the guarantees that make or break SEO and AI visibility.

**Files:**
- Create: `tests/build/seo-invariants.test.ts`
- Modify: `package.json` (add `test:build`)

**Interfaces:**
- Consumes: `dist/` produced by `npm run build`
- Produces: nothing consumed downstream

- [ ] **Step 1: Install the HTML parser**

```bash
npm install -D linkedom glob
```

- [ ] **Step 2: Add the build test script to `package.json`**

```json
"test:build": "astro build && vitest run tests/build"
```

- [ ] **Step 3: Write `tests/build/seo-invariants.test.ts`**

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { globSync } from 'glob';
import { parseHTML } from 'linkedom';

interface Page { path: string; html: string; doc: Document; }

let pages: Page[] = [];

beforeAll(() => {
  const files = globSync('dist/**/*.html');
  expect(files.length, 'run `npm run build` before this suite').toBeGreaterThan(0);
  pages = files.map((path) => {
    const html = readFileSync(path, 'utf8');
    return { path, html, doc: parseHTML(html).document as unknown as Document };
  });
});

describe('every built page', () => {
  it('was actually generated for all expected routes', () => {
    const paths = pages.map((p) => p.path.replace(/\\/g, '/'));
    const expected = [
      'dist/index.html', 'dist/about/index.html', 'dist/contact/index.html',
      'dist/quote/index.html', 'dist/services/index.html',
      'dist/services/ocean-freight/index.html', 'dist/services/air-freight/index.html',
      'dist/services/warehousing-distribution/index.html',
      'dist/services/customs-clearance/index.html',
      'dist/services/domestic-trucking/index.html',
      'dist/services/overseas-agent-network/index.html',
      'dist/privacy-policy/index.html', 'dist/terms/index.html', 'dist/404.html',
    ];
    for (const route of expected) expect(paths, `missing ${route}`).toContain(route);
  });

  it('has exactly one h1', () => {
    for (const p of pages) {
      expect(p.doc.querySelectorAll('h1').length, `${p.path}`).toBe(1);
    }
  });

  it('has a title of 60 characters or fewer', () => {
    for (const p of pages) {
      const title = p.doc.querySelector('title')?.textContent ?? '';
      expect(title.length, `${p.path}: "${title}"`).toBeGreaterThan(0);
      expect(title.length, `${p.path}: "${title}"`).toBeLessThanOrEqual(60);
    }
  });

  it('has a meta description between 50 and 165 characters', () => {
    for (const p of pages) {
      const desc = p.doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
      expect(desc.length, `${p.path}`).toBeGreaterThanOrEqual(50);
      expect(desc.length, `${p.path}`).toBeLessThanOrEqual(165);
    }
  });

  it('has a canonical URL on the apex domain', () => {
    for (const p of pages) {
      const href = p.doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
      expect(href, `${p.path}`).toMatch(/^https:\/\/global-gate\.us/);
      expect(href, `${p.path} has a trailing slash`).not.toMatch(/.\/$/);
    }
  });

  it('gives every image an alt attribute', () => {
    for (const p of pages) {
      for (const img of [...p.doc.querySelectorAll('img')]) {
        expect(img.hasAttribute('alt'), `${p.path}: ${img.getAttribute('src')}`).toBe(true);
      }
    }
  });

  it('contains valid, parseable JSON-LD', () => {
    for (const p of pages) {
      const blocks = [...p.doc.querySelectorAll('script[type="application/ld+json"]')];
      expect(blocks.length, `${p.path}`).toBeGreaterThan(0);
      for (const block of blocks) {
        expect(() => JSON.parse(block.textContent ?? ''), `${p.path}`).not.toThrow();
      }
    }
  });

  it('never emits a null value inside JSON-LD, which Google rejects', () => {
    for (const p of pages) {
      for (const block of [...p.doc.querySelectorAll('script[type="application/ld+json"]')]) {
        expect(block.textContent, `${p.path}`).not.toContain('null');
      }
    }
  });

  it('contains no placeholder text', () => {
    const PLACEHOLDER = /\b(lorem ipsum|TODO|FIXME|coming soon)\b/i;
    for (const p of pages) {
      const text = p.doc.querySelector('body')?.textContent ?? '';
      expect(text, `${p.path}`).not.toMatch(PLACEHOLDER);
    }
  });

  it('never claims round-the-clock availability', () => {
    for (const p of pages) {
      expect(p.doc.querySelector('body')?.textContent ?? '', `${p.path}`).not.toContain('24/7');
    }
  });

  it('shows the current copyright year, not a stale one', () => {
    const year = String(new Date().getFullYear());
    for (const p of pages) {
      const footer = p.doc.querySelector('footer')?.textContent ?? '';
      if (footer.includes('©')) expect(footer, `${p.path}`).toContain(year);
    }
  });

  it('never links to a bare social network homepage', () => {
    for (const p of pages) {
      for (const a of [...p.doc.querySelectorAll('a')]) {
        const href = a.getAttribute('href') ?? '';
        expect(href, `${p.path}`).not.toMatch(/^https:\/\/(www\.)?(facebook|instagram)\.com\/?$/);
      }
    }
  });

  it('sets lang on the html element', () => {
    for (const p of pages) {
      expect(p.doc.querySelector('html')?.getAttribute('lang'), `${p.path}`).toBe('en');
    }
  });

  it('never disables pinch zoom, which fails accessibility', () => {
    for (const p of pages) {
      const viewport = p.doc.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? '';
      expect(viewport, `${p.path}`).not.toContain('maximum-scale=1');
    }
  });
});

describe('content is readable without JavaScript', () => {
  it('renders substantial body text in the static HTML', () => {
    for (const p of pages) {
      if (p.path.includes('404')) continue;
      const text = (p.doc.querySelector('main')?.textContent ?? '').replace(/\s+/g, ' ').trim();
      expect(text.length, `${p.path} has too little static text`).toBeGreaterThan(400);
    }
  });

  it('renders every FAQ answer as static text, not JavaScript-injected', () => {
    const oceanPage = pages.find((p) => p.path.includes('ocean-freight'));
    expect(oceanPage).toBeDefined();
    expect(oceanPage!.doc.body.textContent).toContain('FCL means your cargo occupies an entire container');
  });

  it('exposes the quote form without JavaScript', () => {
    const quote = pages.find((p) => p.path.includes('quote'));
    const form = quote!.doc.querySelector('form#quote-form');
    expect(form?.getAttribute('action')).toBe('/api/quote');
    expect(form?.getAttribute('method')?.toLowerCase()).toBe('post');
  });
});

describe('internal links', () => {
  it('resolve to pages that exist', () => {
    const built = new Set(
      pages.map((p) =>
        p.path.replace(/\\/g, '/').replace(/^dist/, '').replace(/\/index\.html$/, '').replace(/\.html$/, '') || '/'
      )
    );
    for (const p of pages) {
      for (const a of [...p.doc.querySelectorAll('a')]) {
        const href = (a.getAttribute('href') ?? '').split('#')[0].split('?')[0];
        if (!href.startsWith('/') || href.startsWith('/api/')) continue;
        const normalized = href.replace(/\/$/, '') || '/';
        expect(built.has(normalized), `${p.path} links to missing ${href}`).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 4: Run the build test suite**

Run: `npm run test:build`
Expected: PASS. Any failure here is a genuine SEO or accessibility defect in the shipped output — fix the source, never weaken the assertion.

- [ ] **Step 5: Write the end-to-end quote test**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: 'http://localhost:4321' },
});
```

Create `tests/e2e/quote-flow.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('visitor can complete the two-step quote form', async ({ page }) => {
  await page.route('**/api/quote', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  );

  await page.goto('/quote');
  await page.selectOption('#q-mode', 'Ocean LCL');
  await page.fill('#q-origin', 'Ningbo, China');
  await page.fill('#q-destination', 'Chicago, IL');
  await page.fill('#q-cargo', '12 CBM, 3200 kg');
  await page.click('[data-next]');

  await page.fill('#q-name', 'Jane Doe');
  await page.fill('#q-company', 'Doe Imports');
  await page.fill('#q-email', 'jane@doeimports.com');
  await page.fill('#q-phone', '312-555-0100');
  await page.click('button[type="submit"]');

  await expect(page.getByText('Request received')).toBeVisible();
});

test('a delivery failure shows an honest error, never a fake success', async ({ page }) => {
  await page.route('**/api/quote', (route) =>
    route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: false,
        message: 'could not send',
        fallback: { email: 'Op01@global-gate.us', phone: '631-596-5591' },
      }),
    })
  );

  await page.goto('/quote');
  await page.selectOption('#q-mode', 'Air Freight');
  await page.fill('#q-origin', 'Shanghai');
  await page.fill('#q-destination', 'Newark, NJ');
  await page.fill('#q-cargo', '300 kg');
  await page.click('[data-next]');
  await page.fill('#q-name', 'Jane Doe');
  await page.fill('#q-company', 'Doe Imports');
  await page.fill('#q-email', 'jane@doeimports.com');
  await page.fill('#q-phone', '312-555-0100');
  await page.click('button[type="submit"]');

  await expect(page.getByText("We couldn't send that automatically.")).toBeVisible();
  await expect(page.getByText('Request received')).toBeHidden();
});

test('mobile visitors get a tap-to-call bar on every page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/services/ocean-freight', '/contact']) {
    await page.goto(path);
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();
  }
});
```

Add to `package.json` scripts:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 6: Run the end-to-end tests**

Run: `npm run test:e2e`
Expected: PASS, 3 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: add build-output SEO invariants and end-to-end quote flow tests"
```

---

## Task 20: Deploy to Vercel on global-gate.us

**Files:**
- Create: `vercel.json`, `README.md`
- Test: manual verification checklist (this task's deliverable is a live site)

**Interfaces:**
- Consumes: everything above
- Produces: `https://global-gate.us` serving the built site

- [ ] **Step 1: Write `vercel.json`**

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "www.global-gate.us" }],
      "destination": "https://global-gate.us/$1",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/images/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

- [ ] **Step 2: Write `README.md`**

```markdown
# Global Gate Logistics — global-gate.us

Astro static site. Every page ships as real HTML so search engines and AI crawlers
read the content without running JavaScript.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local preview at http://localhost:4321 |
| `npm run build` | Build the site into `dist/` |
| `npm test` | Unit and component tests |
| `npm run test:build` | Build, then verify SEO rules on the real output |
| `npm run test:e2e` | End-to-end browser tests |

## Editing content

- **Company facts** (address, phone, credentials, hours): `src/config/site.ts` — the only
  place these exist. Changing it updates the whole site, including structured data.
- **Services** (copy, FAQs): `src/data/services.ts`
- **Testimonials**: `src/data/testimonials.ts`
- **Hero stats**: `src/data/stats.ts`

## Environment variables (set in Vercel)

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key for quote delivery |
| `QUOTE_FROM_EMAIL` | Verified sender, e.g. website@global-gate.us |
| `QUOTE_TO_EMAIL` | Where quote requests are delivered |

Deploying: push to `main` and Vercel builds and publishes automatically.
```

- [ ] **Step 3: Set up Resend**

1. Create a free account at resend.com.
2. Add and verify the domain `global-gate.us` — Resend supplies DNS records (SPF, DKIM) to add at your registrar. Verification usually completes within an hour.
3. Create an API key and copy it.

- [ ] **Step 4: Push to GitHub and connect Vercel**

```bash
gh repo create global-gate-website --private --source=. --remote=origin
git push -u origin main
```

Then in the Vercel dashboard: **Add New Project** → import `global-gate-website` → Astro is detected automatically → **Deploy**.

- [ ] **Step 5: Add the environment variables in Vercel**

Project → Settings → Environment Variables. Add `RESEND_API_KEY`, `QUOTE_FROM_EMAIL`, and `QUOTE_TO_EMAIL` for Production, Preview, and Development. Redeploy so they take effect.

- [ ] **Step 6: Connect the domain**

Vercel → Settings → Domains → add `global-gate.us` and `www.global-gate.us`. Vercel shows the DNS records to add at your registrar (an A record for the apex, a CNAME for `www`). SSL is issued automatically once DNS resolves.

- [ ] **Step 7: Verify the live site against the launch criteria**

Confirm each item and record the result:

- [ ] `https://global-gate.us` loads with a valid certificate
- [ ] `https://www.global-gate.us` redirects to the apex
- [ ] Disable JavaScript in the browser, reload the homepage and a service page — all text still visible
- [ ] Submit a real test quote; confirm it arrives at `Op01@global-gate.us` within 60 seconds
- [ ] Reply-to on the received email is the address entered in the form
- [ ] On a phone, the sticky bottom bar appears and the call button dials
- [ ] `https://global-gate.us/robots.txt` and `/llms.txt` load
- [ ] `https://global-gate.us/sitemap-index.xml` lists all 13 pages
- [ ] Google Rich Results Test (`search.google.com/test/rich-results`) reports no errors for the homepage and one service page
- [ ] Lighthouse mobile scores ≥ 95 in all four categories
- [ ] No console errors on any page

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: add Vercel config, security headers, and project README"
git push
```

---

## Known deviations from the approved spec

Surfaced rather than silently applied. Each is a judgment call the owner can reverse.

| # | Spec said | Plan does | Why |
|---|---|---|---|
| 1 | Honeypot + timing check + **Cloudflare Turnstile** (§4) | Honeypot only (Task 13) | Turnstile requires a Cloudflare account, and hosting moved to Vercel. A honeypot stops the overwhelming majority of form spam with zero friction for real visitors. Add Turnstile or a timing check if spam actually materializes — it is a contained change to Tasks 13 and 14. |
| 2 | Astro `<Image>` with responsive `srcset` (§4) | Plain `<img>` with pre-optimized WebP (Tasks 7, 8) | The five migrated assets are already WebP and correctly sized. If Lighthouse mobile flags the hero, generate a 960px variant and add `srcset` — Task 7 Step 4 already covers re-encoding. |
| 3 | `WebSite` + **`SearchAction`** schema (§9.1) | `WebSite` only (Task 3) | `SearchAction` declares a site search URL. There is no site search in Phase 1, and pointing Google at a non-existent endpoint is a validation error. Add it if site search is ever built. |
| 4 | Quote failure writes to **Vercel KV** (§8.1) | Honest 502 with a pre-filled phone and email fallback (Task 13) | Vercel KV requires a paid marketplace add-on. The failure path now shows the visitor a real error and a working way to reach you, which fixes defect D1's root cause — a form that lied about succeeding — without a vendor dependency. |
| 5 | Google Analytics 4 (§4) | Deferred to Phase 3 | Spec §13 places GA4 setup in Phase 3 alongside Search Console. No tracking code ships in Phase 1. |
| 6 | Shipment tracking link (§8.4) | Omitted | Spec F13 makes this conditional on a tracking system existing. Add it once confirmed. |

## Phase 1 complete

The site is live, fast, crawlable, and capturing leads. Defects D1–D12 from the spec are all resolved:

| Defect | Resolved by |
|---|---|
| D1 form discards leads | Task 13 — endpoint returns success only on delivery |
| D2 JS-only content | Task 1 — static output; Task 19 verifies it |
| D3 single page | Tasks 15–17 — 13 pages |
| D4 no social proof | Task 9 — trust stack ready for content |
| D5 unverifiable credentials | Tasks 2, 9 — published from config |
| D6 stale copyright | Task 6 — computed year, test-enforced |
| D7 dead social links | Task 6 — null-safe, test-enforced |
| D8 false 24/7 claim | Task 8 — replaced; test-enforced site-wide |
| D9 hidden mobile CTA | Task 5 — sticky call bar |
| D10 generic headline | Task 8 — Option A |
| D11 no agent/broker path | Deferred to Phase 2 (partner pages) |
| D12 CTA/destination mismatch | Tasks 14–15 — real quote form |

**Next:** Phase 2 (blog, trade-lane pages, location pages, partner pages) and Phase 3 (Search Console, Analytics, Google Business Profile) each get their own plan.

