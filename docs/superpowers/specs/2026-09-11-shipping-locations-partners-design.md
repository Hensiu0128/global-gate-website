# Global Gate Logistics — Shipping, Locations & Partner Pages Design Spec

**Date:** 2026-09-11
**Owner:** Andy
**Status:** Phase 2, sub-project A of 2, amended 2026-09-11 to pull forward minimum blog
plumbing + one priority article per the owner's growth strategy (§0). The remaining 9 articles
stay sub-project B, specced separately when this lands.
**Supersedes nothing — implements a slice of the already-locked architecture** in
[2026-08-09-global-gate-website-design.md](2026-08-09-global-gate-website-design.md) §5, §8.3,
§9–11, which scoped these pages during Phase 1 but deferred building them.

---

## 0. Amendment — owner's brand & growth strategy (added after initial draft)

After this spec was first drafted, the owner shared a separate brand/growth strategy document
(`GGL-STRAT-2026-09`, prepared in a different session) that changes scope and sequencing here.
Its relevant, binding decisions:

1. **Positioning broadens.** The homepage currently leads with "ASIA TO AMERICA, DOOR TO DOOR"
   and calls itself an "Asia–America specialist." The strategy's positioning statement and its
   4th pillar ("execution over lane... any origin or destination") frame the business as
   FCL/air execution for any lane, not an Asia-specific specialist — consistent with the owner's
   earlier confirmation that the business serves "all other countr[ies]," not just Asia. The
   owner confirmed this homepage repositioning explicitly (2026-09-11). This spec's content plan
   (§4) is updated below to match: the China/Vietnam trade-lane pages are framed as **strengths**,
   not **exclusive specialization**.
2. **WCA membership is a confirmed fact**, not a guess — the owner confirmed it directly. It adds
   to `src/config/site.ts`'s `Credentials` as a new boolean-style fact, following the exact
   pattern already used for `ctpatCertified` (a text credential, no logo image — no WCA logo
   asset file exists, and none will be fabricated or fetched).
