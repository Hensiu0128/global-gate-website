import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
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

  it('derives the copyright year in code rather than hardcoding it', () => {
    const source = readFileSync('src/components/layout/Footer.astro', 'utf8');
    expect(source).toContain('new Date().getFullYear()');
    // No literal four-digit year anywhere in the component.
    expect(source).not.toMatch(/\b20\d\d\b/);
  });

  it('publishes the NAP consistently with the site config', async () => {
    const html = await render();
    expect(html).toContain('153-04 Rockaway Blvd, Queens, NY 11434');
    expect(html).toContain('tel:+16315965591');
  });

  it('omits social links entirely when no real profile URLs are configured', async () => {
    const html = await render();

    // If the filter were removed, Astro would drop the null href but still render
    // the label — three dead links, silently. Assert on the labels, not the hrefs.
    for (const label of ['Facebook', 'Instagram', 'LinkedIn']) {
      expect(html, `${label} link rendered without a configured URL`).not.toContain(`>${label}<`);
    }

    // No anchor may ever render without an href. (?=[\s>]) anchors this to the
    // <a> tag itself — without it, "<a" also matches inside "<address...>",
    // which has no href and would make this assertion fail even on correct markup.
    expect(html).not.toMatch(/<a(?=[\s>])(?![^>]*\shref=)[^>]*>/);

    // The original dead-homepage links must never come back.
    expect(html).not.toContain('href="https://www.facebook.com"');
    expect(html).not.toContain('href="https://www.instagram.com"');
  });

  it('links the legal pages required for trust and ad platforms', async () => {
    const html = await render();
    expect(html).toContain('/privacy-policy');
    expect(html).toContain('/terms');
  });
});
