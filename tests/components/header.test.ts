import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Header from '../../src/components/layout/Header.astro';
import MobileStickyBar from '../../src/components/layout/MobileStickyBar.astro';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Astro component factories have no stable public type
async function render(Component: any) {
  const container = await AstroContainer.create();
  return container.renderToString(Component);
}

describe('Header', () => {
  it('exposes a tap-to-call link outside the collapsed mobile menu', async () => {
    const html = await render(Header);
    const beforeMenu = html.split('id="mobile-menu"')[0];
    expect(beforeMenu).toContain('tel:+16315965591');
  });

  it('shows the quote CTA without requiring the hamburger', async () => {
    const html = await render(Header);
    const beforeMenu = html.split('id="mobile-menu"')[0];
    expect(beforeMenu).toContain('/quote');
  });

  it('links every primary nav destination', async () => {
    const html = await render(Header);
    for (const href of ['/services', '/about', '/contact']) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it('keeps mobile nav reachable without JavaScript', async () => {
    const html = await render(Header);
    expect(html).toContain('<details');
    expect(html).toContain('<summary');
    // The panel must not be hidden by an attribute only JS can remove.
    expect(html).not.toMatch(/<div[^>]*id="mobile-menu"[^>]*\shidden/);
  });
});

describe('MobileStickyBar', () => {
  it('offers both call and quote actions', async () => {
    const html = await render(MobileStickyBar);
    expect(html).toContain('tel:+16315965591');
    expect(html).toContain('/quote');
  });

  it('is hidden on desktop where the header already shows both actions', async () => {
    const html = await render(MobileStickyBar);
    expect(html).toContain('md:hidden');
  });
});
