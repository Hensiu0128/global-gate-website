# Global Gate Logistics — Website Rebuild Design Spec

**Date:** 2026-08-09
**Owner:** Andy (andy@mashgroupe.com)
**Source site being replaced:** https://globalgate-drgu8vae.manus.space/
**Target domain:** https://global-gate.us

---

## 1. Goal

Replace the current Manus-hosted single-page site with a fast, crawlable, multi-page website that:

1. **Ranks in Google** for freight forwarding terms, nationally and in the NY/JFK area.
2. **Gets cited by AI search** — ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews.
3. **Converts visitors into quote requests** — the current site captures zero leads.

Priority order when goals conflict: **conversion > SEO > GEO > visual fidelity.**

---

## 2. Current state analysis

### 2.1 What the existing site is

A React single-page application built on Manus. One route (`/`) plus a 404. All content is rendered in the browser by a 354 KB JavaScript bundle. The served HTML body is an empty `<div id="root">`.

Sections in order: Header → Hero → About → Services (6 cards) → Why Choose Us (4 items) → Contact → Footer. Navigation uses in-page anchor scrolling.

### 2.2 Critical defects found

| # | Defect | Consequence |
|---|---|---|
| D1 | Contact form discards submissions — shows a success message, sends nothing | 100% of form leads lost |
| D2 | Body content requires JavaScript to render | GPTBot, PerplexityBot, ClaudeBot see a blank page — invisible to AI search |
| D3 | Single page | Can only rank for one topic; ~1/20th the ranking surface of a proper site |
| D4 | No social proof of any kind | No testimonials, client logos, carrier logos, or facility photos |
| D5 | Credentials claimed but unverifiable | "NVOCC & IATA Member" stated with no license numbers |
| D6 | `© 2024` in footer | Reads as an abandoned business (current year is 2026) |
| D7 | Social links point to `facebook.com` / `instagram.com` homepages | Dead links erode credibility |
| D8 | `24/7 Customer Support` stat is false — business hours only | Unmet promise; actively damaging |
| D9 | Primary CTA hidden behind hamburger on mobile; no tap-to-call | Loses mobile callers, the highest-intent segment |
| D10 | Generic H1: "GLOBAL FREIGHT SOLUTIONS YOU CAN TRUST" | No differentiation; real advantage buried in 20px subtext |
| D11 | No conversion path for overseas agents or brokers/3PLs | Two of three target audiences have no entry point |
| D12 | "Get a Free Quote" CTA scrolls to a generic message textarea | Promise/destination mismatch at the point of conversion |

### 2.3 What is worth keeping

The visual identity is strong and above industry average. Preserve: navy/amber palette, Barlow Condensed + Source Sans 3 typography, the diagonal hero treatment, the amber badge pill, the service card layout, and the overall dark/light section rhythm.

---

## 3. Locked decisions

| Decision | Choice |
|---|---|
| Domain | `global-gate.us` (owned) |
| Structure | Multi-page + blog |
| Hosting | Vercel |
| Contact form | Emails to `Op01@global-gate.us` |
| Target audiences | US importers/exporters · Overseas cargo agents · Freight brokers & 3PLs |
| Geography | Nationwide US, reached via winnable trade-lane and JFK-area pages |
| Design fidelity | Same look, better structure |
| Credentials to publish | FMC/NVOCC number, IATA number, C-TPAT |
| Blog | 8–10 articles written as part of the build |
| Accounts to set up | Google Search Console, Google Analytics, Google Business Profile |
| Hero direction | **Option A — route specificity** |
| Business hours | Business hours only (exact hours TBC — see §16) |

### 3.1 Flagged concerns, acknowledged and proceeding

- **Bing Webmaster Tools was not selected.** ChatGPT's web search relies heavily on Bing's index. Excluding it materially weakens the ChatGPT-visibility goal. Included in the plan as optional; will be skipped if declined.
- **"Nationwide" as the sole target is slow.** Competing directly with Flexport/Expeditors/DHL for head terms takes 12+ months. Mitigated by building trade-lane and JFK-area pages that rank in 2–4 months and pass authority to national pages. Nationwide remains the goal.

---

