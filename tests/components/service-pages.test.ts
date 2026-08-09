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