3. **Sequencing changes.** The strategy's 90-day plan prioritizes, in order: (a) updated
   positioning copy, (b) the overseas-agent partner page, (c) one specific blog article ("How to
   Choose a US Freight Forwarding Partner"). Building 10 articles + trade-lanes + locations is
   still in scope per the owner's explicit choice ("build it all, but sequence it") — the
   difference is *order*, not scope. This spec's implementation plan is sequenced so the
   strategy's Week 1–8 priorities are finished and reviewable first; `/partners/brokers`, both
   trade-lane pages + hub, and both location pages follow; the remaining 9 blog articles follow
   that (full blog spec is sub-project B, but its minimum viable plumbing — the content
   collection, `/blog` index, and `[slug]` route — is pulled forward here since it's a
   prerequisite for the one priority article).

This section amends, rather than replaces, everything below — §§1–8 stand except where
explicitly updated.

## 1. Goal

Phase 1 shipped 17 pages (home, about, contact, quote flow, 6 service pages, legal/utility
pages). The original design spec always intended a second layer — trade-lane, location, and
partner pages — as the mechanism for two things `docs/HANDOFF.md` calls out as unfinished:

1. **Winnable search rankings.** Competing for "freight forwarder" nationally takes 12+ months;
   trade-lane and JFK-area pages rank in 2–4 months (§3.1 of the original spec).
2. **A conversion path for two of the three target audiences.** Overseas agents and
   brokers/3PLs currently have no dedicated entry point — only importers do, via the service
   pages and homepage.

This sub-project builds exactly the pages the original spec scoped for this: 2 trade-lane
pages + 1 trade-lane hub, 2 location pages, 2 partner pages. Blog is a separate sub-project
(B), specced after this one lands.

---

## 2. Site architecture (from the locked spec — not renegotiated here)

```
/shipping/asia-to-usa                   Trade lane hub
/shipping/china-to-usa                  Trade lane
/shipping/vietnam-to-usa                Trade lane

/locations/jfk-freight-forwarder        Local landing page
/locations/new-york-freight-forwarder   Local landing page

/partners/agents                        Overseas agent partnership (audience 2)
/partners/brokers                       Broker & 3PL partnership (audience 3)
```

7 new pages total. No hub page for locations or partners — each stands alone, reached via
cross-links (see §5).

**Trade-lane scope note:** the original spec's `/shipping/asia-to-usa` + two country lanes is
built as-is. A third country-specific lane was considered during this round of planning; the
owner confirmed the business isn't narrowly limited to 2–3 Asian countries, so no third lane is
invented here. `/shipping/asia-to-usa` is written broadly enough (see §4) to cover the general
case, and a country-specific page is one data-file entry away whenever a specific lane is
worth its own page.

---

## 3. Navigation & footer changes

Per the locked spec (§5.1):

- **Header nav** gains a **"Trade Lanes"** entry, pointing at `/shipping/asia-to-usa`, alongside
  the existing Services / About / Contact. This means editing `NAV_LINKS` in
  `src/config/site.ts` — both `Header.astro` (mobile menu) and `Nav.astro` (desktop) render from
  that single array already, so one edit propagates everywhere.
- **Footer** gains a **"Trade Lanes"** column (China–USA, Vietnam–USA, hub) alongside the
  existing Services and Company columns. `Footer.astro`'s link lists are hardcoded arrays
  (confirmed by prior exploration) — add a new `tradeLaneLinks` array following the exact shape
  of the existing `serviceLinks` array.
- **Locations and partner pages get no header/footer slot.** They're reached through contextual,
  deliberate cross-links (the actual GEO lever per the spec's §9 "internal linking" row and
  HANDOFF §C4):
  - Both location pages link to/from the homepage and the `warehousing-distribution` and
    `domestic-trucking` service pages (both already reference the JFK-area address).
  - `/partners/agents` links to/from `/services/overseas-agent-network`.
  - `/partners/brokers` links to/from `/services/domestic-trucking` and
    `/services/warehousing-distribution` (the services a broker/3PL cares most about).
  - The trade-lane hub and both lane pages cross-link to relevant service pages
    (`ocean-freight`, `air-freight`, `customs-clearance`) and to each other.

---

## 4. Content plan (fact-safety per guarantee 3)

Every page below draws only on facts already published on the site
(`src/config/site.ts`, `src/data/services.ts`) or generic, industry-standard knowledge already
used in the existing service-page FAQs (CBP timelines, ISF deadlines, chargeable-weight
formulas). No invented company history, volume, named customers, or new credentials.

### `/shipping/asia-to-usa` (hub)
Positions the two specific lanes underneath it. Content: what "Asia to USA" freight forwarding
covers in general (mode choice, the ports/airports typically involved, customs basics), then
cards linking to the China and Vietnam lane pages. FAQ block reusing/adapting the existing
ocean/air FAQs where relevant (e.g., transit-time ranges already stated on the service pages).

### `/shipping/china-to-usa`
Real, publicly-known facts only: major origin ports/regions, typical ocean transit time to US
West/East coast (already stated on `services/ocean-freight`: 14–20 days West Coast, 28–38 days
East Coast), typical air transit time (already stated: 3–7 days), standard import documents
(commercial invoice, packing list, bill of lading — already listed on
`services/customs-clearance`). Framed per §0 as a lane the company handles well (direct carrier
service contracts, NVOCC status, in-house customs — all already true site-wide), not as an
exclusive specialty or the only lane served.

### `/shipping/vietnam-to-usa`
Same treatment, Vietnam-specific: notes Vietnam's role as a growing sourcing destination
(publicly known, not a claim about this company specifically), same transit-time and
documentation facts reused from the service pages, since transit times from major Southeast
Asian ports fall in the same published ranges. Same "strength, not exclusive lane" framing.

### `/locations/jfk-freight-forwarder` and `/locations/new-york-freight-forwarder`
Grounded entirely in the real, already-published address (153-04 Rockaway Blvd, Queens, NY,
11434) and its proximity to JFK and the Port of NY/NJ — both already stated on
`services/warehousing-distribution`. No invented local landmarks, no fabricated "X years serving
the NY market" (that number is `null` in `site.ts` and stays `null`). Content focuses on what a
JFK-area / NY-area importer actually needs to know: which of the six services are relevant
locally, drayage/warehousing proximity, and a locations-specific FAQ (e.g., "Do you have a
warehouse near JFK?" — already answered on the warehousing page, reused here).

### `/partners/agents`
Audience-tailored version of what's already on `/services/overseas-agent-network`: written to a
foreign freight-forwarder reading this page to evaluate a US destination partner, not to an
importer. Reuses the existing "one US partner instead of four vendors" framing and the existing
FAQ answers word-for-work-safe (no new claims). **Conversion path: the existing `/quote` form**
plus the published email/phone — no WhatsApp/WeChat section, since that number doesn't exist
yet (Part B of the handoff). A one-line note that overseas agents can reach the team by email
avoids implying a channel that doesn't work today.

### `/partners/brokers`
New audience angle not covered elsewhere yet: written to a US-based freight broker or 3PL
deciding whether to subcontract a leg of a shipment to Global Gate. Draws on the existing
trucking/warehousing/customs service copy (in-house customs, JFK-area warehousing, nationwide
trucking) reframed as "what we handle on your behalf," not new claims. **Conversion path: the
existing `/quote` form** and published phone/email, same as agents.

### Homepage positioning update (new, per §0)

Five files carry the current "Asia–America" framing and need coordinated rewrites so nothing
contradicts:

- `src/config/site.ts` — `tagline` ("International Freight Forwarder · NVOCC · IATA Member" —
  already lane-agnostic, no change needed) and `description` (currently names "Asia–America
  cargo" specifically — reworded to the broader framing). Add `wcaMember: boolean` to the
  `Credentials` interface (confirmed fact per §0.2).
- `src/components/home/Hero.astro` — H1 changes from "ASIA TO AMERICA, DOOR TO DOOR." to
  **"IMPORT. EXPORT.\nDOOR TO DOOR."** — keeps the existing amber-highlighted "DOOR TO DOOR."
  half intact (preserves the one piece of brand equity already built), swaps only the
  Asia-specific half for language that covers both directions of trade without naming a region.
  Subheading below it stays about what it already says (ocean/air/customs/warehousing/trucking,
  in-house, rate turnaround) since that copy was never Asia-specific. Badge pill gains "WCA
  Member" alongside the existing NVOCC/IATA/FMC text.
- `src/components/home/WhyUs.astro` — the 4 "reasons" are rewritten to the strategy's 4 pillars
  (speed as a system, one roof, verifiable not claimed, execution over lane), replacing
  "Asia–America specialists" as reason #1.
- `src/components/home/About.astro` — "Specialized in Asia–America cargo routing" bullet
  reworded to "any origin, any destination" framing; WCA membership added as a bullet.
- `src/pages/index.astro` — its local `description` const (used for the page's meta description)
  gets the same reword as `site.ts`.

No new facts invented here — every sentence still traces to something already true (NVOCC, IATA,
C-TPAT, WCA, in-house services, 24-hour turnaround) or to the owner's explicit positioning
decision (§0.1).

### Priority blog article + minimum blog plumbing (new, per §0)

Only enough blog infrastructure to publish one article now; the remaining 9 articles and any
blog-specific polish (author pages, tag pages, RSS, etc.) stay in sub-project B.

- `src/content.config.ts` — new `blog` collection, `type: 'content'`, Zod schema:
  `title, description, pubDate, dateModified, faqs: {question, answer}[], metaTitle,
  metaDescription`.
- `src/content/blog/choosing-a-us-freight-forwarding-partner.md` — the one article, written
  for the overseas-agent audience per the strategy's Week 5–8 slot, answer-first per HANDOFF
  §C6's writing rules, cross-linking to `/partners/agents` and
  `/services/overseas-agent-network`.
- `src/pages/blog/index.astro` — hub page, same pattern as `services/index.astro`, listing
  every published post (just the one, to start — it's data-driven off the collection, so the
  other 9 appear automatically once sub-project B adds them).
- `src/pages/blog/[slug].astro` — post template mirroring `ServiceLayout.astro`'s structure.
- `articleSchema()` — new function in `src/lib/schema.ts` (`Article` type + `dateModified`,
  per HANDOFF's Phase 2 schema list). The only genuinely new schema function this amendment
  adds.

---

## 5. Technical design

Mirrors the existing `services` implementation exactly (confirmed by prior exploration of
`src/pages/services/[slug].astro`, `src/layouts/ServiceLayout.astro`,
`src/components/ui/FAQAccordion.astro`, `src/lib/schema.ts`):

- **Data**: three new typed arrays — `src/data/trade-lanes.ts`, `src/data/locations.ts`,
  `src/data/partners-audience.ts` (named to avoid confusion with the existing, unrelated
  `src/data/partners.ts`, which holds carrier/association *logos* and stays untouched). Each
  entry reuses the existing `FAQ` type from `src/data/services.ts`.
- **Layouts/routes**: one shared layout + `[slug].astro` per content type, following
  `ServiceLayout.astro` structure (hero, breadcrumbs, bullets/body content, `FAQAccordion`,
  `CTABand` linking to `/quote`). The trade-lane hub (`/shipping/asia-to-usa`) is its own
  `index.astro` in a `src/pages/shipping/` directory, styled like `services/index.astro` but
  with body copy instead of a pure card grid, since it's a real content page, not just a
  directory.
- **Schema**: `serviceSchema()` in `src/lib/schema.ts` currently hardcodes
  `areaServed: { '@type': 'Country', name: SITE.serviceArea }` — it has no way to override that
  today. It needs a small signature extension: an optional `areaServed` input
  (`{ type: string; name: string }`, defaulting to the existing `Country`/`SITE.serviceArea`
  behavior so every current call site is unaffected). Trade-lane pages then pass their own
  `areaServed` (e.g. `{ type: 'Country', name: 'China' }`), per HANDOFF §C6: "`Service` with
  `areaServed` per trade lane." Locations and partner pages reuse `serviceSchema()` +
  `faqSchema()` unchanged, same as service pages today. `breadcrumbSchema()` continues to come
  free via the `breadcrumbs` prop on `BaseLayout`. This one small extension is the only change
  to existing code this sub-project makes — everything else is additive.
- **llms.txt**: add these 7 pages to `public/llms.txt`'s page index by hand (it's a static file
  with no generator, confirmed by prior exploration).
- **Sitemap/robots.txt**: no changes required — both are automatic for any new route.

---

## 6. Testing plan

Following this project's test-first convention and the existing `service-pages.test.ts` pattern:

1. New `tests/components/shipping-pages.test.ts`, `locations-pages.test.ts`,
   `partners-pages.test.ts` — `describe.each` over each new data array, asserting: exactly one
   `<h1>`, correct `Service`/`FAQPage` JSON-LD present, every FAQ question+answer visible in
   rendered HTML with JSON-LD stripped (no `<details open>`), breadcrumbs present, a link to
   `/quote`.
2. New `tests/components/blog-pages.test.ts` for the one priority article: one `<h1>`, `Article`
   JSON-LD present with `dateModified`, FAQ text visible pre-JS, breadcrumbs, cross-links to
   `/partners/agents`.
3. New `tests/unit/site-config.test.ts` additions (extending the existing file, not a new one):
   `wcaMember` follows the same true/false pattern as `ctpatCertified` — no placeholder values
   possible, so no new assertion strictly required, but confirm the existing recursive
   placeholder/"24/7" scan still passes with the new field present.
4. Extend the `expected` route whitelist in `tests/build/seo-invariants.test.ts` and the
   indexable-URL list in `tests/build/sitemap.test.ts` with the new routes (7 from §2, plus
   `/blog` and the one post).
5. Extend `tests/build/geo-files.test.ts` with assertions that `llms.txt` mentions the new pages
   — closing the one gap in GEO infra with no automatic enforcement today.
6. Existing component tests that hardcode homepage copy (`homepage.test.ts`, `hero.test.ts`) will
   need their assertions updated to match the new positioning copy — check these before assuming
   the reworded Hero/WhyUs/About pass as-is.
7. Write each test file before its corresponding pages; watch it fail for the right reason, then
   implement.

## 6a. Execution order (per §0.3 sequencing)

**Phase 1 — strategy Week 1–8 priorities, built first:**
1. Homepage positioning update + WCA fact (§4 "Homepage positioning update").
2. `/partners/agents` page.
3. Minimum blog plumbing + the one priority article, `choosing-a-us-freight-forwarding-partner`.

**Phase 2 — remainder of this spec:**
4. `/partners/brokers`.
5. `/shipping/asia-to-usa` hub + `/shipping/china-to-usa` + `/shipping/vietnam-to-usa`.
6. `/locations/jfk-freight-forwarder` + `/locations/new-york-freight-forwarder`.

**Phase 3 — sub-project B (specced separately when Phase 1–2 land):**
7. Remaining 9 blog articles, using the plumbing built in Phase 1.

Tests are written before each page per §6; `npm test` + `npm run test:build` stay green after
every phase, not just at the end, so Phase 1 alone is already a fully working, shippable slice
if priorities change again.

## 7. Verification

- `npm test` and `npm run test:build` green after each page type (trade-lanes, then locations,
  then partners), not just at the end.
- Manual JS-disabled check on one page of each new type once all three are built.
- `npm run test:e2e` at the end to confirm the nav/footer changes didn't break the existing
  quote flow.

## 8. Out of scope for this sub-project

- The remaining 9 blog articles and any blog-specific polish beyond the one priority post
  (sub-project B, specced separately once this lands).
- A dedicated "partnership inquiry form" for partner pages — deferred; partner pages route to
  the existing `/quote` form instead (owner decision, 2026-09-11).
- WhatsApp/WeChat contact channel for overseas agents — not built until the owner supplies a
  number (Part B of the handoff).
- Any carrier/association *logo* image for WCA — added as text only (§0.2); a logo can be added
  later if the owner supplies an actual image asset.
- Part D (GA4/GTM/analytics), remaining Part B facts (FMC/IATA numbers, hours, founded year,
  testimonials, real photos), and deployment/DNS/account creation — all unchanged, all still the
  owner's separate steps.