## 4. Technology stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Astro** | Outputs static HTML with zero JS by default — every crawler reads full content instantly. Best-in-class Core Web Vitals. |
| Styling | **Tailwind CSS** | The source site already uses Tailwind; enables precise design matching. |
| Content | **Markdown via Astro Content Collections** | Blog posts are plain text files — maintainable by a non-technical owner. |
| Interactivity | Vanilla JS islands | Mobile menu, multi-step form, FAQ accordions. Small and progressive — page works without it. |
| Forms | **Resend** (transactional email) via Vercel serverless function | Reliable delivery, free tier sufficient, full control over spam handling. |
| Spam protection | Honeypot field + timing check + Cloudflare Turnstile | No CAPTCHA friction for real users. |
| Images | Astro `<Image>` → AVIF/WebP, responsive `srcset`, lazy below fold | Speed is a ranking factor. |
| Hosting | **Vercel** | Chosen by owner. Git-connected auto-deploy, free SSL, global CDN. |
| Analytics | Google Analytics 4 | Chosen by owner. |

**Rejected:** Next.js (ships React runtime; unnecessary weight for a brochure site). Hand-written HTML (35 pages × manual header/footer edits is unmaintainable).

---

## 5. Site architecture

```
/                                       Home
/about                                  About
/contact                                Contact
/quote                                  Request a Quote  (primary conversion page)

/services                               Services hub
/services/ocean-freight                 Ocean FCL & LCL
/services/air-freight                   Air import & export
/services/warehousing-distribution      Warehousing
/services/customs-clearance             Customs brokerage
/services/domestic-trucking             Trucking & drayage
/services/overseas-agent-network        Agent network

/shipping/china-to-usa                  Trade lane
/shipping/vietnam-to-usa                Trade lane
/shipping/asia-to-usa                   Trade lane hub

/locations/jfk-freight-forwarder        Local
/locations/new-york-freight-forwarder   Local

/partners/agents                        Overseas agent partnership  (audience 2)
/partners/brokers                       Broker & 3PL partnership    (audience 3)

/blog                                   Blog index
/blog/<slug>                            8–10 articles

/privacy-policy
/terms
/404

/sitemap-index.xml                      auto-generated
/robots.txt
/llms.txt
```

**Total: ~35 URLs.** Every page has a unique title, meta description, H1, and canonical URL.

### 5.1 Navigation

- **Header:** Services (dropdown) · Trade Lanes · About · Blog · Contact · **phone number** · `[Get a Quote]` button
- Phone number and quote CTA are visible at all breakpoints — never collapsed into the hamburger
- **Mobile:** sticky bottom bar with tap-to-call and Get a Quote
- **Footer:** four columns — Services · Trade Lanes · Company · Contact + credentials

---

## 6. Design system

Extracted from the source site and formalized as tokens.

### 6.1 Color

| Token | Value | Use |
|---|---|---|
| `navy-900` | `#0A1628` | Primary dark sections, header |
| `navy-800` | `#1E3A5F` | Card backgrounds, secondary dark |
| `navy-950` | `#060E1A` | Footer |
| `amber-500` | `#F59E0B` | Primary CTA, icon chips |
| `amber-400` | `#FBBF24` | Accent text, headline highlight, link hover |
| `slate-300/400/500/600` | Tailwind defaults | Body text on dark / light |
| `white` | `#FFFFFF` | Light section backgrounds |

Section rhythm alternates dark → light → dark to create visual separation.

### 6.2 Typography

| Role | Family | Weights |
|---|---|---|
| Display (headings, buttons, stats) | **Barlow Condensed** | 400, 600, 700, 800 |
| Body | **Source Sans 3** | 300, 400, 500, 600 |

- H1: `clamp(3rem, 8vw, 5.5rem)`, weight 800, line-height 0.95, letter-spacing −0.01em
- Buttons/nav: uppercase, letter-spacing 0.08em
- Fonts self-hosted with `font-display: swap` (removes a third-party render-blocking request; improves speed and privacy)

### 6.3 Components to build

`Header` · `MobileStickyBar` · `Hero` · `QuoteWidget` · `TrustBar` · `StatsBar` · `ServiceCard` · `ServiceGrid` · `TestimonialCard` · `LogoStrip` · `FAQAccordion` · `CTABand` · `QuoteForm` (multi-step) · `ContactInfoCard` · `Footer` · `Breadcrumbs` · `ArticleCard` · `SEOHead` · `Schema`

