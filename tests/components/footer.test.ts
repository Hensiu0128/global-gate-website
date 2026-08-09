import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from '../../src/components/layout/Footer.astro';

async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Footer);
}

describe('Footer', () => {
  it('shows the current year, never a stale hardcoded one', async () => {
    const html = await render();
    expect(html).toContain(String(new Date().getFullYear()));
    expect(html).not.toContain('© 2024 Global Gate');
  });

  it('publishes the NAP consistently with the site config', async () => {
    const html = await render();
    expect(html).toContain('153-04 Rockaway Blvd, Queens, NY 11434');
    expect(html).toContain('tel:+16315965591');
  });

  it('omits social icons entirely when no real profile URLs are configured', async () => {
    const html = await render();
    expect(html).not.toContain('href="https://www.facebook.com"');
    expect(html).not.toContain('href="https://www.instagram.com"');
  });

  it('links the legal pages required for trust and ad platforms', async () => {
    const html = await render();
    expect(html).toContain('/privacy-policy');
    expect(html).toContain('/terms');
  });
});
