import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Index from '../../src/pages/index.astro';

async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Index);
}

describe('Homepage', () => {
  it('renders exactly one h1', async () => {
    const html = await render();
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });

  it('never skips a heading level', async () => {
    const html = await render();
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1], `jump from h${levels[i - 1]} to h${levels[i]}`).toBeLessThanOrEqual(1);
    }
  });

  it('links all six service pages', async () => {
    const html = await render();
    for (const slug of [
      'ocean-freight', 'air-freight', 'warehousing-distribution',
      'customs-clearance', 'domestic-trucking', 'overseas-agent-network',
    ]) {
      expect(html).toContain(`/services/${slug}`);
    }
  });

  it('offers multiple conversion points, not just one at the bottom', async () => {
    const html = await render();
    expect((html.match(/href="\/quote"/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });

  it('contains the full company description as crawlable text', async () => {
    const html = await render();
    expect(html).toContain('NVOCC');
    expect(html).toContain('Asia');
  });
});
