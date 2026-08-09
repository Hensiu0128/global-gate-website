import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BaseLayout from '../../src/layouts/BaseLayout.astro';

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(BaseLayout, { props });
}

describe('BaseLayout', () => {
  it('emits a canonical link on the apex domain', async () => {
    const html = await render({ description: 'Test page', pathname: '/about' });
    expect(html).toContain('<link rel="canonical" href="https://global-gate.us/about"');
  });

  it('emits the page title with the brand suffix', async () => {
    const html = await render({ title: 'About', description: 'Test', pathname: '/about' });
    expect(html).toContain('<title>About | Global Gate Logistics</title>');
  });

  it('emits the meta description', async () => {
    const html = await render({ description: 'A specific description.', pathname: '/' });
    expect(html).toContain('name="description" content="A specific description."');
  });

  it('always includes Organization and LocalBusiness JSON-LD', async () => {
    const html = await render({ description: 'Test', pathname: '/' });
    expect(html).toContain('"@type":"Organization"');
    expect(html).toContain('"@type":"LocalBusiness"');
  });

  it('sets lang and viewport for accessibility and mobile', async () => {
    const html = await render({ description: 'Test', pathname: '/' });
    expect(html).toContain('<html lang="en"');
    expect(html).toContain('name="viewport"');
  });

  it('does not lock zoom, which fails accessibility audits', async () => {
    const html = await render({ description: 'Test', pathname: '/' });
    expect(html).not.toContain('maximum-scale=1');
  });
});