---

## 7. Hero specification (Option A)

```
  ▸ NVOCC & IATA MEMBER · FMC #______            ← amber badge pill

  ASIA TO AMERICA,
  DOOR TO DOOR.                                  ← "DOOR TO DOOR." in amber-400

  Ocean FCL & LCL, air freight, customs clearance, JFK warehousing,
  and nationwide trucking — handled in-house by one team.
  Rates back in 24 hours.

  [ GET MY RATE → ]    [ 📞 631-596-5591 ]

  ┌──────────────────────────────────────────────────────┐
  │  20+ YEARS   │  50+ GLOBAL      │  24-HR QUOTE       │  ← stats bar
  │  EXPERIENCE  │  PARTNERS        │  TURNAROUND        │
  └──────────────────────────────────────────────────────┘
```

Changes from current hero:
- Headline rewritten for specificity; keeps identical font, size, animation, and amber-highlight treatment
- Secondary CTA changes from "Our Services" (low intent) to a tap-to-call phone button
- **Stat 3 replaced:** `24/7 Customer Support` → `24-Hour Quote Turnaround` (removes the false claim; see §16 for confirmation)
- Hero height reduced from `min-h-screen` to `~85vh` so the next section peeks above the fold
- FMC license number added to the badge once supplied

---

## 8. Conversion design

### 8.1 Quote form (replaces the broken contact form)

Two steps. Step 1 collects shipment facts using dropdowns; step 2 collects contact details. Progressive disclosure — the visitor sees three fields, not eleven.

**Step 1 — Shipment**
- Mode: Ocean FCL / Ocean LCL / Air / Not sure
- Origin: country or port (searchable)
- Destination: US city or ZIP
- Cargo: weight + volume, or container count
- Ready date: date picker
- Commodity: short text (optional)

**Step 2 — Contact**
- Name · Company · Email · Phone · Notes (optional)

Beside the submit button: **"Rates back within 24 business hours."**

**Delivery:** Resend → `Op01@global-gate.us`, subject line pre-formatted with route and mode for fast triage (e.g. `[QUOTE] Ocean LCL · Ningbo → Chicago · ready Sep 2`). Auto-reply confirmation to the sender.

**Failure handling:** if the Resend call fails, the serverless function writes the submission to Vercel KV and returns success to the visitor (never show a failure that makes them retype). A daily digest of any queued-but-undelivered submissions is emailed to the owner. This guarantees defect D1 cannot recur silently.

**Placement:** compact 3-field widget in the hero (origin → destination → email) that hands off to the full form on `/quote`; full form on `/quote` and `/contact`; CTA band between every major section site-wide.

### 8.2 Trust stack

Placed directly beneath the hero and repeated on service pages:

- **Credentials bar** — FMC/OTI license #, IATA #, C-TPAT certified, NVOCC bonded
- **Carrier / airline / association logo strip** — including WCA or JCtrans membership if held
- **Testimonials** — 3–5 with real name, title, and company. Anonymous quotes are excluded; they do not convert.
- **Facility photos** — warehouse, dock, team. Replaces stock imagery.
- **Named contact** — photo and name of whoever handles quotes, replacing the `Op01@` alias as the human-facing point of contact.

### 8.3 Audience-specific paths

| Audience | Entry point | Conversion action | Channel |
|---|---|---|---|
| US importers/exporters | Home, service pages, trade-lane pages | Quote form | Phone, email, form |
| Overseas cargo agents | `/partners/agents` | Partnership inquiry form | **WhatsApp / WeChat** + email (US phone hours are unusable from Asia) |
| Brokers & 3PLs | `/partners/brokers` | Capability inquiry | Phone, email |

### 8.4 Other conversion fixes

- Header phone number, always visible; sticky tap-to-call bar on mobile
- CTA band between every major section
- FAQ accordion on every service page (handles objections; doubles as AI-citation fuel)
- Shipment tracking link in the header for existing clients
- Footer year auto-generated — `© 2024` can never recur
- Social links corrected to real profiles, or removed entirely

