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
