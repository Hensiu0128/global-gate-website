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

  it('renders any cross-links as real anchors with their link text', async () => {
    const location = LOCATIONS.find((l) => l.slug === slug)!;
    if (!location.crossLinks || location.crossLinks.length === 0) return;
    const html = await renderDetail(slug);
    for (const link of location.crossLinks) {
      expect(html).toContain(`href="${link.href}"`);
      // HTML-escape the link text to match how Astro renders it
      const escapedText = link.text.replace(/&/g, '&amp;');
      expect(html).toContain(escapedText);
    }
  });
});