---

## 9. SEO foundation

| Item | Implementation |
|---|---|
| Rendering | Static HTML at build time — no JS required for content |
| Headings | Exactly one `<h1>` per page; strict `h2`/`h3` hierarchy |
| Titles / descriptions | Unique, hand-written per page |
| Canonicals | Absolute, on `https://global-gate.us` |
| Sitemap | `@astrojs/sitemap`, auto-generated, submitted to Search Console |
| robots.txt | Allows all major search and AI crawlers by name |
| Internal linking | Services ↔ trade lanes ↔ blog ↔ locations, contextual and deliberate |
| Images | AVIF/WebP, responsive, explicit dimensions (no layout shift), descriptive alt text |
| Semantic HTML | `<header> <nav> <main> <article> <section> <footer>`, ARIA where needed |
| Breadcrumbs | Visible + `BreadcrumbList` schema on all inner pages |
| URLs | Lowercase, hyphenated, no trailing-slash inconsistency |
| Performance target | Lighthouse ≥ 95 on all four categories, mobile |
| Redirects | `www.global-gate.us` → `https://global-gate.us` (301). If `global-gate.us` currently serves any pages, each existing URL is 301'd to its closest new equivalent so no accumulated ranking is lost — audited before launch. |

### 9.1 Structured data (JSON-LD)

| Schema | Where |
|---|---|
| `Organization` + `LocalBusiness` | Site-wide, with full NAP, hours, `sameAs`, license identifiers |
| `Service` | Each service page |
| `FAQPage` | Every page carrying an FAQ block |
| `Article` + `Author` | Blog posts |
| `BreadcrumbList` | All inner pages |
| `WebSite` + `SearchAction` | Homepage |

---

## 10. GEO layer (AI search)

AI engines quote sources rather than rank them. The site is built to be quotable.

| Tactic | Implementation |
|---|---|
| **No-JS content** | Already guaranteed by static rendering — the foundational requirement |
| **`llms.txt`** | Root-level plain-text summary of the company, services, credentials, and page map |
| **Crawler permissions** | Explicit `Allow` for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Applebot-Extended, Bingbot |
| **Answer-first writing** | Every section opens with a self-contained factual sentence. Models extract sentences, not paragraphs — a sentence that needs surrounding context is never quoted. |
| **FAQ blocks** | On every service, trade-lane, and location page, with `FAQPage` schema |
| **Verifiable entity facts** | Published FMC/IATA/C-TPAT numbers turn claims into verifiable identity — a genuine differentiator, as most competitors omit these |
| **NAP consistency** | Byte-identical name, address, and phone across site copy, JSON-LD, and Google Business Profile |
| **Comparison & definition content** | "LCL vs FCL", "What is an NVOCC" — the formats AI engines cite most |
| **Freshness signals** | `dateModified` on all pages; blog published on a real cadence |

---

## 11. Blog content plan

8–10 articles targeting real questions from the three audiences. Answer-first structure, 1,200–2,000 words, FAQ block and `Article` schema each.

1. LCL vs FCL: which is cheaper for your shipment size?
2. How long does customs clearance take at JFK?
3. What documents do you need to import from China to the USA?
4. What is an NVOCC, and why does it matter to your shipment?
5. Ocean vs air freight: a real cost and transit comparison
6. Understanding freight quotes: every charge explained
7. How to choose a US freight forwarding partner (for overseas agents)
8. Importing from Vietnam to the USA: a complete guide
9. What C-TPAT certification means for your cargo
10. Demurrage and detention: how to avoid the charges

Each links to relevant service and trade-lane pages.

---

## 12. Deployment & infrastructure

| Item | Setup |
|---|---|
| Version control | Git repository, GitHub remote |
| Hosting | Vercel, connected to GitHub — every push auto-deploys |
| Domain | `global-gate.us` DNS pointed at Vercel; apex + `www` with `www` → apex redirect |
| SSL | Automatic via Vercel |
| Preview builds | Every branch gets a preview URL for review before going live |
| Email | Resend, with domain verification (SPF/DKIM) on `global-gate.us` |
| Secrets | Vercel environment variables — never committed |

---

## 13. Search engine registration

Delivered as a step-by-step guide written for a non-technical reader.

