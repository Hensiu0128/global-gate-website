# Shipping, Locations & Partner Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Broaden the homepage's positioning away from "Asia–America" exclusivity, ship a
minimum-viable blog with one priority article, and build the overseas-agent partner page —
then, in Phase 2, the brokers partner page, both trade-lane pages + hub, and both location
pages — closing the conversion-path gap for two of the site's three target audiences and adding
the SEO/GEO content scoped in the handoff but never built.

**Architecture:** Every new content type (trade lanes, locations, partner audiences, blog posts)
mirrors the existing `services` implementation: a typed data array (or, for blog, an Astro
Content Collection) feeds a `getStaticPaths()`-driven `[slug].astro` route through a shared
layout, reusing `BaseLayout`, `FAQAccordion`, `Breadcrumbs`, `CTABand`, `TrustBar`, and
`src/lib/schema.ts` exactly as the 6 service pages already do. No new UI components; only new
data, layouts, and pages that assemble existing pieces.

**Tech Stack:** Astro 7 (static output, Vercel adapter), Tailwind 4, Vitest (unit + component +
build-output tests), Astro Content Collections (new to this codebase — plain Markdown, no MDX).

**Spec:** [docs/superpowers/specs/2026-09-11-shipping-locations-partners-design.md](../specs/2026-09-11-shipping-locations-partners-design.md)

## Global Constraints

- **Guarantee 1** (CLAUDE.md): every page must be fully readable with JavaScript disabled. No
  new page's *content* may require JS to appear.
- **Guarantee 3**: no invented business facts. Every claim in new copy traces to
  `src/config/site.ts`/`src/data/services.ts` (already published) or to generic, public,
  industry-standard knowledge (CBP timelines, ISF deadlines, chargeable-weight formulas) — never
  a new claim about this company's own history, volume, or performance.
- **Guarantee 4**: every company fact comes from `src/config/site.ts`. Never hardcode an address,
  phone, or credential in a new page.
- **Guarantee 6**: never write "24/7" anywhere.
- Never write "Asia–America" as an exclusive specialization in new or edited copy — the owner
  confirmed the business serves other origins/destinations too (spec §0.1).
- No new npm dependency — Content Collections, Markdown rendering, and all UI needs are already
  available in Astro 7 without `@astrojs/mdx` or `@tailwindcss/typography`.
- Test-first throughout: write the failing test, run it, watch it fail for the right reason,
  implement, run it again, confirm it passes, then commit.
- Run `npm test` after every task. Run `npm run test:build` and `npm run test:e2e` only at the
  two phase-end verification tasks (Task 8, Task 14) — they require a fresh production build and
  will report false failures on links to pages later tasks haven't built yet.
- Portable Node.js lives at `$env:LOCALAPPDATA\node-portable\node-v24.19.0-win-x64` and is on the
  user's persisted PATH; every command below assumes `node`/`npm` resolve.

---

## Task 1: WCA membership credential

**Files:**
- Modify: `src/config/site.ts`
- Test: `tests/unit/site-config.test.ts`

**Interfaces:**
- Produces: `SITE.credentials.wcaMember: boolean` — consumed by Task 2 (Hero badge, About bullet).

- [ ] **Step 1: Write the failing test**

Add to `tests/unit/site-config.test.ts` (find the existing `describe('credentials'`-style block
or add a new one near the other credential checks):

```ts
describe('wcaMember', () => {
  it('is a confirmed boolean fact, not a placeholder', () => {
    expect(typeof SITE.credentials.wcaMember).toBe('boolean');
  });

  it('is true — the owner confirmed WCA membership on 2026-09-11', () => {
    expect(SITE.credentials.wcaMember).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/site-config.test.ts`
Expected: FAIL — `Property 'wcaMember' does not exist on type 'Credentials'` (TypeScript) or
`undefined` at runtime.

- [ ] **Step 3: Implement**

In `src/config/site.ts`, add to the `Credentials` interface:

```ts
export interface Credentials {
  fmcNumber: string | null;   // spec F1
  iataNumber: string | null;  // spec F2
  ctpatCertified: boolean;    // spec F3
  nvocc: boolean;
  wcaMember: boolean;         // confirmed by owner 2026-09-11 — WCA (World Cargo Alliance)
}
```

And to the `SITE.credentials` object literal:

```ts
credentials: {
  fmcNumber: null,
  iataNumber: null,
  ctpatCertified: true,
  nvocc: true,
  wcaMember: true,
},
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/site-config.test.ts`
Expected: PASS, and the full `npm test` still shows 212+ passing (no regressions from the new
field — the recursive placeholder/"24/7" string scan in this file only walks string values, so
a new boolean field is invisible to it).

- [ ] **Step 5: Commit**

```bash
git add src/config/site.ts tests/unit/site-config.test.ts
git commit -m "feat: add confirmed WCA membership credential"
```

---

## Task 2: Broaden homepage positioning copy

**Files:**
- Modify: `src/components/home/Hero.astro`
- Modify: `src/components/home/WhyUs.astro`
- Modify: `src/components/home/About.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/config/site.ts` (the `description` field only)
- Test: `tests/components/hero.test.ts`
- Test: `tests/components/homepage.test.ts`

**Interfaces:**
- Consumes: `SITE.credentials.wcaMember` from Task 1.
- Produces: no new exports; this task only changes copy inside existing components.

- [ ] **Step 1: Update the two tests that hardcode the old copy, and watch them fail**

In `tests/components/hero.test.ts`, replace:

```ts
  it('leads with the route-specific headline, not a generic platitude', async () => {
    const html = await render();
    expect(html).toContain('ASIA TO AMERICA');
    expect(html).toContain('DOOR TO DOOR');
    expect(html).not.toContain('YOU CAN TRUST');
  });
```

with:

```ts
  it('leads with a specific, lane-agnostic headline, not a generic platitude', async () => {
    const html = await render();
    expect(html).toContain('IMPORT. EXPORT.');
    expect(html).toContain('DOOR TO DOOR');
    expect(html).not.toContain('YOU CAN TRUST');
    expect(html).not.toContain('ASIA TO AMERICA');
  });

  it('names the WCA membership in the credentials badge', async () => {
    const html = await render();
    expect(html).toContain('WCA Member');
  });
```

In `tests/components/homepage.test.ts`, replace:

```ts
  it('contains the full company description as crawlable text', async () => {
    const html = await render();
    expect(html).toContain('NVOCC');
    expect(html).toContain('Asia');
  });
```

with:

```ts
  it('contains the full company description as crawlable text', async () => {
    const html = await render();
    expect(html).toContain('NVOCC');
    expect(html).toContain('any origin');
  });
```

Run: `npm test -- tests/components/hero.test.ts tests/components/homepage.test.ts`
Expected: FAIL — `IMPORT. EXPORT.` and `WCA Member` not found; `any origin` not found in
homepage meta description.

- [ ] **Step 2: Rewrite `src/components/home/Hero.astro`**

Replace the badge-building script and the H1 block. Current script block:

```astro
const primary = SITE.phones[0];
const badgeText = SITE.credentials.fmcNumber
  ? `NVOCC & IATA Member · FMC ${SITE.credentials.fmcNumber}`
  : 'NVOCC & IATA Member';
```

New:

```astro
const primary = SITE.phones[0];
const badgeParts = ['NVOCC & IATA Member'];
if (SITE.credentials.wcaMember) badgeParts.push('WCA Member');
if (SITE.credentials.fmcNumber) badgeParts.push(`FMC ${SITE.credentials.fmcNumber}`);
const badgeText = badgeParts.join(' · ');
```

Current H1:

```astro
    <h1 class="text-white mb-6">
      ASIA TO AMERICA,<br />
      <span class="text-amber-400">DOOR TO DOOR.</span>
    </h1>
```

New:

```astro
    <h1 class="text-white mb-6">
      IMPORT. EXPORT.<br />
      <span class="text-amber-400">DOOR TO DOOR.</span>
    </h1>
```

The subheading paragraph below it is unchanged — it already lists concrete services rather than
naming a region.

- [ ] **Step 3: Rewrite `src/components/home/WhyUs.astro`**

Replace the entire `reasons` array:

```astro
const reasons = [
  {
    title: 'Speed as a system',
    body: 'Rates back in 24 hours — because nothing is subcontracted, there’s no vendor’s vendor to wait on.',
  },
  {
    title: 'One roof, one contact',
    body: 'Ocean, air, customs, warehousing, and domestic trucking handled by one team, so nothing is lost between vendors.',
  },
  {
    title: 'Verifiable, not claimed',
    body: 'NVOCC, IATA, C-TPAT, and WCA status — credentials an importer or an AI search engine can actually check, not just marketing copy.',
  },
  {
    title: 'Execution over lane',
    body: 'Full container load and air freight, any origin or destination. As a customer’s sourcing shifts, the expertise travels with it.',
  },
];
```

- [ ] **Step 4: Rewrite the bullet list in `src/components/home/About.astro`**

Replace:

```astro
const points = [
  'Trusted by major shipping carriers and airlines',
  'Specialized in Asia–America cargo routing',
  'Worldwide connections to overseas cargo agents',
  'Personalized service for every client',
];
```

with:

```astro
const points = [
  'Trusted by major shipping carriers and airlines',
  'WCA member with a worldwide network of overseas cargo agents',
  'Full container load and air freight, any origin or destination',
  'Personalized service for every client',
];
```

The main body paragraph in this file already reads "regardless of origin or destination" — leave
it as-is.

- [ ] **Step 5: Reword the two description strings**

In `src/config/site.ts`, replace:

```ts
description:
  'Global Gate Logistics is a US international freight forwarder and NVOCC specializing in Asia–America cargo. Ocean FCL & LCL, air freight, customs clearance, JFK warehousing, and nationwide trucking handled in-house.',
```

with:

```ts
description:
  'Global Gate Logistics is a US international freight forwarder and NVOCC moving full container load and air cargo for any origin or destination. Ocean FCL & LCL, air freight, customs clearance, JFK warehousing, and nationwide trucking handled in-house.',
```

In `src/pages/index.astro`, replace:

```ts
const description =
  'International freight forwarder and NVOCC specializing in Asia–America cargo: ocean FCL & LCL, air freight, customs clearance, JFK warehousing, and trucking.';
```

with:

