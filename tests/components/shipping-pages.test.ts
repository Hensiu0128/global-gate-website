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
      expect(html).toContain('href="/shipping"');
    });

    it('renders any cross-links as real anchors with their link text', async () => {
      const lane = TRADE_LANES.find((l) => l.slug === slug)!;
      if (!lane.crossLinks || lane.crossLinks.length === 0) return;
      const html = await renderDetail(slug);
      for (const link of lane.crossLinks) {
        expect(html).toContain(`href="${link.href}"`);
        // HTML-escape the link text to match how Astro renders it
        const escapedText = link.text.replace(/&/g, '&amp;');
        expect(html).toContain(escapedText);
      }
    });
  }
);