1. **Google Search Console** — verify domain, submit sitemap, confirm indexing
2. **Google Analytics 4** — install, configure form-submission and click-to-call as conversion events
3. **Google Business Profile** — create/claim, with exact recommended primary category (`Freight forwarding service`), secondary categories, description, services, hours, and photos
4. *(Optional, recommended)* **Bing Webmaster Tools** — import from Search Console in one click; required for reliable ChatGPT visibility
5. **Directory consistency** — matching NAP on key logistics directories

---

## 14. Build phases

| Phase | Deliverable |
|---|---|
| **1** | Project setup, design system, assets downloaded, Header/Footer, Home, About, Contact, `/quote`, 6 service pages, working multi-step quote form, trust stack, all SEO/GEO plumbing, deployed live on `global-gate.us` |
| **2** | Blog system + 8–10 articles, 3 trade-lane pages, 2 location pages, 2 partner pages |
| **3** | Search Console + Analytics + Google Business Profile setup, sitemap submission, conversion tracking, monitoring guide, owner handbook |

The site is live and fully functional at the end of Phase 1.

---

## 15. Assets to migrate

Downloaded from the source site and re-optimized locally (no dependency on Manus CDN):

| Asset | Source |
|---|---|
| Hero background | `hero-bg-e8neDCQ2rrW9uCEuhCo6Ya.webp` |
| Ocean service image | `services-ocean-TbSpE4rwyrutTg32rDbfQd.webp` |
| Air service image | `services-air-4UuLQhVnywL6ABbMqyMVhL.webp` |
| Warehouse service image | `services-warehouse-659sFAdPczCmXA7oKQYLsg.webp` |
| Logo | `/manus-storage/gg-logo-black_7924a5e7.png` |

All existing body copy is carried over and expanded. The three service images are stock and should be replaced with real facility photos when available (§16).

---

## 16. Facts needed from owner

Build proceeds with clearly-marked placeholders; none of these block Phase 1.

| # | Item | Blocks |
|---|---|---|
| F1 | FMC / NVOCC license number | Trust bar, hero badge, schema |
| F2 | IATA membership number | Trust bar, schema |
| F3 | C-TPAT certification details | Trust bar |
| F4 | **Exact business hours** | Schema, GBP, contact page |
| F5 | **Is a 24-hour quote turnaround accurate?** If not, the stat and hero line change | Hero, quote form |
| F6 | Year founded | Schema, "Since ____" stat |
| F7 | Real Facebook / Instagram URLs, or confirmation to remove | Footer, `sameAs` schema |
| F8 | 3–5 testimonials with name, title, company | Trust stack |
| F9 | Carrier / airline / association logos and memberships (WCA, JCtrans?) | Logo strip |
| F10 | Real facility and team photos | Replaces stock imagery |
| F11 | WhatsApp / WeChat contact for overseas agents | `/partners/agents` |
| F12 | Named quote contact (person + photo) | Contact, trust stack |
| F13 | Shipment tracking system URL, if one exists | Header tracking link |
| F14 | Confirmation that the 631 area code is correct for a Queens address | NAP consistency, local SEO |

---

## 17. Success criteria

**Launch (end of Phase 1)**
- Site live on `https://global-gate.us` with valid SSL
- Full text content visible with JavaScript disabled
- Test quote submission arrives at `Op01@global-gate.us` within 60 seconds
- Lighthouse mobile ≥ 95 across all four categories
- Zero broken links; zero structured-data errors in Google's Rich Results Test
- Phone number reachable in one tap on mobile from every page

**30 days**
- All ~35 pages indexed in Google Search Console
- Google Business Profile live and verified
- Analytics recording form submissions and click-to-call as conversions

**90 days**
- Ranking on page 1 for at least three JFK/NY-area or trade-lane terms
- Site cited by at least one AI engine for a brand or trade-lane query
- Measurable inbound quote requests through the form

---

## 18. Out of scope

- Shipment tracking portal / customer login
- Live rate calculator or instant pricing
- CRM or TMS integration
- Multi-language versions (revisit after launch — likely valuable for Chinese)
- Paid advertising
- Email marketing automation
- Migrating or preserving the Manus site (it is replaced entirely)