```ts
const description =
  'International freight forwarder and NVOCC handling ocean FCL & LCL, air freight, customs clearance, JFK warehousing, and nationwide trucking — any origin, any destination.';
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 212+ tests (the two updated tests now pass; no other test references the old
copy — confirmed by grepping `tests/` for `Asia`, `specialist`, and `ASIA TO AMERICA` beforehand).

- [ ] **Step 7: Manual check — JS disabled**

With the dev server running (`http://localhost:4321`), disable JavaScript in the browser and
reload the homepage. Confirm the new headline, Why-Us reasons, and About bullets all render
identically to the JS-enabled view (they're static Astro output, so this should require no
fix — but per CLAUDE.md, verify rather than assume).

- [ ] **Step 8: Commit**

```bash
git add src/components/home/Hero.astro src/components/home/WhyUs.astro src/components/home/About.astro src/pages/index.astro src/config/site.ts tests/components/hero.test.ts tests/components/homepage.test.ts
git commit -m "feat: broaden homepage positioning beyond Asia-America, add WCA to badge"
```

---

## Task 3: Cross-link mechanism on service pages

**Files:**
- Modify: `src/data/services.ts`
- Modify: `src/layouts/ServiceLayout.astro`
- Test: `tests/components/service-pages.test.ts`

**Interfaces:**
- Produces: `Service.crossLinks?: { text: string; href: string }[]` — an optional field any
  service entry can carry. Rendered by `ServiceLayout.astro` when present. Consumed in Task 4
  (`overseas-agent-network` → `/partners/agents`) and Task 12 (`domestic-trucking` +
  `warehousing-distribution` → `/partners/brokers`).

- [ ] **Step 1: Write the failing test**

Add to `tests/components/service-pages.test.ts`, inside the existing `describe.each` block (after
the "links back to the services hub via breadcrumbs" test):

```ts
  it('renders any cross-links as real anchors with their link text', async () => {
    const service = SERVICES.find((s) => s.slug === slug)!;
    if (!service.crossLinks || service.crossLinks.length === 0) return;
    const html = await renderDetail(slug);
    for (const link of service.crossLinks) {
      expect(html).toContain(`href="${link.href}"`);
      expect(html).toContain(link.text);
    }
  });
```

- [ ] **Step 2: Run test to verify it's a no-op today**

Run: `npm test -- tests/components/service-pages.test.ts`
Expected: PASS (every service's `crossLinks` is `undefined`, so the test body returns early for
all six — this confirms the test doesn't accidentally fail before the field exists; it becomes a
real assertion once Task 4 populates one entry).

- [ ] **Step 3: Add the field and render it**

In `src/data/services.ts`, add to the `Service` interface:

```ts
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
  crossLinks?: { text: string; href: string }[];
}
```

In `src/layouts/ServiceLayout.astro`, add a conditional block after the bullets `</section>` and
before `<CTABand ...>`:

```astro
  {service.crossLinks && service.crossLinks.length > 0 && (
    <section class="bg-slate-50 py-10">
      <div class="container-gg max-w-3xl">
        <ul class="flex flex-wrap gap-6">
          {service.crossLinks.map((link) => (
            <li>
              <a href={link.href} class="inline-flex items-center gap-2 text-amber-600 hover:text-amber-500 font-semibold">
                {link.text} <span aria-hidden="true">&rarr;</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )}
```

- [ ] **Step 4: Run tests to verify still passing**

Run: `npm test`
Expected: PASS, no regressions (the new field is optional and unused by any entry yet).

- [ ] **Step 5: Commit**

```bash
git add src/data/services.ts src/layouts/ServiceLayout.astro tests/components/service-pages.test.ts
git commit -m "feat: add optional cross-link block to service pages"
```

---

## Task 4: Partner audience data model + `/partners/agents`

