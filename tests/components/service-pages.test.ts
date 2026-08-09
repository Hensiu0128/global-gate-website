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

/**
 * Removes JSON-LD <script> blocks so assertions about "crawlable text" test the
 * actual visible page body, not structured data that duplicates the same strings.
 * Without this, a regression that hides FAQ answers behind client-side JS would go
 * undetected: serviceSchema/faqSchema independently embed the same question and
 * answer text in a <script type="application/ld+json"> block emitted by
 * ServiceLayout.astro, so a plain `html.toContain(faq.answer)` check would keep
 * passing even if the visible <details> answer were removed or emptied.
 */
function stripJsonLd(html: string): string {
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
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
    // Assert against the visible body only (JSON-LD stripped) — see stripJsonLd's
    // comment for why checking the full html, JSON-LD included, would not catch a
    // regression that hides the answer behind client-side JS.
    const bodyHtml = stripJsonLd(html);
    for (const faq of service.faqs) {
      expect(bodyHtml, `${slug}: question missing from visible body`).toContain(faq.question);
      expect(
        bodyHtml,
        `${slug}: ANSWER missing from visible body — AI crawlers could not read it without executing JS`
      ).toContain(faq.answer);
    }
    // A <details open> would mean the answer is only visible when expanded.
    expect(html).not.toMatch(/<details[^>]*\sopen[\s>]/);
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
