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