**Files:**
- Create: `src/data/partners-audience.ts`
- Create: `src/layouts/PartnerLayout.astro`
- Create: `src/pages/partners/[slug].astro`
- Modify: `src/data/services.ts` (populate `overseas-agent-network`'s `crossLinks`)
- Test: `tests/components/partners-pages.test.ts`

**Interfaces:**
- Consumes: `FAQ` type from `src/data/services.ts`; `serviceSchema`, `faqSchema`,
  `breadcrumbSchema` from `src/lib/schema.ts`; `canonicalUrl` from `src/lib/seo.ts`;
  `Service.crossLinks` from Task 3.
- Produces: `PartnerAudience` interface, `PARTNER_AUDIENCES: PartnerAudience[]`,
  `getPartnerAudience(slug): PartnerAudience | undefined` — consumed by Task 12 (adds the
  `brokers` entry to the same array).

- [ ] **Step 1: Write the failing test**

Create `tests/components/partners-pages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PartnerDetail from '../../src/pages/partners/[slug].astro';
import { PARTNER_AUDIENCES } from '../../src/data/partners-audience';

async function renderDetail(slug: string) {
  const partner = PARTNER_AUDIENCES.find((p) => p.slug === slug)!;
  const container = await AstroContainer.create();
  return container.renderToString(PartnerDetail, {
    props: { partner },
    params: { slug },
  });
}

function stripJsonLd(html: string): string {
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
}

describe.each(PARTNER_AUDIENCES.map((p) => [p.slug, p.name]))('Partner page: %s', (slug, name) => {
  it('renders exactly one h1 containing the audience name', async () => {
    const html = await renderDetail(slug);
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
    expect(html).toContain(name);
  });

  it('emits Service and FAQPage JSON-LD', async () => {
    const html = await renderDetail(slug);
    expect(html).toContain('"@type":"Service"');
    expect(html).toContain('"@type":"FAQPage"');
  });

  it('renders every FAQ answer as crawlable text, not hidden behind JavaScript', async () => {
    const partner = PARTNER_AUDIENCES.find((p) => p.slug === slug)!;
    const html = await renderDetail(slug);
    const bodyHtml = stripJsonLd(html);
    for (const faq of partner.faqs) {
      expect(bodyHtml).toContain(faq.question);
      expect(bodyHtml).toContain(faq.answer);
    }
    expect(html).not.toMatch(/<details[^>]*\sopen[\s>]/);
  });

  it('offers a conversion path via the existing quote form', async () => {
    const html = await renderDetail(slug);
    expect(html).toContain('href="/quote"');
  });

  it('links back home via breadcrumbs', async () => {
    const html = await renderDetail(slug);
    expect(html).toContain('href="/"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/partners-pages.test.ts`
Expected: FAIL — cannot find module `src/pages/partners/[slug].astro` or
`src/data/partners-audience.ts`.

- [ ] **Step 3: Create `src/data/partners-audience.ts`**

```ts
import type { FAQ } from './services';

export interface PartnerAudience {
  slug: string;
  name: string;
  tagline: string;
  heroCopy: string;
  bullets: string[];
  faqs: FAQ[];
  metaTitle: string;
  metaDescription: string;
}

export const PARTNER_AUDIENCES: PartnerAudience[] = [
  {
    slug: 'agents',
    name: 'Overseas Agent Partnership',
    tagline: 'For Freight Forwarders & Cargo Agents Abroad',
    heroCopy:
      'Global Gate Logistics is a US destination partner for overseas freight forwarders and cargo agents. One team handles ocean, air, customs, warehousing, and final delivery on your behalf — instead of your client\'s cargo passing through four separate US vendors.',
    bullets: [
      'WCA member — an independent, verifiable network credential',
      'Licensed NVOCC and IATA member, quoting from direct carrier contracts',
      'C-TPAT certified customs operations, filed in-house',
      'Rate requests answered within 24 business hours',
      'Warehousing and drayage minutes from JFK and the Port of NY/NJ',
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
        question: 'Are you a member of any forwarder network?',
        answer:
          'Yes — Global Gate Logistics is a member of WCA (World Cargo Alliance), in addition to handling agent-routed cargo directly through existing partner relationships.',
      },
      {
        question: 'How do overseas agents request rates?',
        answer:
          'Agents can email the operations team directly or submit the quote form on this website. Rate requests are answered within 24 business hours.',
      },
    ],
    metaTitle: 'Overseas Agent Partnership — US Destination Partner',
    metaDescription:
      'A US destination partner for overseas freight forwarders: in-house ocean, air, customs, and warehousing, WCA membership, and 24-hour rate turnaround.',
  },
];

export function getPartnerAudience(slug: string): PartnerAudience | undefined {
  return PARTNER_AUDIENCES.find((p) => p.slug === slug);
}
```

- [ ] **Step 4: Create `src/layouts/PartnerLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import Breadcrumbs from '../components/seo/Breadcrumbs.astro';
import FAQAccordion from '../components/ui/FAQAccordion.astro';
import CTABand from '../components/ui/CTABand.astro';
import TrustBar from '../components/trust/TrustBar.astro';
import { serviceSchema, faqSchema } from '../lib/schema';
import { canonicalUrl } from '../lib/seo';
import type { PartnerAudience } from '../data/partners-audience';

interface Props { partner: PartnerAudience; }
const { partner } = Astro.props;

const pathname = `/partners/${partner.slug}`;
const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: partner.name, href: pathname },
];

const schemas = [
  serviceSchema({
    name: partner.name,
    description: partner.metaDescription,
    url: canonicalUrl(pathname),
  }),
  faqSchema(partner.faqs),
];
---
<BaseLayout
  title={partner.metaTitle}
  description={partner.metaDescription}
  {pathname}
  {breadcrumbs}
  {schemas}
>
  <div class="bg-navy-900">
    <Breadcrumbs trail={breadcrumbs} />
    <div class="container-gg pb-14 pt-4 max-w-3xl">
      <p class="text-amber-400 text-xs font-bold tracking-widest uppercase mb-4">{partner.tagline}</p>
      <h1 class="text-white mb-6" style="font-size:clamp(2.25rem,5.5vw,3.75rem)">{partner.name}</h1>
      <p class="text-slate-300 text-lg leading-relaxed">{partner.heroCopy}</p>
    </div>
  </div>
  <TrustBar />

  <section class="bg-white py-16 md:py-20">
    <div class="container-gg max-w-3xl">
      <h2 class="font-display text-navy-900 text-3xl md:text-4xl font-bold mb-8">What you get</h2>
      <ul class="space-y-4">
        {partner.bullets.map((bullet) => (
          <li class="flex gap-3 text-slate-600 text-base md:text-lg leading-relaxed">
            <span class="text-amber-500 shrink-0 mt-1" aria-hidden="true">&#10003;</span>
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  </section>

  <CTABand heading="Ready to route a shipment to us?" />
  <FAQAccordion faqs={partner.faqs} heading={`${partner.name}: common questions`} />
</BaseLayout>
```

- [ ] **Step 5: Create `src/pages/partners/[slug].astro`**

```astro
---
import PartnerLayout from '../../layouts/PartnerLayout.astro';
import { PARTNER_AUDIENCES } from '../../data/partners-audience';
import type { PartnerAudience } from '../../data/partners-audience';

export function getStaticPaths() {
  return PARTNER_AUDIENCES.map((partner) => ({
    params: { slug: partner.slug },
    props: { partner },
  }));
}

interface Props { partner: PartnerAudience; }
const { partner } = Astro.props;
---
<PartnerLayout {partner} />
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- tests/components/partners-pages.test.ts`
Expected: PASS for the `agents` entry.

- [ ] **Step 7: Populate the cross-link from `overseas-agent-network`**

In `src/data/services.ts`, find the `overseas-agent-network` entry and add, after `image: null,`:

```ts
    crossLinks: [{ text: 'Read our overseas agent partnership page', href: '/partners/agents' }],
```

- [ ] **Step 8: Run full test suite**

Run: `npm test`
Expected: PASS — the cross-link test written in Task 3 now exercises a real link (no longer an
early-return no-op) and passes.

- [ ] **Step 9: Commit**

```bash
git add src/data/partners-audience.ts src/layouts/PartnerLayout.astro src/pages/partners/[slug].astro src/data/services.ts tests/components/partners-pages.test.ts
git commit -m "feat: add overseas-agent partner page"
```

---

## Task 5: Minimum blog plumbing

**Files:**
- Create: `src/content.config.ts`
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`
- Modify: `src/lib/schema.ts` (add `articleSchema`)
- Modify: `src/styles/global.css` (add minimal `.prose-gg` article typography)
- Modify: `src/config/site.ts` (add "Blog" to `NAV_LINKS`)
- Test: `tests/unit/schema.test.ts`
- Test: `tests/components/blog-pages.test.ts`

**Interfaces:**
- Produces: `articleSchema(input: { title: string; description: string; url: string; pubDate: Date; dateModified: Date }): object` in `src/lib/schema.ts` — consumed by `src/pages/blog/[slug].astro` and, later, sub-project B's remaining articles.
- Produces: the `blog` content collection (id = filename without extension, `data` per the Zod
  schema below) — consumed by Task 6's article.

This task has no real content yet (no articles exist), so its tests use a temporary fixture post
that Task 6 will replace with the real one — this keeps the plumbing testable in isolation.

- [ ] **Step 1: Write the failing schema test**

Add to `tests/unit/schema.test.ts`:

```ts
import { articleSchema } from '../../src/lib/schema';
```

(add to the existing import block from `'../../src/lib/schema'` rather than a second import
statement)

```ts
describe('articleSchema', () => {
  it('is a valid schema.org Article with both dates', () => {
    const s = articleSchema({
      title: 'Test Article',
      description: 'A test description.',
      url: 'https://global-gate.us/blog/test-article',
      pubDate: new Date('2026-09-01'),
      dateModified: new Date('2026-09-05'),
    }) as Record<string, any>;
    expect(s['@type']).toBe('Article');
    expect(s.headline).toBe('Test Article');
    expect(s.datePublished).toBe('2026-09-01T00:00:00.000Z');
    expect(s.dateModified).toBe('2026-09-05T00:00:00.000Z');
    expect(s.author.name).toBe('Global Gate Logistics');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/schema.test.ts`
Expected: FAIL — `articleSchema` is not exported.

- [ ] **Step 3: Implement `articleSchema` in `src/lib/schema.ts`**

Add after `serviceSchema`:

```ts
export function articleSchema(input: {
  title: string;
  description: string;
  url: string;
  pubDate: Date;
  dateModified: Date;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: input.url,
    datePublished: input.pubDate.toISOString(),
    dateModified: input.dateModified.toISOString(),
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Create the content collection config**

Create `src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    dateModified: z.coerce.date(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
});

export const collections = { blog };
```

- [ ] **Step 6: Create a temporary fixture post so plumbing is testable before real content exists**

Create `src/content/blog/fixture-post.md`:

```md
---
title: "Fixture Post"
description: "Temporary fixture used to test blog plumbing before real content exists."
pubDate: 2026-09-11
dateModified: 2026-09-11
metaTitle: "Fixture Post"
metaDescription: "Temporary fixture used to test blog plumbing."
faqs:
  - question: "Is this a real post?"
    answer: "No — this is a temporary fixture, replaced by real content in Task 6."
---

This is temporary fixture content for testing the blog collection, index, and slug route before
the real priority article exists.
```

- [ ] **Step 7: Add minimal article typography**

Append to `src/styles/global.css`:

```css
.prose-gg h2 { font-weight: 700; color: #0A1628; font-size: 1.5rem; margin: 2.5rem 0 1rem; }
.prose-gg h3 { font-weight: 700; color: #0A1628; font-size: 1.25rem; margin: 2rem 0 0.75rem; }
.prose-gg p { color: #475569; line-height: 1.75; margin-bottom: 1.25rem; }
.prose-gg table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.95rem; }
.prose-gg th, .prose-gg td { text-align: left; padding: 0.6rem 0.8rem; border-bottom: 1px solid #e2e8f0; }
.prose-gg th { color: #0A1628; font-weight: 700; }
.prose-gg ul { margin: 0 0 1.25rem 1.25rem; list-style: disc; color: #475569; }
.prose-gg li { margin-bottom: 0.4rem; }
```

- [ ] **Step 8: Create `src/pages/blog/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumbs from '../../components/seo/Breadcrumbs.astro';
import FAQAccordion from '../../components/ui/FAQAccordion.astro';
import CTABand from '../../components/ui/CTABand.astro';
import TrustBar from '../../components/trust/TrustBar.astro';
import { articleSchema, faqSchema } from '../../lib/schema';
import { canonicalUrl } from '../../lib/seo';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);

const pathname = `/blog/${post.id}`;
const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: post.data.title, href: pathname },
];

const schemas = [
  articleSchema({
    title: post.data.title,
    description: post.data.description,
    url: canonicalUrl(pathname),
    pubDate: post.data.pubDate,
    dateModified: post.data.dateModified,
  }),
  faqSchema(post.data.faqs),
];
---
<BaseLayout
  title={post.data.metaTitle}
  description={post.data.metaDescription}
  {pathname}
  {breadcrumbs}
  {schemas}
>
  <div class="bg-navy-900">
    <Breadcrumbs trail={breadcrumbs} />
    <div class="container-gg pb-14 pt-4 max-w-3xl">
      <h1 class="text-white mb-4" style="font-size:clamp(2.25rem,5.5vw,3.75rem)">{post.data.title}</h1>
      <p class="text-slate-300 text-lg leading-relaxed">{post.data.description}</p>
    </div>
  </div>
  <TrustBar />
  <article class="bg-white py-16 md:py-20">
    <div class="container-gg max-w-3xl prose-gg">
      <Content />
    </div>
  </article>
  <CTABand heading="Have a shipment to route?" />
  <FAQAccordion faqs={post.data.faqs} heading="Common questions" />
</BaseLayout>
```

- [ ] **Step 9: Create `src/pages/blog/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumbs from '../../components/seo/Breadcrumbs.astro';
import TrustBar from '../../components/trust/TrustBar.astro';
import CTABand from '../../components/ui/CTABand.astro';

const posts = (await getCollection('blog')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);

const breadcrumbs = [{ name: 'Home', href: '/' }, { name: 'Blog', href: '/blog' }];
const description =
  'Answers to real questions about ocean and air freight, customs clearance, and choosing a US freight forwarding partner.';
---
<BaseLayout title="Freight Forwarding Blog" {description} pathname="/blog" {breadcrumbs}>
  <div class="bg-navy-900">
    <Breadcrumbs trail={breadcrumbs} />
    <div class="container-gg pb-12 pt-4">
      <h1 class="text-white mb-4" style="font-size:clamp(2.25rem,5.5vw,3.75rem)">Blog</h1>
      <p class="text-slate-300 max-w-2xl">{description}</p>
    </div>
  </div>
  <TrustBar />
  <div class="container-gg py-16">
    <ul class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <li class="bg-white border border-slate-100 rounded-xl p-6 hover:border-amber-400 transition-colors">
          <a href={`/blog/${post.id}`} class="block">
            <span class="font-display text-navy-900 font-bold text-lg block mb-2">{post.data.title}</span>
            <span class="text-slate-500 text-sm">{post.data.description}</span>
          </a>
        </li>
      ))}
    </ul>
  </div>
  <CTABand />
</BaseLayout>
```

- [ ] **Step 10: Add "Blog" to primary nav**

In `src/config/site.ts`, replace:

```ts
export const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;
```

with:

```ts
export const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;
```

- [ ] **Step 11: Write the failing component test using the fixture post**

Create `tests/components/blog-pages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getCollection, render } from 'astro:content';
import BlogPost from '../../src/pages/blog/[slug].astro';
import BlogIndex from '../../src/pages/blog/index.astro';

async function renderPost(slug: string) {
  const posts = await getCollection('blog');
  const post = posts.find((p) => p.id === slug)!;
  const container = await AstroContainer.create();
  return container.renderToString(BlogPost, {
    props: { post },
    params: { slug },
  });
}

function stripJsonLd(html: string): string {
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
}

describe('Blog index', () => {
  it('lists every published post by title', async () => {
    const posts = await getCollection('blog');
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlogIndex);
    for (const post of posts) {
      expect(html).toContain(post.data.title);
      expect(html).toContain(`/blog/${post.id}`);
    }
  });
});

describe('Blog post: fixture-post', () => {
  it('renders exactly one h1 with the post title', async () => {
    const html = await renderPost('fixture-post');
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
    expect(html).toContain('Fixture Post');
  });

  it('emits Article JSON-LD with dateModified', async () => {
    const html = await renderPost('fixture-post');
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain('"dateModified"');
  });

  it('renders the article body as crawlable text', async () => {
    const html = await renderPost('fixture-post');
    const body = stripJsonLd(html);
    expect(body).toContain('temporary fixture content');
  });

  it('renders every FAQ answer as crawlable text, not hidden behind JavaScript', async () => {
    const posts = await getCollection('blog');
    const post = posts.find((p) => p.id === 'fixture-post')!;
    const html = await renderPost('fixture-post');
    const body = stripJsonLd(html);
    for (const faq of post.data.faqs) {
      expect(body).toContain(faq.question);
      expect(body).toContain(faq.answer);
    }
    expect(html).not.toMatch(/<details[^>]*\sopen[\s>]/);
  });
});
```

- [ ] **Step 12: Run test to verify it fails first, then implement, then pass**

Run: `npm test -- tests/components/blog-pages.test.ts`
Expected: this should actually PASS immediately, since Steps 3–9 already implemented the
plumbing before this test was written — that's fine for a scaffolding task where the test is
verifying prior steps rather than driving new code; the important discipline (write test before
the *content* task, Task 6) still applies there. Confirm PASS.

Run: `npm test`
Expected: PASS, 214+ tests overall (no regressions to `header.test.ts` from the new nav entry —
it only asserts the pre-existing three hrefs are present via `toContain`, not that they're the
only ones).

- [ ] **Step 13: Commit**

```bash
git add src/content.config.ts src/content/blog/fixture-post.md src/pages/blog/index.astro src/pages/blog/[slug].astro src/lib/schema.ts src/styles/global.css src/config/site.ts tests/unit/schema.test.ts tests/components/blog-pages.test.ts
git commit -m "feat: add minimum blog plumbing (content collection, index, post route)"
```

---

## Task 6: Priority article — "How to Choose a US Freight Forwarding Partner"

**Files:**
- Create: `src/content/blog/choosing-a-us-freight-forwarding-partner.md`
- Delete: `src/content/blog/fixture-post.md`
- Modify: `tests/components/blog-pages.test.ts` (point tests at the real slug)
- Modify: `src/data/partners-audience.ts` (agents entry gets a cross-link to this article)
- Modify: `src/layouts/PartnerLayout.astro` (render the same `crossLinks` pattern as services)

**Interfaces:**
- Consumes: the blog plumbing from Task 5.
- Produces: nothing new — this is a content task with no new exports.

- [ ] **Step 1: Update the test to target the real slug and remove the fixture**

Replace every `'fixture-post'` in `tests/components/blog-pages.test.ts` with
`'choosing-a-us-freight-forwarding-partner'`, and replace the two content-specific assertions:

```ts
    expect(html).toContain('Fixture Post');
```
→
```ts
    expect(html).toContain('How to Choose a US Freight Forwarding Partner');
```

```ts
    expect(body).toContain('temporary fixture content');
```
→
```ts
    expect(body).toContain('licensing status, in-house service scope, and quote turnaround time');
```

Delete `src/content/blog/fixture-post.md`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/blog-pages.test.ts`
Expected: FAIL — no collection entry with id `choosing-a-us-freight-forwarding-partner`.

- [ ] **Step 3: Write the article**

Create `src/content/blog/choosing-a-us-freight-forwarding-partner.md`:

```md
---
title: "How to Choose a US Freight Forwarding Partner"
description: "What an overseas agent should check before routing cargo to a US destination partner: licensing, in-house scope, network membership, and response time."
pubDate: 2026-09-11
dateModified: 2026-09-11
metaTitle: "How to Choose a US Freight Forwarding Partner"
metaDescription: "A checklist for overseas agents evaluating a US freight forwarding partner: FMC/NVOCC licensing, in-house service scope, network membership, and quote turnaround."
faqs:
  - question: "What is an NVOCC, and does my US partner need to be one?"
    answer: "An NVOCC (non-vessel operating common carrier) is a company that issues its own bills of lading and holds ocean freight contracts directly with carriers, without owning vessels. A US partner that is a licensed NVOCC can quote from its own carrier contracts rather than reselling another forwarder's rates, which usually means faster, more transparent pricing for agent-routed cargo."
  - question: "How do I verify a US freight forwarder's FMC license?"
    answer: "Every company acting as an NVOCC or ocean transportation intermediary in the United States must hold a license from the Federal Maritime Commission (FMC), and the FMC publishes a public licensee database. Ask for the license number directly and confirm it independently rather than accepting the claim as written on a website."
  - question: "What does a forwarder network membership like WCA tell me?"
    answer: "Networks such as WCA (World Cargo Alliance) or JCtrans vet members financially and require a credit reference check before granting membership, so a listed member has already cleared a baseline of scrutiny. It is not a substitute for checking a partner's license directly, but it is a useful second signal."
  - question: "How fast should a US destination partner respond to a rate request?"
    answer: "A same-day or next-business-day response is the standard an agent should expect for a routine rate request. A partner that routinely takes more than 24 hours to quote will struggle to compete for time-sensitive cargo, regardless of what its website claims."
---

A US freight forwarding partner should be evaluated on three checkable facts — licensing
status, in-house service scope, and quote turnaround time — not on marketing language alone.
For an overseas agent choosing a US destination partner, getting this wrong means a shipment
that stalls after it lands, not before.

## Start with the license, not the pitch

Any company acting as a non-vessel operating common carrier (NVOCC) in the United States must
hold a license from the Federal Maritime Commission (FMC), and the FMC publishes a public
licensee database that anyone can search. This turns "we are a licensed NVOCC" from a claim
into a fact an agent can confirm in under five minutes, before a single container moves.

The same logic applies to air cargo: a US partner handling air freight as an IATA member has
gone through IATA's own accreditation process, which includes financial standing checks. Ask
for both the FMC number and the IATA code directly, and treat a partner that can't produce
either on request as a bigger risk than the rate sheet suggests.

## In-house service scope determines how many things can go wrong

Every handoff between subcontracted vendors is a point where a shipment can be delayed,
mishandled, or lost track of. A US partner that owns ocean and air booking, customs clearance,
warehousing, and final-mile trucking under one roof has fewer of those handoff points than one
that brokers out customs to one company and trucking to another.

This matters most at the exact moment an agent has the least visibility: after cargo arrives
at a US port or airport. A single team that files the customs entry, receives the cargo into
its own warehouse, and dispatches the truck can answer a status question immediately. A chain
of three subcontracted vendors usually can't — each one only knows its own leg.

| What to ask | Why it matters |
|---|---|
| "Do you file customs entries in-house, or subcontract them?" | A subcontracted broker adds a handoff and a second point of contact for every entry. |
| "Is the warehouse your own facility, or a third-party's?" | Determines who is actually accountable if cargo is damaged or misplaced in storage. |
| "Who dispatches final-mile trucking?" | A separate trucking vendor means a third company in the chain before delivery. |

## Network membership is a fast, imperfect signal

Forwarder network memberships such as WCA (World Cargo Alliance) or JCtrans are one of the
fastest ways an agent can screen a potential US partner, because membership requires financial
vetting and a credit reference check before approval. Global Gate Logistics holds WCA
membership for exactly this reason — it gives an overseas agent a second, independent point of
verification beyond the FMC license.

Network membership is not a substitute for checking the license directly. It's a screening
tool, not a guarantee — treat it as one input alongside the FMC/IATA checks above, not a
replacement for them.

## Response time is the signal that shows up before the first shipment

A US partner that takes more than 24 hours to answer a routine rate request will be too slow
for time-sensitive cargo, and the same responsiveness — or lack of it — tends to repeat once a
real shipment is moving and something needs an answer quickly. Testing this before committing
to a partner costs nothing: send a realistic rate request and time the reply.

Global Gate Logistics quotes ocean and air rate requests within 24 business hours, which is the
standard an agent should hold any US partner to before routing volume through them.

## What to have ready before you evaluate a partner

A meaningful rate comparison needs the same information every time: the origin port or airport,
the destination city or ZIP code, the cargo weight and volume (or container count for FCL), the
commodity description, and the target ready date. Sending an incomplete request is the single
biggest reason a "24-hour quote" promise turns into three days of back-and-forth.

## The checklist

| Check | How to verify |
|---|---|
| FMC license (for NVOCC status) | Search the FMC's public licensee database directly — don't rely on the number as printed on a website. |
| IATA membership (for air freight) | Ask for the IATA code and cross-check it independently. |
| In-house vs. subcontracted scope | Ask directly which of customs, warehousing, and trucking are handled in-house. |
| Network membership | A second, independent screening signal — not a replacement for the license check. |
| Response time | Send a real, complete rate request and time the reply before committing volume. |
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/blog-pages.test.ts`
Expected: PASS.

- [ ] **Step 5: Cross-link the article from `/partners/agents`**

In `src/data/partners-audience.ts`, add to the `agents` entry (after `metaDescription`):

```ts
    crossLinks: [
      { text: 'How to choose a US freight forwarding partner', href: '/blog/choosing-a-us-freight-forwarding-partner' },
    ],
```

This requires adding the same optional field to the `PartnerAudience` interface:

```ts
export interface PartnerAudience {
  slug: string;
  name: string;
  tagline: string;
  heroCopy: string;
  bullets: string[];
  faqs: FAQ[];
  metaTitle: string;
  metaDescription: string;
  crossLinks?: { text: string; href: string }[];
}
```

And render it in `src/layouts/PartnerLayout.astro`, using the exact same block added to
`ServiceLayout.astro` in Task 3 — insert after the bullets `</section>` and before
`<CTABand ...>`:

```astro
  {partner.crossLinks && partner.crossLinks.length > 0 && (
    <section class="bg-slate-50 py-10">
      <div class="container-gg max-w-3xl">
        <ul class="flex flex-wrap gap-6">
          {partner.crossLinks.map((link) => (
            <li>
              <a href={link.href} class="inline-flex items-center gap-2 text-amber-600 hover:text-amber-500 font-semibold">
                {link.text} <span aria-hidden="true">&rarr;</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )}
```

Add one assertion to `tests/components/partners-pages.test.ts` (after the "offers a conversion
path" test in the `describe.each` block):

```ts
  it('renders any cross-links as real anchors', async () => {
    const partner = PARTNER_AUDIENCES.find((p) => p.slug === slug)!;
    if (!partner.crossLinks || partner.crossLinks.length === 0) return;
    const html = await renderDetail(slug);
    for (const link of partner.crossLinks) {
      expect(html).toContain(`href="${link.href}"`);
      expect(html).toContain(link.text);
    }
  });
```

- [ ] **Step 6: Run full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/content/blog/choosing-a-us-freight-forwarding-partner.md src/data/partners-audience.ts src/layouts/PartnerLayout.astro tests/components/blog-pages.test.ts tests/components/partners-pages.test.ts
git rm src/content/blog/fixture-post.md
git commit -m "feat: publish priority article and cross-link it from the agent partner page"
```

---

## Task 7: GEO coverage for Phase 1 pages

**Files:**
- Modify: `public/llms.txt`
- Modify: `tests/build/geo-files.test.ts`
- Modify: `tests/build/seo-invariants.test.ts` (the `expected` route array)
- Modify: `tests/build/sitemap.test.ts` (the indexable-URL list)

**Interfaces:** none — this task only extends existing whitelists and static content.

- [ ] **Step 1: Write the failing GEO test**

`tests/build/geo-files.test.ts` already has a `describe('llms.txt', () => { const llms =
readFileSync('public/llms.txt', 'utf8'); ... })` block. Add two new `it()` cases inside that
existing block (reuse its `llms` constant — do not create a new describe block or re-read the
file):

```ts
  it('lists the blog', () => {
    expect(llms).toContain('/blog');
  });

  it('lists the overseas-agent partner page', () => {
    expect(llms).toContain('/partners/agents');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build -- tests/build/geo-files.test.ts`
Expected: FAIL — neither string present in `public/llms.txt` yet.

- [ ] **Step 3: Update `public/llms.txt`**

Read the current file first to match its existing section style exactly, then add a "Blog" line
and a "Partners" line to its page index, alongside the existing service entries — for example
(adapt to match the file's actual existing format for a service entry):

```
Blog: https://global-gate.us/blog
Partner Program (Overseas Agents): https://global-gate.us/partners/agents
```

- [ ] **Step 4: Update the two build-output whitelists**

In `tests/build/seo-invariants.test.ts`, the `expected` array holds full built-file paths
(`'dist/client/<route>/index.html'`), not bare routes — match that exact format. Add:
```ts
      'dist/client/blog/index.html',
      'dist/client/blog/choosing-a-us-freight-forwarding-partner/index.html',
      'dist/client/partners/agents/index.html',
```

In `tests/build/sitemap.test.ts`, the "includes the indexable pages" test checks full URLs with
a `</loc>` suffix — match that exact format. Add to that `it()`:
```ts
    expect(sitemap).toContain('https://global-gate.us/blog</loc>');
    expect(sitemap).toContain('https://global-gate.us/blog/choosing-a-us-freight-forwarding-partner</loc>');
    expect(sitemap).toContain('https://global-gate.us/partners/agents</loc>');
```

- [ ] **Step 5: Run the full build-output suite**

Run: `npm run test:build`
Expected: PASS, including the new assertions.

- [ ] **Step 6: Commit**

```bash
git add public/llms.txt tests/build/geo-files.test.ts tests/build/seo-invariants.test.ts tests/build/sitemap.test.ts
git commit -m "feat: register Phase 1 pages in llms.txt and build-output whitelists"
```

---

## Task 8: Phase 1 full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the unit/component suite**

Run: `npm test`
Expected: PASS, all tests green (starting count 212 + additions from Tasks 1–7).

- [ ] **Step 2: Run the build-output suite**

Run: `npm run test:build`
Expected: PASS. This is the first point where the internal-link-validity check in
`seo-invariants.test.ts` exercises every new link added across Tasks 1–7 against a real
production build.

- [ ] **Step 3: Run the end-to-end suite**

Run: `npm run test:e2e`
Expected: PASS — confirms the nav change (added "Blog") and the new pages didn't break the
existing quote flow.

- [ ] **Step 4: Manual JS-disabled check**

With the dev server running, disable JavaScript and load each of: `/`, `/partners/agents`,
`/blog`, `/blog/choosing-a-us-freight-forwarding-partner`. Confirm all text, the FAQ answers, and
navigation are fully present and readable.

- [ ] **Step 5: Report status**

Summarize test output (paste the actual pass counts, not a description) before moving to Phase 2.

---

## Task 9: `serviceSchema` area-served override

**Files:**
- Modify: `src/lib/schema.ts`
- Test: `tests/unit/schema.test.ts`

**Interfaces:**
- Produces: `serviceSchema(input: { name, description, url, areaServed?: { type: string; name: string } })` — the `areaServed` param is optional and additive; every existing call site (`ServiceLayout.astro`, `PartnerLayout.astro`) is unaffected. Consumed by Task 10's trade-lane pages.

- [ ] **Step 1: Write the failing test**

Add to the existing `describe('serviceSchema', ...)` block in `tests/unit/schema.test.ts`:

```ts
  it('defaults areaServed to the site-wide service area when not overridden', () => {
    const s = serviceSchema({
      name: 'Ocean Freight',
      description: 'FCL and LCL ocean freight.',
      url: 'https://global-gate.us/services/ocean-freight',
    }) as Record<string, any>;
    expect(s.areaServed).toEqual({ '@type': 'Country', name: 'United States' });
  });

  it('accepts a per-call areaServed override for trade-lane pages', () => {
    const s = serviceSchema({
      name: 'China to USA Ocean Freight',
      description: 'Ocean freight from China.',
      url: 'https://global-gate.us/shipping/china-to-usa',
      areaServed: { type: 'Country', name: 'China' },
    }) as Record<string, any>;
    expect(s.areaServed).toEqual({ '@type': 'Country', name: 'China' });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/schema.test.ts`
Expected: FAIL — TypeScript error, `areaServed` is not a known property on the input type
(or the override is silently ignored at runtime, depending on how strict the current build is).

- [ ] **Step 3: Implement**

Replace `serviceSchema` in `src/lib/schema.ts`:

```ts
export function serviceSchema(input: {
  name: string;
  description: string;
  url: string;
  areaServed?: { type: string; name: string };
}) {
  const area = input.areaServed ?? { type: 'Country', name: SITE.serviceArea };
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: input.url,
    serviceType: input.name,
    provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    areaServed: { '@type': area.type, name: area.name },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/schema.test.ts`
Expected: PASS. Also run `npm test` in full to confirm `ServiceLayout`/`PartnerLayout`-driven
tests still pass unchanged (they don't pass `areaServed`, so they exercise the default branch).

- [ ] **Step 5: Commit**

```bash
git add src/lib/schema.ts tests/unit/schema.test.ts
git commit -m "feat: allow serviceSchema areaServed override for trade-lane pages"
```

---

## Task 10: Trade-lane hub + China/Vietnam pages

**Files:**
- Create: `src/data/trade-lanes.ts`
- Create: `src/layouts/TradeLaneLayout.astro`
- Create: `src/pages/shipping/[slug].astro`
- Create: `src/pages/shipping/index.astro`
- Modify: `src/config/site.ts` (`NAV_LINKS` gains "Trade Lanes")
- Modify: `src/components/layout/Footer.astro` (new Trade Lanes column)
- Test: `tests/components/shipping-pages.test.ts`
- Test: `tests/components/footer.test.ts`

**Interfaces:**
- Consumes: `serviceSchema` with `areaServed` from Task 9; `FAQ` type from `src/data/services.ts`.
- Produces: `TradeLane` interface, `TRADE_LANES: TradeLane[]`, `getTradeLane(slug)`.

- [ ] **Step 1: Write the failing test**

Create `tests/components/shipping-pages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ShippingIndex from '../../src/pages/shipping/index.astro';
import ShippingDetail from '../../src/pages/shipping/[slug].astro';
import { TRADE_LANES } from '../../src/data/trade-lanes';

async function renderDetail(slug: string) {
  const lane = TRADE_LANES.find((l) => l.slug === slug)!;
  const container = await AstroContainer.create();
  return container.renderToString(ShippingDetail, {
    props: { lane },
    params: { slug },
  });
}

function stripJsonLd(html: string): string {
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
}

describe('Shipping hub', () => {
  it('links both trade-lane pages', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ShippingIndex);
    for (const lane of TRADE_LANES) expect(html).toContain(`/shipping/${lane.slug}`);
  });

  it('renders exactly one h1', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ShippingIndex);
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });
});

describe.each(TRADE_LANES.map((l) => [l.slug, l.name, l.country]))(
  'Trade lane page: %s',
  (slug, name, country) => {
    it('renders exactly one h1 containing the lane name', async () => {
      const html = await renderDetail(slug);
      expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
      expect(html).toContain(name);
    });

    it('emits Service JSON-LD with the lane-specific areaServed', async () => {
      const html = await renderDetail(slug);
      expect(html).toContain('"@type":"Service"');
      expect(html).toContain(`"name":"${country}"`);
    });

    it('emits FAQPage JSON-LD', async () => {
      const html = await renderDetail(slug);
      expect(html).toContain('"@type":"FAQPage"');
    });

    it('renders every FAQ answer as crawlable text, not hidden behind JavaScript', async () => {
      const lane = TRADE_LANES.find((l) => l.slug === slug)!;
      const html = await renderDetail(slug);
      const body = stripJsonLd(html);
      for (const faq of lane.faqs) {
        expect(body).toContain(faq.question);
        expect(body).toContain(faq.answer);
      }
      expect(html).not.toMatch(/<details[^>]*\sopen[\s>]/);
    });

    it('offers a conversion path', async () => {
      const html = await renderDetail(slug);
      expect(html).toContain('href="/quote"');
    });

    it('links back to the shipping hub via breadcrumbs', async () => {
      const html = await renderDetail(slug);
      expect(html).toContain('href="/shipping/asia-to-usa"');
    });
  }
);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/shipping-pages.test.ts`
Expected: FAIL — modules don't exist yet.

- [ ] **Step 3: Create `src/data/trade-lanes.ts`**

```ts
import type { FAQ } from './services';

export interface TradeLane {
  slug: string;
  name: string;
  country: string;
  tagline: string;
  heroCopy: string;
  bullets: string[];
  faqs: FAQ[];
  metaTitle: string;
  metaDescription: string;
}

export const TRADE_LANES: TradeLane[] = [
  {
    slug: 'china-to-usa',
    name: 'China to USA Freight',
    country: 'China',
    tagline: 'Ocean FCL & LCL, Air Freight',
    heroCopy:
      'China is a lane Global Gate Logistics handles well: direct carrier service contracts, in-house customs filing, and warehousing minutes from JFK and the Port of NY/NJ, alongside every other origin the company ships FCL and air cargo from.',
    bullets: [
      'FCL and LCL ocean freight from Shanghai, Ningbo-Zhoushan, Shenzhen (Yantian), and Qingdao',
      'Air freight from Shanghai Pudong and Hong Kong gateways',
      'ISF (10+2) filing handled in-house, ahead of the 24-hour-before-loading deadline',
      'Customs entry, HTS classification, and duty estimation filed by the same team booking the freight',
      'Warehousing and drayage near JFK and the Port of NY/NJ for final delivery',
    ],
    faqs: [
      {
        question: 'How long does ocean freight from China to the US take?',
        answer:
          'Ocean transit from major Chinese ports to the US West Coast typically runs 14 to 20 days, and to the US East Coast, including the Port of NY/NJ, 28 to 38 days. LCL shipments add 3 to 7 days for consolidation and deconsolidation.',
      },
      {
        question: 'Which Chinese ports does this lane typically move through?',
        answer:
          'Most FCL and LCL bookings out of China move through Shanghai, Ningbo-Zhoushan, Shenzhen (Yantian), or Qingdao — the busiest container ports in the country.',
      },
      {
        question: 'What documents are needed to import from China?',
        answer:
          'A standard entry requires the commercial invoice, packing list, and bill of lading, plus a customs bond. For ocean shipments, an ISF (Importer Security Filing) is also required at least 24 hours before the cargo is loaded at the Chinese port.',
      },
      {
        question: 'Is air freight from China faster than ocean?',
        answer:
          'Air freight from major Chinese gateways such as Shanghai Pudong or Hong Kong typically takes 3 to 7 days door to door, versus 14 to 38 days by ocean depending on the US coast. Air becomes cost-competitive for shipments under roughly 500 kilograms or when a delay would cost more than the freight itself.',
      },
    ],
    metaTitle: 'China to USA Freight Forwarding',
    metaDescription:
      'Ocean FCL & LCL and air freight from China to the USA: direct carrier contracts, in-house customs and ISF filing, and JFK-area warehousing.',
  },
  {
    slug: 'vietnam-to-usa',
    name: 'Vietnam to USA Freight',
    country: 'Vietnam',
    tagline: 'Ocean FCL & LCL, Air Freight',
    heroCopy:
      'Vietnam has become one of the fastest-growing origins for US imports as manufacturers diversify beyond China, and it is a lane Global Gate Logistics ships well — the same in-house customs, warehousing, and carrier relationships apply here as on every other origin.',
    bullets: [
      'FCL and LCL ocean freight from Cat Lai and Cai Mep-Thi Vai (Ho Chi Minh City area) and Hai Phong (north)',
      'Air freight from Tan Son Nhat (Ho Chi Minh City) and Noi Bai (Hanoi)',
      'ISF (10+2) filing handled in-house, ahead of the 24-hour-before-loading deadline',
      'Customs entry, HTS classification, and duty estimation filed by the same team booking the freight',
      'Warehousing and drayage near JFK and the Port of NY/NJ for final delivery',
    ],
    faqs: [
      {
        question: 'How long does shipping from Vietnam to the US take?',
        answer:
          'Transit times from Vietnam\'s ports fall within the same range as other major Asian origins: roughly 14 to 20 days to the US West Coast and 28 to 38 days to the US East Coast by ocean, or 3 to 7 days door to door by air.',
      },
      {
        question: 'Why are more importers sourcing from Vietnam?',
        answer:
          'Vietnam has become one of the fastest-growing origins for US imports as manufacturers diversify production beyond China. Its container ports, led by Cat Lai and Cai Mep-Thi Vai near Ho Chi Minh City, now handle a large share of Southeast Asia\'s export volume.',
      },
      {
        question: 'What documents are needed to import from Vietnam?',
        answer:
          'The same standard entry documents apply as any origin: commercial invoice, packing list, bill of lading, and a customs bond, plus an ISF filing at least 24 hours before ocean cargo is loaded.',
      },
      {
        question: 'Is FCL or LCL cheaper for a Vietnam shipment?',
        answer:
          'FCL usually becomes cheaper per cubic meter once a shipment exceeds roughly 15 CBM. Below that volume, LCL consolidation is typically the lower-cost option.',
      },
    ],
    metaTitle: 'Vietnam to USA Freight Forwarding',
    metaDescription:
      'Ocean FCL & LCL and air freight from Vietnam to the USA: in-house customs and ISF filing, direct carrier contracts, and JFK-area warehousing.',
  },
];

export function getTradeLane(slug: string): TradeLane | undefined {
  return TRADE_LANES.find((l) => l.slug === slug);
}
```

- [ ] **Step 4: Create `src/layouts/TradeLaneLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import Breadcrumbs from '../components/seo/Breadcrumbs.astro';
import FAQAccordion from '../components/ui/FAQAccordion.astro';
import CTABand from '../components/ui/CTABand.astro';
import TrustBar from '../components/trust/TrustBar.astro';
import { serviceSchema, faqSchema } from '../lib/schema';
import { canonicalUrl } from '../lib/seo';
import type { TradeLane } from '../data/trade-lanes';

interface Props { lane: TradeLane; }
const { lane } = Astro.props;

const pathname = `/shipping/${lane.slug}`;
const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Trade Lanes', href: '/shipping/asia-to-usa' },
  { name: lane.name, href: pathname },
];

const schemas = [
  serviceSchema({
    name: lane.name,
    description: lane.metaDescription,
    url: canonicalUrl(pathname),
    areaServed: { type: 'Country', name: lane.country },
  }),
  faqSchema(lane.faqs),
];
---
<BaseLayout
  title={lane.metaTitle}
  description={lane.metaDescription}
  {pathname}
  {breadcrumbs}
  {schemas}
>
  <div class="bg-navy-900">
    <Breadcrumbs trail={breadcrumbs} />
    <div class="container-gg pb-14 pt-4 max-w-3xl">
      <p class="text-amber-400 text-xs font-bold tracking-widest uppercase mb-4">{lane.tagline}</p>
      <h1 class="text-white mb-6" style="font-size:clamp(2.25rem,5.5vw,3.75rem)">{lane.name}</h1>
      <p class="text-slate-300 text-lg leading-relaxed">{lane.heroCopy}</p>
    </div>
  </div>
  <TrustBar />

  <section class="bg-white py-16 md:py-20">
    <div class="container-gg max-w-3xl">
      <h2 class="font-display text-navy-900 text-3xl md:text-4xl font-bold mb-8">What's included</h2>
      <ul class="space-y-4">
        {lane.bullets.map((bullet) => (
          <li class="flex gap-3 text-slate-600 text-base md:text-lg leading-relaxed">
            <span class="text-amber-500 shrink-0 mt-1" aria-hidden="true">&#10003;</span>
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  </section>

  <CTABand heading={`Need a quote for ${lane.country}?`} />
  <FAQAccordion faqs={lane.faqs} heading={`${lane.name}: common questions`} />
</BaseLayout>
```

- [ ] **Step 5: Create `src/pages/shipping/[slug].astro`**

```astro
---
import TradeLaneLayout from '../../layouts/TradeLaneLayout.astro';
import { TRADE_LANES } from '../../data/trade-lanes';
import type { TradeLane } from '../../data/trade-lanes';

export function getStaticPaths() {
  return TRADE_LANES.map((lane) => ({
    params: { slug: lane.slug },
    props: { lane },
  }));
}

interface Props { lane: TradeLane; }
const { lane } = Astro.props;
---
<TradeLaneLayout {lane} />
```

- [ ] **Step 6: Create the hub, `src/pages/shipping/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumbs from '../../components/seo/Breadcrumbs.astro';
import FAQAccordion from '../../components/ui/FAQAccordion.astro';
import CTABand from '../../components/ui/CTABand.astro';
import TrustBar from '../../components/trust/TrustBar.astro';
import { faqSchema } from '../../lib/schema';
import { TRADE_LANES } from '../../data/trade-lanes';

const breadcrumbs = [{ name: 'Home', href: '/' }, { name: 'Trade Lanes', href: '/shipping/asia-to-usa' }];
const description =
  'FCL and air freight forwarding from any origin, with in-house customs, warehousing, and delivery. China and Vietnam are two lanes handled in depth below.';

const faqs = [
  {
    question: 'Do you only ship from China and Vietnam?',
    answer:
      'No. Global Gate Logistics ships FCL and air cargo from any origin, not only the two lanes detailed on this page. Request a quote for your specific origin and destination.',
  },
  {
    question: 'What is the difference between ocean and air freight for these lanes?',
    answer:
      'Ocean freight is almost always cheaper per kilogram for heavy cargo, while air freight is competitive for shipments under roughly 500 kilograms or when a delay would cost more than the freight itself. Ocean transit runs 14 to 38 days depending on the US coast; air transit runs 3 to 7 days door to door.',
  },
];
---
<BaseLayout title="Trade Lanes" {description} pathname="/shipping/asia-to-usa" {breadcrumbs} schemas={[faqSchema(faqs)]}>
  <div class="bg-navy-900">
    <Breadcrumbs trail={breadcrumbs} />
    <div class="container-gg pb-12 pt-4 max-w-3xl">
      <h1 class="text-white mb-4" style="font-size:clamp(2.25rem,5.5vw,3.75rem)">Trade Lanes</h1>
      <p class="text-slate-300">{description}</p>
    </div>
  </div>
  <TrustBar />
  <div class="container-gg py-16">
    <ul class="grid sm:grid-cols-2 gap-6">
      {TRADE_LANES.map((lane) => (
        <li class="bg-white border border-slate-100 rounded-xl p-6 hover:border-amber-400 transition-colors">
          <a href={`/shipping/${lane.slug}`} class="block">
            <span class="font-display text-navy-900 font-bold text-lg block mb-2">{lane.name}</span>
            <span class="text-slate-500 text-sm">{lane.tagline}</span>
          </a>
        </li>
      ))}
    </ul>
  </div>
  <CTABand />
  <FAQAccordion {faqs} heading="Trade lanes: common questions" />
</BaseLayout>
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test -- tests/components/shipping-pages.test.ts`
Expected: PASS.

- [ ] **Step 8: Add "Trade Lanes" to primary nav**

In `src/config/site.ts`, update `NAV_LINKS`:

```ts
export const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/shipping/asia-to-usa', label: 'Trade Lanes' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;
```

- [ ] **Step 9: Add the Trade Lanes column to the footer**

In `src/components/layout/Footer.astro`, add a new array near `serviceLinks`:

```ts
const tradeLaneLinks = [
  ['All Trade Lanes', '/shipping/asia-to-usa'],
  ['China – USA', '/shipping/china-to-usa'],
  ['Vietnam – USA', '/shipping/vietnam-to-usa'],
];
```

Change the grid from `md:grid-cols-4` to `md:grid-cols-5`, and add a new `<nav>` block right
after the closing `</nav>` of the Services column:

```astro
    <nav aria-labelledby="footer-trade-lanes">
      <h2 id="footer-trade-lanes" class="font-display uppercase tracking-[0.08em] text-white text-sm mb-4">Trade Lanes</h2>
      <ul class="space-y-2 text-sm">
        {tradeLaneLinks.map(([label, href]) => (
          <li><a href={href} class="hover:text-amber-400 transition-colors">{label}</a></li>
        ))}
      </ul>
    </nav>
```

- [ ] **Step 10: Extend the footer test**

Add to `tests/components/footer.test.ts`:

```ts
  it('links the trade-lane pages', async () => {
    const html = await render();
    expect(html).toContain('/shipping/asia-to-usa');
    expect(html).toContain('/shipping/china-to-usa');
    expect(html).toContain('/shipping/vietnam-to-usa');
  });
```

- [ ] **Step 11: Run full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 12: Commit**

```bash
git add src/data/trade-lanes.ts src/layouts/TradeLaneLayout.astro src/pages/shipping src/config/site.ts src/components/layout/Footer.astro tests/components/shipping-pages.test.ts tests/components/footer.test.ts
git commit -m "feat: add trade-lane hub and China/Vietnam pages"
```

---

## Task 11: Location pages

**Files:**
- Create: `src/data/locations.ts`
- Create: `src/layouts/LocationLayout.astro`
- Create: `src/pages/locations/[slug].astro`
- Modify: `src/data/services.ts` (`warehousing-distribution` and `domestic-trucking` get `crossLinks`)
- Modify: `src/components/home/About.astro` (one link to a location page)
- Test: `tests/components/locations-pages.test.ts`

**Interfaces:**
- Consumes: `serviceSchema`, `faqSchema`, `breadcrumbSchema`; `Service.crossLinks` from Task 3.
- Produces: `LocationPage` interface, `LOCATIONS: LocationPage[]`, `getLocation(slug)`.

- [ ] **Step 1: Write the failing test**

Create `tests/components/locations-pages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import LocationDetail from '../../src/pages/locations/[slug].astro';
import { LOCATIONS } from '../../src/data/locations';

async function renderDetail(slug: string) {
  const location = LOCATIONS.find((l) => l.slug === slug)!;
  const container = await AstroContainer.create();
  return container.renderToString(LocationDetail, {
    props: { location },
    params: { slug },
  });
}

function stripJsonLd(html: string): string {
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
}

describe.each(LOCATIONS.map((l) => [l.slug, l.name]))('Location page: %s', (slug, name) => {
  it('renders exactly one h1 containing the location name', async () => {
    const html = await renderDetail(slug);
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
    expect(html).toContain(name);
  });

  it('publishes the real, confirmed address', async () => {
    const html = await renderDetail(slug);
    expect(html).toContain('153-04 Rockaway Blvd');
  });

  it('emits Service and FAQPage JSON-LD', async () => {
    const html = await renderDetail(slug);
    expect(html).toContain('"@type":"Service"');
    expect(html).toContain('"@type":"FAQPage"');
  });

  it('renders every FAQ answer as crawlable text, not hidden behind JavaScript', async () => {
    const location = LOCATIONS.find((l) => l.slug === slug)!;
    const html = await renderDetail(slug);
    const body = stripJsonLd(html);
    for (const faq of location.faqs) {
      expect(body).toContain(faq.question);
      expect(body).toContain(faq.answer);
    }
    expect(html).not.toMatch(/<details[^>]*\sopen[\s>]/);
  });

  it('offers a conversion path', async () => {
    const html = await renderDetail(slug);
    expect(html).toContain('href="/quote"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/locations-pages.test.ts`
Expected: FAIL — modules don't exist.

- [ ] **Step 3: Create `src/data/locations.ts`**

```ts
import type { FAQ } from './services';
import { SITE } from '../config/site';

export interface LocationPage {
  slug: string;
  name: string;
  tagline: string;
  heroCopy: string;
  bullets: string[];
  faqs: FAQ[];
  metaTitle: string;
  metaDescription: string;
}

export const LOCATIONS: LocationPage[] = [
  {
    slug: 'jfk-freight-forwarder',
    name: 'JFK Freight Forwarder',
    tagline: 'Air & Ocean Cargo Near JFK',
    heroCopy: `Global Gate Logistics operates from ${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postalCode} — minutes from JFK International Airport. Air cargo arriving at JFK is cleared, warehoused, and dispatched by one in-house team.`,
    bullets: [
      'C-TPAT certified customs clearance for air cargo arriving at JFK',
      'Warehousing and deconsolidation minutes from the airport',
      'Drayage and final-mile delivery dispatched from the same facility',
      'Ocean cargo arriving at the Port of NY/NJ handled by the same team',
    ],
    faqs: [
      {
        question: 'Do you have a warehouse near JFK?',
        answer:
          'Global Gate Logistics operates from 153-04 Rockaway Blvd in Queens, New York, minutes from JFK International Airport and within reach of the Port of New York and New Jersey.',
      },
      {
        question: 'Can you clear air cargo arriving at JFK?',
        answer:
          'Yes. Most US customs entries clear within 24 to 48 hours of arrival when documentation is complete, and clearance is filed in-house rather than subcontracted to a separate broker.',
      },
      {
        question: 'Do you offer drayage from JFK?',
        answer:
          'Yes. Port and airport drayage in the New York metro area is arranged alongside the ocean or air booking, so there is no gap where cargo waits for a separate carrier to be arranged.',
      },
      {
        question: 'What if my cargo arrives at a different New York-area gateway?',
        answer:
          'The same team also handles cargo through the Port of New York and New Jersey — see the New York freight forwarder page for the ocean-focused view of the same facility and services.',
      },
    ],
    metaTitle: 'JFK Freight Forwarder — Air & Ocean Cargo',
    metaDescription:
      'A JFK-area freight forwarder handling air and ocean cargo in-house: customs clearance, warehousing, and drayage minutes from the airport.',
  },
  {
    slug: 'new-york-freight-forwarder',
    name: 'New York Freight Forwarder',
    tagline: 'Ocean & Air Cargo, NY Metro',
    heroCopy: `Global Gate Logistics is based in ${SITE.address.city}, ${SITE.address.region}, within reach of both the Port of New York and New Jersey and JFK International Airport. Importers and exporters across the New York metro area are served from the same in-house facility.`,
    bullets: [
      'Ocean cargo through the Port of New York and New Jersey, handled in-house end to end',
      'C-TPAT certified customs clearance and HTS classification',
      'Warehousing, deconsolidation, and pick/pack at the Queens facility',
      'Nationwide trucking dispatched directly from New York',
    ],
    faqs: [
      {
        question: 'Do you handle imports through the Port of NY/NJ?',
        answer:
          'Yes. Ocean freight through the Port of New York and New Jersey is booked, cleared through customs, and warehoused by the same in-house team, with no handoff to a separate broker or warehouse operator.',
      },
      {
        question: 'Do you serve businesses outside New York City?',
        answer:
          'Yes. Nationwide FTL and LTL delivery is arranged from the same New York facility, so businesses anywhere in the continental United States can be served from one origin point.',
      },
      {
        question: 'How close is your facility to the port?',
        answer:
          'The facility at 153-04 Rockaway Blvd in Queens is within reach of both the Port of New York and New Jersey and JFK International Airport, covering ocean and air cargo from one location.',
      },
      {
        question: 'What if my cargo moves by air instead of ocean?',
        answer:
          'The same team and facility handle air cargo through JFK — see the JFK freight forwarder page for the air-focused view of the same services.',
      },
    ],
    metaTitle: 'New York Freight Forwarder — Ocean & Air Cargo',
    metaDescription:
      'A New York freight forwarder serving the Port of NY/NJ and JFK: in-house customs clearance, warehousing, and nationwide trucking.',
  },
];

export function getLocation(slug: string): LocationPage | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
```

- [ ] **Step 4: Create `src/layouts/LocationLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import Breadcrumbs from '../components/seo/Breadcrumbs.astro';
import FAQAccordion from '../components/ui/FAQAccordion.astro';
import CTABand from '../components/ui/CTABand.astro';
import TrustBar from '../components/trust/TrustBar.astro';
import { serviceSchema, faqSchema } from '../lib/schema';
import { canonicalUrl } from '../lib/seo';
import type { LocationPage } from '../data/locations';

interface Props { location: LocationPage; }
const { location } = Astro.props;

const pathname = `/locations/${location.slug}`;
const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: location.name, href: pathname },
];

const schemas = [
  serviceSchema({
    name: location.name,
    description: location.metaDescription,
    url: canonicalUrl(pathname),
  }),
  faqSchema(location.faqs),
];
---
<BaseLayout
  title={location.metaTitle}
  description={location.metaDescription}
  {pathname}
  {breadcrumbs}
  {schemas}
>
  <div class="bg-navy-900">
    <Breadcrumbs trail={breadcrumbs} />
    <div class="container-gg pb-14 pt-4 max-w-3xl">
      <p class="text-amber-400 text-xs font-bold tracking-widest uppercase mb-4">{location.tagline}</p>
      <h1 class="text-white mb-6" style="font-size:clamp(2.25rem,5.5vw,3.75rem)">{location.name}</h1>
      <p class="text-slate-300 text-lg leading-relaxed">{location.heroCopy}</p>
    </div>
  </div>
  <TrustBar />

  <section class="bg-white py-16 md:py-20">
    <div class="container-gg max-w-3xl">
      <h2 class="font-display text-navy-900 text-3xl md:text-4xl font-bold mb-8">What's included</h2>
      <ul class="space-y-4">
        {location.bullets.map((bullet) => (
          <li class="flex gap-3 text-slate-600 text-base md:text-lg leading-relaxed">
            <span class="text-amber-500 shrink-0 mt-1" aria-hidden="true">&#10003;</span>
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  </section>

  <CTABand heading="Shipping through this area?" />
  <FAQAccordion faqs={location.faqs} heading={`${location.name}: common questions`} />
</BaseLayout>
```

- [ ] **Step 5: Create `src/pages/locations/[slug].astro`**

```astro
---
import LocationLayout from '../../layouts/LocationLayout.astro';
import { LOCATIONS } from '../../data/locations';
import type { LocationPage } from '../../data/locations';

export function getStaticPaths() {
  return LOCATIONS.map((location) => ({
    params: { slug: location.slug },
    props: { location },
  }));
}

interface Props { location: LocationPage; }
const { location } = Astro.props;
---
<LocationLayout {location} />
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- tests/components/locations-pages.test.ts`
Expected: PASS.

- [ ] **Step 7: Cross-link from `warehousing-distribution` and `domestic-trucking`**

In `src/data/services.ts`, add to the `warehousing-distribution` entry:

```ts
    crossLinks: [
      { text: 'JFK Freight Forwarder — air & ocean cargo near JFK', href: '/locations/jfk-freight-forwarder' },
    ],
```

And to the `domestic-trucking` entry:

```ts
    crossLinks: [
      { text: 'New York Freight Forwarder — ocean & air cargo, NY metro', href: '/locations/new-york-freight-forwarder' },
    ],
```

- [ ] **Step 8: Link one location page from the homepage**

In `src/components/home/About.astro`, add a link under the existing points list (after the
`</ul>` inside the navy card, before the closing italic paragraph):

```astro
      <a href="/locations/jfk-freight-forwarder" class="inline-block mt-6 text-amber-400 hover:text-amber-300 text-sm font-semibold">
        Shipping through JFK? See our JFK-area page &rarr;
      </a>
```

- [ ] **Step 9: Run full test suite**

Run: `npm test`
Expected: PASS — this also exercises the Task-3 cross-link test in `service-pages.test.ts`
against two more real entries.

- [ ] **Step 10: Commit**

```bash
git add src/data/locations.ts src/layouts/LocationLayout.astro src/pages/locations src/data/services.ts src/components/home/About.astro tests/components/locations-pages.test.ts
git commit -m "feat: add JFK and New York location pages"
```

---

## Task 12: Brokers/3PLs partner page

**Files:**
- Modify: `src/data/partners-audience.ts` (add the `brokers` entry)
- Modify: `src/data/services.ts` (`domestic-trucking` and `warehousing-distribution` cross-link to `/partners/brokers` too)
- Test: `tests/components/partners-pages.test.ts` (already data-driven — no structural change needed, only new fixture data to exercise)

**Interfaces:**
- Consumes: the `PartnerAudience` interface and `PartnerLayout`/`[slug].astro` route already built in Task 4 — this task only adds a second array entry, since the route is already `getStaticPaths()`-driven off `PARTNER_AUDIENCES`.

- [ ] **Step 1: Confirm the existing test is already data-driven**

`tests/components/partners-pages.test.ts` uses `describe.each(PARTNER_AUDIENCES.map(...))`, so
adding a new entry to the array automatically gets full coverage with no test-file changes.
Run: `npm test -- tests/components/partners-pages.test.ts`
Expected: PASS (still just the `agents` entry — confirms the baseline before adding `brokers`).

- [ ] **Step 2: Add the `brokers` entry**

In `src/data/partners-audience.ts`, add to `PARTNER_AUDIENCES`:

```ts
  {
    slug: 'brokers',
    name: 'Broker & 3PL Partnership',
    tagline: 'Subcontract a Leg, Not the Whole Shipment',
    heroCopy:
      'Global Gate Logistics handles ocean, air, customs, warehousing, and trucking in-house for freight brokers and 3PLs who need one leg of a shipment covered without losing visibility to a third company.',
    bullets: [
      'In-house customs clearance — no separate broker relationship to manage',
      'Warehousing and deconsolidation minutes from JFK and the Port of NY/NJ',
      'Nationwide FTL and LTL delivery with appointment scheduling',
      'Rate requests answered within 24 business hours',
      'C-TPAT certified operations, filed and dispatched by one team',
    ],
    faqs: [
      {
        question: 'Can you handle a single leg of a multi-leg shipment for us?',
        answer:
          'Yes. Ocean or air freight, customs clearance, warehousing, and trucking can each be booked independently, so a broker or 3PL can hand off exactly the leg that needs covering.',
      },
      {
        question: 'What information do you need to quote a broker-referred shipment?',
        answer:
          'The same information any quote requires: the origin port or city, the destination address or port, the cargo weight and volume, the commodity description, and the target ready date. Rates are returned within 24 business hours.',
      },
      {
        question: 'Can you handle drayage and warehousing together?',
        answer:
          'Yes. Drayage from the port or airport and warehousing at the Queens facility are coordinated by the same team, so cargo does not sit waiting for a separate vendor to be arranged.',
      },
      {
        question: 'Do you offer appointment scheduling for final delivery?',
        answer:
          'Yes. Delivery appointments are booked directly with the receiving facility, which most large distribution centers require before a truck will be accepted.',
      },
    ],
    metaTitle: 'Broker & 3PL Partnership',
    metaDescription:
      'Subcontract ocean, air, customs, warehousing, or trucking to an in-house team. 24-hour rate turnaround for broker and 3PL referred shipments.',
    crossLinks: [{ text: 'See our domestic trucking capabilities', href: '/services/domestic-trucking' }],
  },
```

- [ ] **Step 3: Run test to verify the new entry passes**

Run: `npm test -- tests/components/partners-pages.test.ts`
Expected: PASS for both `agents` and `brokers`.

- [ ] **Step 4: Cross-link from the two relevant services**

In `src/data/services.ts`, update `domestic-trucking`'s `crossLinks` to include both links (it
already has one from Task 11):

```ts
    crossLinks: [
      { text: 'New York Freight Forwarder — ocean & air cargo, NY metro', href: '/locations/new-york-freight-forwarder' },
      { text: 'Broker & 3PL partnership page', href: '/partners/brokers' },
    ],
```

And add to `warehousing-distribution` (which already has a `crossLinks` entry from Task 11):

```ts
    crossLinks: [
      { text: 'JFK Freight Forwarder — air & ocean cargo near JFK', href: '/locations/jfk-freight-forwarder' },
      { text: 'Broker & 3PL partnership page', href: '/partners/brokers' },
    ],
```

- [ ] **Step 5: Run full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/partners-audience.ts src/data/services.ts
git commit -m "feat: add broker & 3PL partner page"
```

---

## Task 13: GEO coverage for Phase 2 pages

**Files:**
- Modify: `public/llms.txt`
- Modify: `tests/build/geo-files.test.ts`
- Modify: `tests/build/seo-invariants.test.ts`
- Modify: `tests/build/sitemap.test.ts`

- [ ] **Step 1: Write the failing test**

Add more `it()` cases inside the same existing `describe('llms.txt', ...)` block in
`tests/build/geo-files.test.ts` that Task 7 already added two cases to (reuse the `llms`
constant):

```ts
  it('lists the trade-lane hub and both lane pages', () => {
    // The hub route is /shipping (not /shipping/asia-to-usa — that URL was an
    // error in an earlier draft of this plan; Task 10 already built the real
    // hub at src/pages/shipping/index.astro, served at /shipping). Match the
    // closing paren so this doesn't trivially pass via the lane URLs below,
    // which also contain "/shipping" as a substring.
    expect(llms).toContain('(https://global-gate.us/shipping)');
    expect(llms).toContain('/shipping/china-to-usa');
    expect(llms).toContain('/shipping/vietnam-to-usa');
  });

  it('lists both location pages', () => {
    expect(llms).toContain('/locations/jfk-freight-forwarder');
    expect(llms).toContain('/locations/new-york-freight-forwarder');
  });

  it('lists the brokers partner page', () => {
    expect(llms).toContain('/partners/brokers');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:build -- tests/build/geo-files.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update `public/llms.txt`**

Add entries for the trade-lane hub + 2 lanes, both location pages, and the brokers page,
matching the file's existing format.

- [ ] **Step 4: Update the two build-output whitelists**

In `tests/build/seo-invariants.test.ts`, the `expected` array holds full built-file paths — add:
```ts
      'dist/client/shipping/index.html',
      'dist/client/shipping/china-to-usa/index.html',
      'dist/client/shipping/vietnam-to-usa/index.html',
      'dist/client/locations/jfk-freight-forwarder/index.html',
      'dist/client/locations/new-york-freight-forwarder/index.html',
      'dist/client/partners/brokers/index.html',
```

In `tests/build/sitemap.test.ts`, the "includes the indexable pages" test checks full URLs with
a `</loc>` suffix — add to that `it()`:
```ts
    expect(sitemap).toContain('https://global-gate.us/shipping</loc>');
    expect(sitemap).toContain('https://global-gate.us/shipping/china-to-usa</loc>');
    expect(sitemap).toContain('https://global-gate.us/shipping/vietnam-to-usa</loc>');
    expect(sitemap).toContain('https://global-gate.us/locations/jfk-freight-forwarder</loc>');
    expect(sitemap).toContain('https://global-gate.us/locations/new-york-freight-forwarder</loc>');
    expect(sitemap).toContain('https://global-gate.us/partners/brokers</loc>');
```

- [ ] **Step 5: Run the full build-output suite**

Run: `npm run test:build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add public/llms.txt tests/build/geo-files.test.ts tests/build/seo-invariants.test.ts tests/build/sitemap.test.ts
git commit -m "feat: register Phase 2 pages in llms.txt and build-output whitelists"
```

---

## Task 14: Phase 2 full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the unit/component suite**

Run: `npm test`
Expected: PASS, all tests green.

- [ ] **Step 2: Run the build-output suite**

Run: `npm run test:build`
Expected: PASS — every internal link added across Tasks 9–13 resolves in the real build.

- [ ] **Step 3: Run the end-to-end suite**

Run: `npm run test:e2e`
Expected: PASS.

- [ ] **Step 4: Manual JS-disabled check**

With the dev server running, disable JavaScript and load: `/shipping` (the trade-lane hub),
`/shipping/china-to-usa`, `/shipping/vietnam-to-usa`, `/locations/jfk-freight-forwarder`,
`/locations/new-york-freight-forwarder`, `/partners/brokers`. Confirm all text, FAQ answers, and
navigation (including the new footer Trade Lanes column and header Trade Lanes link) render
fully without JavaScript.

- [ ] **Step 5: Report status**

Paste the actual test output (all three suites) and confirm the dev server shows every new page
correctly at `http://localhost:4321`. This closes out both phases of this plan; the remaining 9
blog articles are sub-project B, specced separately.

---

## Self-Review Notes

- **Spec coverage:** every §4/§4a/§4b item in the spec has a task — WCA (Task 1), homepage
  positioning (Task 2), cross-link mechanism (Task 3), `/partners/agents` (Task 4), blog plumbing
  (Task 5), priority article (Task 6), Phase 1 GEO (Task 7), Phase 1 verification (Task 8),
  `areaServed` override (Task 9), trade lanes + hub + nav/footer (Task 10), locations (Task 11),
  `/partners/brokers` (Task 12), Phase 2 GEO (Task 13), Phase 2 verification (Task 14).
- **Placeholder scan:** no TBD/TODO; every step has real, complete code or copy.
- **Type consistency checked:** `PartnerAudience`, `TradeLane`, and `LocationPage` all reuse the
  same `FAQ` type from `src/data/services.ts`; `crossLinks?: { text: string; href: string }[]`
  is spelled identically on `Service`, `PartnerAudience`, and rendered identically in
  `ServiceLayout.astro`/`PartnerLayout.astro`; `serviceSchema`'s `areaServed` shape
  (`{ type: string; name: string }` in, `{ '@type', name }` out) matches between Task 9's
  definition and Task 10's `TradeLaneLayout.astro` call site.
