# Global Gate Logistics — Website Handoff

**Repo:** this folder · **Branch:** `feat/website-rebuild` · **Merge base:** `1e7635d` · **Commits:** 65
**Target domain:** `https://global-gate.us` · **Status:** built and tested locally, **not yet deployed**
**Handoff date:** 2026-09-12 (updated — see §1 and §C6 for what changed since 2026-09-11)

---

## 0. Who this is for

You are taking over a freight-forwarding website that is **fully built but not yet live**. This document tells you three things:

1. **What exists and is verified** — so you don't rebuild it.
2. **What is deliberately missing** — and why each gap was left open rather than filled with a guess.
3. **What to build next** — the two remaining work packages, specified in enough detail to execute:
   - **Package A (GEO):** make the site findable and *quotable* by ChatGPT, Gemini, Perplexity, Claude, Copilot and the rest.
   - **Package B (Measurement):** GA4 + Search Console + full user-journey capture, and the analysis loop that turns that data into booked freight.

Read §1 and §2 before you touch anything. The rest can be read as you need it.

---

## 1. Thirty-second status

| | |
|---|---|
| Pages building | **23** (19 indexable + 404 + 3 noindex form-confirmation pages) |
| Tests passing | **323** — 260 unit/component, 60 build-output, 3 end-to-end browser |
| Working tree | Clean, everything committed |
| Git remote | **None configured** — the code exists only on this machine |
| Deployed | **No.** No Vercel project, no DNS change, no Resend account |
| Analytics | **None installed.** Zero tracking scripts ship today |
| Final whole-branch review (Phase 1 plan) | **Not run.** Every individual task passed its own review; the one cross-cutting pass at the end was cancelled |
| Final whole-plan review (trade-lanes/locations/partners plan) | **Run**, 2026-09-12. 5 findings fixed — see `.superpowers/sdd/2026-09-11-shipping-locations-partners/final-fix-report.md` |

### What was wrong with the old site, and what this build fixed

The previous site (`globalgate-drgu8vae.manus.space`) had two structural failures that made every other optimization pointless:

1. **It rendered entirely in JavaScript.** AI crawlers — GPTBot, ClaudeBot, PerplexityBot — do not execute JavaScript. They saw a blank page. So did any search engine on a slow crawl budget.
2. **Its contact form silently discarded every lead.** It showed a success message that was never earned.

Both are fixed structurally, not cosmetically. The new site ships as plain HTML with **zero client-side JavaScript required to read any content**, and the quote form reports success **only after the email service confirms delivery**. Ten other catalogued defects (stale copyright year, dead social links, a false "24/7 support" claim, hidden mobile call button, generic headline, and more) are also resolved.

**These two properties are the foundation of everything in Package A and B. Do not break them.** §2 explains how they are protected.

---

## 2. Hard rules — do not break these

These are not style preferences. Each one is enforced by an automated test that will fail the build if violated, and each exists because breaking it causes a specific, real harm.

| # | Rule | Why it exists | Enforced by |
|---|---|---|---|
| 1 | **All page content must be readable with JavaScript disabled** | AI crawlers don't run JS. This is the single reason the site can be cited by ChatGPT/Claude/Perplexity at all | `tests/build/seo-invariants.test.ts` |
| 2 | **The quote form must never show success unless a lead was actually delivered** | This was the old site's worst defect — invisible lost revenue | `tests/unit/quote-endpoint.test.ts`, `tests/e2e/quote-flow.spec.ts` |
| 3 | **Never publish a business fact that hasn't been confirmed** | No invented license numbers, no anonymous testimonials, no carrier logos without a real relationship. Fabricated credentials in machine-readable markup is how a business gets flagged — and a carrier logo without a contract is a legal exposure | `tests/unit/site-config.test.ts` |
| 4 | **Every company fact comes from `src/config/site.ts`** | One edit updates the visible page, the structured data, and `llms.txt` together. Facts that drift between those three are worse than facts that are missing | `tests/build/geo-files.test.ts` |
| 5 | **The privacy policy must describe only what the site actually does** | It currently states, truthfully, that there is zero analytics and zero tracking. **The moment you add GA4, this text and its test must change in the same commit** | `tests/components/utility-pages.test.ts` |
| 6 | **Never write "24/7" anywhere** | The business runs business hours. The old site claimed 24/7 | `tests/build/seo-invariants.test.ts` |
| 7 | **Never send personal data to analytics** | Names, emails, phone numbers must never reach GA4. It violates Google's terms and can get the property purged | Not yet enforced — **add a test when you build Package B** |

Run `npm test`, `npm run test:build`, and `npm run test:e2e` before any deploy. All three must pass.

---

## PART A — Ship what already exists

Nothing in Packages A or B matters until the site is live. This takes roughly **2–3 hours**, most of it waiting for DNS.

