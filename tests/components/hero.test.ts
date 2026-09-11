import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Hero from '../../src/components/home/Hero.astro';
import { STATS } from '../../src/data/stats';

async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(Hero);
}

describe('Hero', () => {
  it('leads with a specific, lane-agnostic headline, not a generic platitude', async () => {
    const html = await render();
    expect(html).toContain('IMPORT. EXPORT.');
    expect(html).toContain('DOOR TO DOOR');
    expect(html).not.toContain('YOU CAN TRUST');
    expect(html).not.toContain('ASIA TO AMERICA');
  });

  it('names the WCA membership in the credentials badge', async () => {
    const html = await render();
    expect(html).toContain('WCA Member');
  });

  it('renders exactly one h1', async () => {
    const html = await render();
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });

  it('names the concrete services in the subheadline', async () => {
    const html = await render();
    for (const term of ['Ocean FCL', 'air freight', 'customs clearance', 'trucking']) {
      expect(html).toContain(term);
    }
  });

  it('offers a quote CTA and a tap-to-call as the two actions', async () => {
    const html = await render();
    expect(html).toContain('href="/quote"');
    expect(html).toContain('tel:+16315965591');
  });

  it('does not offer a low-intent "Our Services" as the secondary action', async () => {
    const html = await render();
    expect(html).not.toContain('Our Services');
  });

  it('gives the hero background an empty alt, since it is decorative', async () => {
    const html = await render();
    expect(html).toContain('alt=""');
  });
});

describe('STATS', () => {
  it('never claims round-the-clock availability', () => {
    for (const stat of STATS) {
      expect(`${stat.value} ${stat.label}`.toLowerCase()).not.toContain('24/7');
    }
  });

  it('promises a quote turnaround the business can actually meet', () => {
    // Brief's original assertion tested `s.label` alone, which can never match
    // this regex against the approved copy ({ value: '24-Hr', label: 'Quote
    // Turnaround' }) — labels don't repeat the value. Aligned with the combined
    // `${value} ${label}` pattern used in the sibling test above, which is
    // clearly the intended check, rather than reword business-approved copy.
    expect(STATS.some((s) => /24-hr quote/i.test(`${s.value} ${s.label}`))).toBe(true);
  });

  it('shows exactly three stats to match the three-column layout', () => {
    expect(STATS).toHaveLength(3);
  });
});
