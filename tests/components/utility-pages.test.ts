import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import NotFound from '../../src/pages/404.astro';
import Privacy from '../../src/pages/privacy-policy.astro';
import Terms from '../../src/pages/terms.astro';

async function render(C: any) {
  const container = await AstroContainer.create();
  return container.renderToString(C);
}

describe('404 page', () => {
  it('routes lost visitors back into the site rather than dead-ending', async () => {
    const html = await render(NotFound);
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/services"');
    expect(html).toContain('href="/quote"');
  });

  it('is excluded from search indexes', async () => {
    const html = await render(NotFound);
    expect(html).toContain('name="robots" content="noindex, nofollow"');
  });
});

describe.each([['privacy-policy', Privacy], ['terms', Terms]])('%s', (_name, Component) => {
  it('renders exactly one h1', async () => {
    const html = await render(Component);
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });

  it('names the legal entity and a contact route', async () => {
    const html = await render(Component);
    expect(html).toContain('Global Gate Logistics Inc');
    expect(html).toContain('Op01@global-gate.us');
  });
});

describe.each([['privacy-policy', Privacy], ['terms', Terms]])('%s indexability', (_name, Component) => {
  it('is indexable — legal pages must not carry noindex', async () => {
    const html = await render(Component);
    expect(html).not.toContain('noindex');
  });
});

it('does not claim analytics or tracking this site does not run', async () => {
  const html = await render(Privacy);
  for (const term of ['Google Analytics', 'analytics provider', 'analytics cookies']) {
    expect(html, `privacy policy claims "${term}" but no analytics ship in this build`).not.toContain(term);
  }
});
