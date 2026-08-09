import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import QuoteForm from '../../src/components/forms/QuoteForm.astro';
import { SHIPPING_MODES } from '../../src/lib/quote-validation';

async function render(props: Record<string, unknown> = {}) {
  const container = await AstroContainer.create();
  return container.renderToString(QuoteForm, { props });
}

describe('QuoteForm', () => {
  it('collects every field the sales team needs to quote', async () => {
    const html = await render();
    for (const name of ['mode', 'origin', 'destination', 'cargo', 'name', 'company', 'email', 'phone']) {
      expect(html, `missing field: ${name}`).toContain(`name="${name}"`);
    }
  });

  it('offers all shipping modes as selectable options', async () => {
    const html = await render();
    for (const mode of SHIPPING_MODES) expect(html).toContain(mode);
  });

  it('posts to the API endpoint so it works without JavaScript', async () => {
    const html = await render();
    expect(html).toContain('action="/api/quote"');
    expect(html).toContain('method="post"');
  });

  it('includes a hidden honeypot field for spam filtering', async () => {
    const html = await render();
    expect(html).toContain('name="company_website"');
    expect(html).toContain('tabindex="-1"');
  });

  it('states the response-time promise beside the submit button', async () => {
    const html = await render();
    expect(html).toMatch(/24 business hours/i);
  });

  it('labels every input for screen readers', async () => {
    const html = await render();
    const inputs = [...html.matchAll(/name="([a-z_]+)"/g)].map((m) => m[1]).filter((n) => n !== 'company_website');
    for (const name of new Set(inputs)) {
      expect(html, `no label for ${name}`).toContain(`for="q-${name}"`);
    }
  });

  it('marks required fields with the required attribute', async () => {
    const html = await render();
    expect((html.match(/required/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });
});
