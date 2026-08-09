import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Quote from '../../src/pages/quote.astro';
import Contact from '../../src/pages/contact.astro';
import About from '../../src/pages/about.astro';
import Sent from '../../src/pages/quote/sent.astro';
import Invalid from '../../src/pages/quote/invalid.astro';
import ErrorPage from '../../src/pages/quote/error.astro';

async function render(C: any) {
  const container = await AstroContainer.create();
  return container.renderToString(C);
}

describe.each([
  ['quote', Quote],
  ['contact', Contact],
  ['about', About],
])('%s page', (name, Component) => {
  it('renders exactly one h1', async () => {
    const html = await render(Component);
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });

  it('sets a unique canonical URL', async () => {
    const html = await render(Component);
    expect(html).toContain(`href="https://global-gate.us/${name}"`);
  });

  it('sets a meta description', async () => {
    const html = await render(Component);
    expect(html).toMatch(/name="description" content=".{50,}"/);
  });
});

describe('Quote page', () => {
  it('presents the actual quote form, matching the CTA promise', async () => {
    const html = await render(Quote);
    expect(html).toContain('action="/api/quote"');
    expect(html).toContain('name="origin"');
  });
});

describe('Contact page', () => {
  it('publishes the NAP and both phone numbers', async () => {
    const html = await render(Contact);
    expect(html).toContain('153-04 Rockaway Blvd');
    expect(html).toContain('tel:+16315965591');
    expect(html).toContain('tel:+16315965592');
  });

  it('never advertises round-the-clock availability', async () => {
    const html = await render(Contact);
    expect(html).not.toContain('24/7');
  });
});

// Task 14's /api/quote endpoint 303-redirects native (no-JS) form submissions
// to a dedicated confirmation page — a statically built page can't read a query
// string without JavaScript, and a no-JS visitor is exactly who gets redirected.
describe.each([
  ['sent', Sent],
  ['invalid', Invalid],
  ['error', ErrorPage],
])('quote/%s confirmation page', (name, Component) => {
  it('renders exactly one h1', async () => {
    const html = await render(Component);
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });

  it('is excluded from search results', async () => {
    const html = await render(Component);
    expect(html).toContain('name="robots" content="noindex, nofollow"');
  });

  it('never advertises round-the-clock availability', async () => {
    const html = await render(Component);
    expect(html).not.toContain('24/7');
  });
});

describe('quote/sent page', () => {
  it('states the promised turnaround and links back home', async () => {
    const html = await render(Sent);
    expect(html).toContain('24 business hours');
    expect(html).toContain('href="/"');
  });
});

describe('quote/invalid page', () => {
  it('links back to the quote form to try again', async () => {
    const html = await render(Invalid);
    expect(html).toContain('href="/quote"');
  });
});

describe('quote/error page', () => {
  it('states delivery failed and publishes the real phone and email fallback', async () => {
    const html = await render(ErrorPage);
    expect(html).toContain('tel:+16315965591');
    expect(html).toContain('Op01@global-gate.us');
  });
});