None of these steps were performed during the build, deliberately: they require the owner's own accounts, payment methods, and domain control. Do them in order.

### A1. Email delivery (Resend)

The quote form sends through [Resend](https://resend.com). Without this, the form returns an honest error with a phone-number fallback — it never pretends to succeed — but no lead email arrives.

1. Create a Resend account (free tier covers 3,000 emails/month — far more than this site will generate).
2. Add and verify the domain `global-gate.us`. Resend gives you **SPF** and **DKIM** DNS records to add at whoever hosts the domain's DNS. Verification usually completes in minutes, occasionally hours.
3. Create an API key. Copy it once — it is not shown again.

You now have three values for step A3:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | the key from step 3 |
| `QUOTE_FROM_EMAIL` | a verified sender on the domain, e.g. `website@global-gate.us` |
| `QUOTE_TO_EMAIL` | `Op01@global-gate.us` |

> **Why a separate `from` address:** sending as `Op01@` risks the operations inbox being flagged for automated mail. A dedicated `website@` sender keeps deliverability problems away from the address humans reply to.

### A2. Git remote (GitHub)

The code currently exists on one laptop with no backup.

1. Create an empty repository at [github.com/new](https://github.com/new). Do **not** initialize it with a README, `.gitignore`, or license — this project already has all three, and an initialized repo would conflict with the push below.
2. Push this code to it:

```bash
git remote add origin <the URL GitHub gives you>
git checkout main
git merge feat/website-rebuild
git push -u origin main
```

(If the GitHub CLI (`gh`) is installed and authenticated, `gh repo create global-gate-website --private --source=. --remote=origin` does step 1 and adds the remote in one command — but it is not required; the plain `git` steps above work with nothing extra installed.)

`main` already fast-forwards cleanly to `feat/website-rebuild` (confirmed 2026-09-12, 0 divergent commits), so the merge above is a simple fast-forward, not a real merge with conflicts to resolve. Vercel deploys from `main`.

### A3. Hosting (Vercel)

1. Sign in to [vercel.com](https://vercel.com) with the GitHub account from A2.
2. **Add New → Project →** import the repository. Vercel auto-detects Astro; accept the defaults.
3. Before the first deploy, add the three environment variables from A1 under **Settings → Environment Variables**, applied to Production, Preview, and Development.
4. Deploy. You get a `*.vercel.app` URL. **Test the quote form there first** — confirm a real email lands at `Op01@global-gate.us` — before pointing the domain.

### A4. Domain (`global-gate.us`)

1. In Vercel: **Settings → Domains →** add `global-gate.us` and `www.global-gate.us`.
2. Vercel shows the DNS records to create (typically an `A` record for the apex and a `CNAME` for `www`). Add them wherever `global-gate.us` DNS is managed. Keep the Resend SPF/DKIM records from A1 — they are separate and must both survive.
3. Propagation is usually under an hour. SSL is automatic.

`www` → apex redirect and all security headers are already configured in [vercel.json](../vercel.json). Nothing to do.

### A5. Launch verification

Do not skip this. Tick every line.

- [ ] `https://global-gate.us` loads with a valid padlock
- [ ] `https://www.global-gate.us` redirects to the apex
- [ ] Submit a real quote — email arrives at `Op01@global-gate.us` within 60 seconds
- [ ] **Disable JavaScript in the browser and reload the homepage.** All text, navigation, and the quote form must still work end-to-end. *(This is Hard Rule 1. If it fails, stop and fix it — the entire AI-search strategy depends on it.)*
- [ ] Tap the phone number on a real phone — it dials
- [ ] `https://global-gate.us/robots.txt`, `/llms.txt`, and `/sitemap-index.xml` all load
- [ ] Run the homepage and one service page through [Google Rich Results Test](https://search.google.com/test/rich-results) — zero errors
- [ ] Lighthouse mobile ≥ 95 on all four categories
- [ ] `curl -I https://global-gate.us/images/logo.png` returns `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` *(this is the one config that could not be verified locally)*

---

## PART B — Facts still owed by the business owner

The site was built to handle missing facts **honestly**: each is `null` or an empty list, and the corresponding section simply does not render. Nothing needs to be switched on — supplying the value in the data file makes the section appear.

All values live in [src/config/site.ts](../src/config/site.ts) unless noted.

| Fact | Field | Impact when supplied |
|---|---|---|
| **FMC / NVOCC license number** | `credentials.fmcNumber` | **Highest-value item on this list.** See the note below |
| **IATA agent code** | `credentials.iataNumber` | Same — verifiable identity |
| **Exact business hours** | `hours.schema` + `hours.display` | Google Business Profile, contact page, structured data |
| **Year founded** | `founded` | "Since ____" trust signal, structured data |
| Real Facebook / Instagram / LinkedIn URLs | `social.*` | Footer links, `sameAs` entity graph (see §C4) |
| 3–5 testimonials with **real name, title, company** | `src/data/testimonials.ts` | Social proof block. Anonymous quotes were judged worse than none |
| Carrier / association memberships (WCA, JCtrans?) | `src/data/partners.ts` | Logo strip. Left empty — showing a carrier logo without a relationship is a legal risk |
| Real facility, warehouse, and team photos | `public/images/` | Current images are stock. Replace by overwriting the same filename |
| WhatsApp / WeChat for overseas agents | new field | Needed for the partner pages in §C6 |
| Named quote contact (person + photo) | new field | Measurably lifts form completion |
| Tracking system URL, if one exists | new field | Header link |
| Confirm `631` area code is right for a Queens address | verify | NAP consistency — see §C4 |

> ### Why the FMC and IATA numbers matter more than they look
>
> The FMC publishes a **public licensee database**. When you publish your license number, an AI engine (or a cautious importer) can cross-reference it against `fmc.gov` and confirm the company is real and licensed. Most competitors publish nothing. This converts *"we are a licensed NVOCC"* — an unverifiable marketing claim that no AI model will repeat with confidence — into a **checkable fact**, which is precisely the kind of thing these models cite.
>
> **One exception: do not publish the C-TPAT SVI number.** That identifier is intended for sharing with specific business partners, not for public posting. Publish the *status* ("C-TPAT certified"), which the site already does.

---

## PART C — GEO: getting cited by ChatGPT, Gemini, Perplexity, and Claude

### C1. What "GEO" actually is, in one paragraph

Search engines **rank** pages; you compete for position. AI answer engines **quote** sources; you compete to be the sentence the model reproduces. The difference changes what you build. A model extracts *self-contained factual sentences* — a sentence that only makes sense with the paragraph around it will never be quoted. It prefers pages where the answer appears immediately, structured data confirms the facts, and the claims can be corroborated somewhere else on the web. GEO is: be readable without JavaScript, answer the question in the first sentence, make your identity verifiable, and be corroborated off-site.

### C2. Already done — do not redo this

| Built | Where |
|---|---|
| Static HTML, zero JS required to read content | Architecture-wide, test-enforced |
| `robots.txt` explicitly allowing 12 crawlers including GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Applebot-Extended, CCBot | [public/robots.txt](../public/robots.txt) |
| `llms.txt` — plain-text company summary, service map, and page index for AI agents | [public/llms.txt](../public/llms.txt) |
| JSON-LD: Organization, LocalBusiness, WebSite, BreadcrumbList, Service, FAQPage | [src/lib/schema.ts](../src/lib/schema.ts) |
| Answer-first copy throughout; 24 FAQ entries with `FAQPage` schema | [src/data/services.ts](../src/data/services.ts) |
| XML sitemap, 13 indexable URLs, correctly excluding noindex pages | auto-generated |
| Canonical URLs on the apex domain; one `<h1>` per page; every image has alt text | test-enforced |

### C3. How each engine actually reaches you

This table is the map for everything that follows. Different engines need different work.

| Engine | How it finds you | What moves the needle |
|---|---|---|
| **ChatGPT Search** | `OAI-SearchBot` / `GPTBot` crawl, **backed substantially by Bing's index** | Being indexed in **Bing** — see §C5. This is the current biggest gap |
| **Google AI Overviews / Gemini** | Googlebot + `Google-Extended`; AI Overviews draw from the ordinary Google index | Classic SEO still is the lever. Ranking well = being summarized |
| **Perplexity** | `PerplexityBot`, its own index, plus live retrieval | Clean structure, citable sentences, fresh `dateModified`, third-party corroboration |
| **Claude** | `ClaudeBot` + live web search | Static HTML + clear factual sentences. Already largely satisfied |
| **Microsoft Copilot / DuckDuckGo** | Bing's index | Same as ChatGPT — Bing |
| **Apple / Meta AI** | `Applebot`, `meta-externalagent` | Allowed via the wildcard rule; low priority |

> **A correction worth knowing:** `robots.txt` already has `User-agent: * / Allow: /`, so **every** crawler is permitted, including ones not named individually. Adding more named blocks (`Applebot`, `meta-externalagent`, `DuckAssistBot`, `Perplexity-User`) changes nothing functionally — it is documentation of intent, not a switch. Don't spend time there thinking it unlocks anything.

### C4. Entity grounding — the highest-leverage GEO work

An AI engine will only state a fact about a company confidently if it can corroborate it. Corroboration comes from **agreement across independent sources**. Your job is to make the same facts appear, byte-identically, everywhere.

**NAP consistency** — the company **N**ame, **A**ddress, and **P**hone must be *character-for-character identical* across:

- the website copy
- the JSON-LD structured data (already driven from one file)
- `llms.txt` (already driven from the same file)
- Google Business Profile
- the FMC public licensee record
- LinkedIn, and any industry directory listing

`153-04 Rockaway Blvd` and `153-04 Rockaway Boulevard` are, to a machine, two different businesses. Pick one form — the one already in `site.ts` — and never deviate.

**Actions:**

1. **Google Business Profile** — create/claim it. Primary category **`Freight forwarding service`**. This is the strongest single local + AI-citation asset a business with a real address can have, and it is free. *(Note: a Queens address paired with a `631` area code — a Long Island code — is an inconsistency a verification process may flag. Confirm the number is correct before submitting; see Part B.)*
2. **LinkedIn company page** — with the identical NAP. Then add all real profile URLs to `social.*` in `site.ts`; they feed the `sameAs` property of the Organization schema, which is literally the field that tells a machine "these accounts are the same entity as this website."
3. **Verify the FMC public record** matches the site exactly.
4. **Industry directories** — a small number with correct, consistent NAP beats many with sloppy data.

### C5. The Bing decision needs revisiting

Bing Webmaster Tools was declined earlier in this project. That decision was made before "must be found in ChatGPT" became the stated top priority, and the two are in direct conflict: **ChatGPT Search leans heavily on Bing's index**, and Copilot and DuckDuckGo run on it outright.

It costs about ten minutes: create the account, use **Import from Google Search Console**, done. Recommend reversing the decision.

### C6. Content that actually gets cited — the Phase 2 build

Six service pages is enough to exist. It is not enough to be cited. AI engines quote pages that answer a *specific question* completely.

**Done as of 2026-09-12:** the location pages (`/locations/jfk-freight-forwarder`, `/locations/new-york-freight-forwarder` — see `src/data/locations.ts`), the two partner-audience pages (`/partners/agents`, `/partners/brokers` — see `src/data/partners-audience.ts`), minimal blog plumbing (a content collection, index page, and detail template with `Article`/`FAQPage` schema — see `src/content/blog/` and `src/pages/blog/`), and blog article #7 below. All of these pages cross-link to relevant services and to each other via a shared `src/components/ui/CrossLinks.astro` component.

**Removed as of 2026-09-12 (owner's request):** trade-lane pages (`/shipping` hub plus `/shipping/china-to-usa` and `/shipping/vietnam-to-usa`) were built, reviewed, and shipped, then deleted at the owner's explicit request after a localhost review — not a business need going forward. `src/data/trade-lanes.ts` and the associated layout/route/tests no longer exist. If lane-specific pages are wanted again later, this is new scope, not a revert.

**Not yet built:** 9 of the 10 scoped blog articles (only #7 exists). This is still substantial work — do not assume it is done because the surrounding plumbing and one article are.

**Blog — 8–10 articles, answer-first, 1,200–2,000 words, each with an FAQ block and `Article` schema:**

1. LCL vs FCL: which is cheaper for your shipment size? — *not built*
2. How long does customs clearance take at JFK? — *not built*
3. What documents do you need to import from China to the USA? — *not built*
4. What is an NVOCC, and why does it matter to your shipment? — *not built*
5. Ocean vs air freight: a real cost and transit comparison — *not built*
6. Understanding freight quotes: every charge explained — *not built*
7. How to choose a US freight forwarding partner (for overseas agents) — **built**: `src/content/blog/choosing-a-us-freight-forwarding-partner.md`
8. Importing from Vietnam to the USA: a complete guide — *not built*
9. What C-TPAT certification means for your cargo — *not built*
10. Demurrage and detention: how to avoid the charges — *not built*

Note the shape of these: **comparisons, definitions, timelines, and cost breakdowns**. That is not a coincidence — those are the formats answer engines cite most, because each maps to a question a person actually types.

**Writing rules for whoever produces this content:**

- **Open every section with a sentence that stands alone.** "Customs clearance at JFK typically takes 1–3 business days for a standard entry" is quotable. "It depends on several factors, which we'll explore below" is not, and never will be.
- Use real numbers, real timelines, real document names. Vague content is not extractable content.
- Tables get parsed cleanly. Use them for comparisons.
- Put the answer **before** the explanation, always.
- Keep to Hard Rule 3: never state a rate, transit time, or capability that isn't real.

**Schema to add in Phase 2:** `Article` (with `dateModified`) on every post, `Person` for any named expert, `BreadcrumbList` on the new hierarchy. (`serviceSchema()` in `src/lib/schema.ts` already supports a per-call `areaServed` override — added for the now-removed trade-lane pages, but generic and still available, e.g. for a future location-specific `City` area.) **Do not add `Review` or `AggregateRating` until real, verifiable reviews exist** — fabricated review markup is a manual-action risk and a straight violation of Hard Rule 3.

### C7. Measuring whether any of this worked

There is no Search Console for AI engines. Two honest methods, and you need both:

**1. Referral traffic (automatic, once GA4 is live).** People click the citations. In GA4, build an audience/comparison filtering **Session source** to: `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com`, `claude.ai`. That segment is your AI-visibility revenue line. Track it monthly.

**2. A manual citation tracker (the only way to see impressions you don't get clicks from).** Keep a spreadsheet of ~20 prompts a real customer would ask — *"best NVOCC for China to New York shipping"*, *"freight forwarder near JFK airport"*, *"what documents to import from Vietnam to the US"*. Once a month, run all 20 through ChatGPT, Perplexity, Gemini, and Claude. Log: were you cited, which page, what did it say. Ten minutes a month, and it is the only direct read on GEO performance that exists today.

---

## PART D — Measurement: GA4, Search Console, and the full user journey

> **Before writing a single line of tracking code, read this.**
> The privacy policy at [src/pages/privacy-policy.astro](../src/pages/privacy-policy.astro) currently states — truthfully — that this site runs **no analytics and no tracking cookies**, and `tests/components/utility-pages.test.ts` will **fail the build** if that stops being true while the text stays. This was built in deliberately. Update the policy text and that test **in the same commit** as the tracking code. This is Hard Rule 5.

### D1. Architecture decision: Google Tag Manager, not raw gtag

**Recommendation: install GA4 through Google Tag Manager.**

*Why:* the owner will want to add things later — Meta pixel, LinkedIn Insight tag, call tracking, a chat widget. Via GTM those are configuration changes in a web UI. Via hardcoded tags they are code changes, a build, and a deploy, every time. For a business without a developer on staff, that difference decides whether measurement stays current or quietly rots.

*The cost, stated plainly:* GTM adds roughly 100 KB of JavaScript. On a site whose whole premise is minimal JS, that is a real trade — but it is **additive**. Every page still renders completely without it. Hard Rule 1 is untouched: analytics that fails to load costs you data, never content. Verify this after install by reloading with JS disabled.

Implementation: one GTM container snippet in [src/layouts/BaseLayout.astro](../src/layouts/BaseLayout.astro), loaded `async`. Every event below fires via `dataLayer.push()`.

**Consent Mode:** the audience is US-nationwide, so GDPR does not strictly bind. Configure **Google Consent Mode v2** anyway — it is small work now, it handles any EEA traffic correctly, and retrofitting consent after the fact is significantly harder.

### D2. The load-bearing detail: where the conversion event fires

**Get this wrong and every number downstream is wrong.**

The quote form works two ways by design. With JavaScript, it submits via `fetch` and renders a result in place. **Without** JavaScript it does a native POST and the server issues a 303 redirect to a static page: `/quote/sent`, `/quote/invalid`, or `/quote/error`.

That means:

> **Fire the conversion event on the `/quote/sent` page load — not in the form's submit handler.**

If you fire on submit, you (a) count submissions that were never delivered, inflating conversions with leads that don't exist, and (b) miss every no-JS conversion entirely. Firing on `/quote/sent` is correct on both paths, because the server only redirects there **after** the email service confirms delivery.

`/quote/sent` is `noindex`, which does not affect GA4 in any way.

**Passing the shipping mode through:** the redirect currently carries no query string. To segment conversions by service, have the endpoint append a **non-personal** parameter — `/quote/sent?mode=ocean-fcl`. Do this in [src/pages/api/quote.ts](../src/pages/api/quote.ts). *(There is a comment in that file explaining why query params can't carry **content** — a static page can't read one without JS. That constraint doesn't apply here: GA4 is JavaScript, so it reads the param fine. The two are compatible.)* **Never** put a name, email, or phone number in that URL.

**And track the failures.** `/quote/error` must fire `quote_delivery_failed`. If email delivery breaks at 2am, this event is how you find out in hours instead of the following quarter. Given that the old site's defining failure was silently losing leads, instrument the failure path on day one.

### D3. Event taxonomy — every step of the journey

GA4 naming conventions (snake_case; `generate_lead` is a GA4 *recommended* event name and gets special reporting treatment — use it exactly).

#### Stage 1 · Arrival

| Event | Trigger | Parameters |
|---|---|---|
| `page_view` | automatic | `page_type`, `service_slug`, `audience_segment` (see D4) |
| `session_start`, `first_visit` | automatic | — |

#### Stage 2 · Engagement — *are they reading, or bouncing?*

| Event | Trigger | Parameters |
|---|---|---|
| `scroll_depth` | 25 / 50 / 75 / 100 % | `percent`, `page_type` |
| `engaged_view` | 15 s on page | `page_type` |
| `faq_open` | a `<details>` FAQ is expanded | `question`, `page_path` |
| `service_card_click` | a service card on home or hub | `service_slug`, `source_page` |
| `nav_click` | header/footer navigation | `link_text`, `location` |
| `outbound_click` | any external link | `url` |

> `faq_open` is more valuable than it looks. The questions people actually open tell you exactly what your next blog article should be — and per §C6 those articles are what get cited by AI engines. It is a direct content roadmap, generated by real customers.

#### Stage 3 · Intent — *the leakiest part of the funnel*

| Event | Trigger | Parameters |
|---|---|---|
| `quote_form_start` | first focus on any form field | `entry_page` |
| `quote_step_view` | step 2 of the form becomes visible | `step` |
| `quote_field_error` | validation rejects a field | `field_name`, `error_type` |
| `quote_form_abandon` | leaves page with a partially filled form | `last_field`, `fields_completed` |
| `click_to_call` | any `tel:` link | `location` (`header` / `sticky_bar` / `footer` / `contact_page`), `page_path` |
| `email_click` | any `mailto:` link | `location` |
| `directions_click` | address / map link | — |

> On a freight site, **calls often outnumber form fills**, and `click_to_call` is the only way to see them. Track `location` carefully — if the mobile sticky bar produces 70% of calls, that tells you exactly where to invest.

#### Stage 4 · Conversion

| Event | Trigger | Parameters | Mark as Key Event |
|---|---|---|---|
| `generate_lead` | **`/quote/sent` page load** | `shipping_mode`, `entry_page`, `audience_segment` | ✅ **Yes** |
| `click_to_call` | as above | | ✅ **Yes** |
| `quote_delivery_failed` | **`/quote/error` page load** | `page_path` | ⚠️ Alert on it |
| `quote_validation_failed` | `/quote/invalid` page load | — | No |

#### Stage 5 · Closing the loop — *the part almost everyone skips*

GA4 stops at "a form was submitted." It cannot tell you a Vietnam LCL lead from an organic blog visit became $40,000 of booked freight. Without this stage you are optimizing for form fills, which is **not the same as optimizing for revenue** — and the gap between those two is where marketing budgets get wasted.

1. Have the quote endpoint include a short **`lead_id`** in the notification email.
2. Send the same `lead_id` to GA4 as an event parameter (it's a random string, not personal data).
3. Keep a simple lead log — spreadsheet is fine — with columns: `lead_id`, date, lane, quoted value, **won/lost**, actual revenue.
4. Once a month, join the two. Now you can answer: *which page, which query, which trade lane produces leads that actually book?*

That single join is the difference between a website you look at and a website you run the business on.

### D4. Custom dimensions to register in GA4

Register these under **Admin → Custom definitions** before sending events, or the data is discarded and unrecoverable.

| Dimension | Scope | Values |
|---|---|---|
| `page_type` | Event | `home`, `service`, `service_hub`, `blog`, `location`, `partner`, `contact`, `quote`, `legal` |
| `service_slug` | Event | `ocean-freight`, `air-freight`, `warehousing-distribution`, `customs-clearance`, `domestic-trucking`, `overseas-agent-network` |
| `shipping_mode` | Event | from `SHIPPING_MODES` in [src/lib/quote-validation.ts](../src/lib/quote-validation.ts) |
| `audience_segment` | Event | `importer`, `overseas_agent`, `broker_3pl`, `unknown` |
| `lead_id` | Event | opaque random string |

### D5. Two rules that will save you later

**Never send personal data to GA4.** No name, email, phone, company, or cargo description. It breaches Google's terms and can get the whole property purged — losing all history, not just the offending rows. Parameters carry *categories* (`ocean-fcl`) and *opaque ids* (`lead_id`), never *identities*. Add a test for this alongside the tracking code, as Hard Rule 7 anticipates.

**The lead email is currently the only record of a lead.** If Resend has an outage, or an email is deleted, that lead is gone permanently. Add a second, durable sink in [src/pages/api/quote.ts](../src/pages/api/quote.ts) — append every submission to a Google Sheet, Airtable, or a small database, **before** attempting the email. This is business continuity as much as analytics, and it is what makes Stage 5 above possible. **Treat it as high priority.**

### D6. Platform setup checklist

| # | Platform | Notes |
|---|---|---|
| 1 | **Google Search Console** | Verify as a **Domain property** via DNS TXT — covers apex, `www`, and all subdomains in one go (better than the HTML-file method). Submit `https://global-gate.us/sitemap-index.xml` |
| 2 | **Google Analytics 4** | Property + web data stream. Register the D4 dimensions **first**. Mark `generate_lead` and `click_to_call` as Key Events |
| 3 | **Link GSC ↔ GA4** | GA4 Admin → Product Links. Unlocks the Search Console reports inside GA4 — you see landing page performance and the queries that led there in one view |
| 4 | **Bing Webmaster Tools** | *Import from GSC* — one click. See §C5: this is the ChatGPT dependency |
| 5 | **Google Business Profile** | Category `Freight forwarding service`. Exact NAP per §C4. Seed the Q&A section with the FAQs already written in `src/data/services.ts` — that content is done, it just needs pasting |
| 6 | **Microsoft Clarity** | Free, unlimited heatmaps and session recordings. It shows you *why* people abandon the form, which no amount of GA4 event data will. Also a Microsoft property, which does no harm on the Bing side. **It records user sessions — the privacy policy must say so** |
| 7 | **Looker Studio** | One dashboard, GA4 + GSC. See D7 |

> **On call tracking:** a service like CallRail with dynamic number insertion swaps the phone number per traffic source, which attributes calls perfectly — and **breaks NAP consistency**, the thing §C4 depends on. If you use it, apply DNI to **paid traffic only**, and let organic, direct, and Google Business Profile always show the real number.

### D7. The analysis loop — turning data into booked freight

Dashboards don't grow businesses; a recurring set of questions does. Build the Looker Studio page to answer exactly these.

**Weekly — 15 minutes**

| Question | Where |
|---|---|
| Leads this week vs. last? | GA4 `generate_lead` |
| Any `quote_delivery_failed` events? | GA4 — **must be zero**; investigate the same day if not |
| Which pages produced the leads? | GA4 landing page × `generate_lead` |
| Calls, and from which page position? | `click_to_call` by `location` |

**Monthly — 1 hour. This is where the growth decisions get made.**

| Question | Where | What you do about it |
|---|---|---|
| **Which pages convert, per 100 sessions?** | GA4 `generate_lead` ÷ sessions, by landing page | Traffic is vanity. A page with 80 sessions and 6 leads beats one with 3,000 and 2. Build more like the first one |
| **Which queries rank 8–20?** | GSC, filter average position | **The highest-ROI SEO work there is.** These are page-2 rankings — one improved page moves them to page 1, where the clicks are. Cheaper than any new page |
| **High impressions, low CTR?** | GSC, CTR column | The page ranks but the title/description doesn't earn the click. Rewrite the meta description — a 30-minute fix |
| **Where does the form leak?** | `quote_form_start` → `quote_step_view` → `generate_lead` | If step 1 → step 2 drops hard, step 1 asks too much. Cut a field and re-measure |
| **Which FAQs get opened most?** | `faq_open` by `question` | Your next article, chosen by customers instead of guessed at |
| **AI referral sessions?** | GA4 source segment per §C7 | The GEO scoreboard |
| **Which lanes actually book?** | Lead log joined on `lead_id` | The real answer. Then build the trade-lane page for the lane that wins, not the lane that's loudest |

**Quarterly:** run the §C7 manual citation tracker; re-audit NAP across every platform; re-check that the privacy policy still matches what the site does.

---

## PART E — Suggested order of work

Sequenced by dependency and by return, not by how interesting it is.

| # | Work | Effort | Why this position |
|---|---|---|---|
| 1 | **Part A — ship it** | 2–3 h | Nothing else counts until it's live |
| 2 | **GSC + GBP + Bing** | 2 h | Indexing has a lag. Start the clock immediately — this is the cheapest hour in the whole document |
| 3 | **FMC + IATA numbers, hours** (Part B) | owner | One file edit, disproportionate GEO value (§C4) |
| 4 | **Durable lead sink** (D5) | 2–3 h | Every day without it risks a permanently lost lead |
| 5 | **GTM + GA4 + full event taxonomy + privacy policy** (Part D) | 1–2 days | Must precede content work, or you can't tell what worked |
| 6 | ~~Partner pages + location pages~~ (§C6) | 2–3 days | **Done (2026-09-12).** Closed the overseas-agent gap — a stated target audience with no path before this. (Trade-lane pages were also built here, then removed at the owner's request after a localhost review.) |
| 7 | **Blog system + first article** | 1–2 weeks | **Blog plumbing + article #7 done (2026-09-12).** The main GEO engine — 1 of 10 scoped articles shipped so far |
| 8 | **Real photos, testimonials, logos** (Part B) | owner | Conversion lift on traffic you'll have by then |
| 9 | **Remaining 9 articles + Looker Studio + review cadence** | ongoing | Compounds |

---

## Appendix

### A. Commands

| Command | What it does |
|---|---|
| `npm install` | Once, first time |
| `npm run dev` | Local preview at `http://localhost:4321`, live-reloading |
| `npm run build` | Production build into `dist/` and `.vercel/output/` |
| `npm test` | 260 unit + component tests |
| `npm run test:build` | Builds, then runs 60 tests against the real built HTML |
| `npm run test:e2e` | 3 real-browser tests including the full quote flow |

`npm run preview` does **not** work in this project — the Vercel adapter doesn't support it. To inspect the real build locally: `npm run build` then `npx serve dist/client`.

> Built HTML lands in **`dist/client/`**, not `dist/`. The Vercel adapter nests it. Tests and scripts must target `dist/client/**`.

### B. Where to change what

| To change… | Edit |
|---|---|
| Any company fact — address, phone, email, hours, licenses, social, founded | [src/config/site.ts](../src/config/site.ts) |
| Service page copy, bullets, FAQs | [src/data/services.ts](../src/data/services.ts) |
| Location page copy (JFK, New York) | [src/data/locations.ts](../src/data/locations.ts) |
| Partner-audience page copy (overseas agents, brokers/3PLs) | [src/data/partners-audience.ts](../src/data/partners-audience.ts) |
| Blog post content | [src/content/blog/](../src/content/blog/) |
| Testimonials | [src/data/testimonials.ts](../src/data/testimonials.ts) |
| Carrier / association logos | [src/data/partners.ts](../src/data/partners.ts) |
| The three homepage stat numbers | [src/data/stats.ts](../src/data/stats.ts) |
| Quote form fields + validation | [src/lib/quote-validation.ts](../src/lib/quote-validation.ts) |
| Email delivery, redirects, failure handling | [src/pages/api/quote.ts](../src/pages/api/quote.ts) |
| Structured data (JSON-LD) | [src/lib/schema.ts](../src/lib/schema.ts) |
| Titles, meta descriptions, canonicals | [src/lib/seo.ts](../src/lib/seo.ts) |
| Site-wide `<head>`, where GTM goes | [src/layouts/BaseLayout.astro](../src/layouts/BaseLayout.astro) |
| Redirects, security headers, caching | [vercel.json](../vercel.json) |
| AI-crawler permissions | [public/robots.txt](../public/robots.txt) |
| AI-readable company summary | [public/llms.txt](../public/llms.txt) |

Images: overwrite the file in `public/images/` keeping the same filename. Caching is set so replacements reach visitors within about an hour.

### C. Reference documents

| Document | Contents |
|---|---|
| [docs/superpowers/specs/2026-08-09-global-gate-website-design.md](superpowers/specs/2026-08-09-global-gate-website-design.md) | Approved design spec — the 12 catalogued defects, locked decisions, design tokens, conversion design, SEO/GEO strategy, success criteria |
| [docs/superpowers/plans/2026-08-09-global-gate-phase-1.md](superpowers/plans/2026-08-09-global-gate-phase-1.md) | The 20-task implementation plan. Ends with a **"Known deviations from the approved spec"** table — 6 entries, each a reversible judgment call |
| `.superpowers/sdd/2026-08-09-global-gate-phase-1/progress.md` | Build ledger: every task, every defect found and fixed, and **20 deferred minor issues** worth triaging before merge |
| *(none — see below)* | The location/partner plan's build ledger lived at `.superpowers/sdd/2026-09-11-shipping-locations-partners/` during development; it was deleted per this project's standard workspace-cleanup step once its final whole-plan review came back clean (5 findings, all fixed, 2026-09-12). The durable record is this file (§1, §C6) plus the branch's own commit history. |
| [README.md](../README.md) | Day-to-day maintenance guide, written for a non-technical reader |

### D. Known open items

- **The Phase 1 plan's final whole-branch review was never run.** All 20 Phase-1 tasks passed individual review, but the single cross-cutting pass over all 33 Phase-1 commits was cancelled. Worth running before merging to `main` — the one genuinely serious bug found during the build (the form posting one format while the server expected another, breaking every no-JS submission) was exactly the kind that only a cross-task review catches. (The *later* trade-lanes/locations/partners plan's own final whole-plan review *was* run, on 2026-09-12 — see the reference row above.)
- **20 deferred minor issues** are itemized in the ledger. Two worth a look: `typescript` / `@astrojs/check` are not installed, so `tsconfig` strict mode is dormant and never actually runs; and `npm audit` reports 3 high transitive vulnerabilities via `@astrojs/vercel` whose fix requires a breaking downgrade.
- **Deviations from spec, each deliberate and reversible:** Cloudflare Turnstile replaced with a honeypot; plain `<img>` instead of Astro `<Image>` srcset; `SearchAction` schema omitted (there is no site search); form-failure fallback is an honest error page rather than Vercel KV queueing.

---

*Phase 1 is complete and tested. Phase 2's location and partner-audience pages — plus
minimal blog plumbing and article #7 — are also complete and tested as of 2026-09-12.
(Trade-lane pages were built in the same pass, then removed at the owner's request after
a localhost review.) The remaining 9 blog articles and all of Phase 3 (measurement) are
still ahead.*
