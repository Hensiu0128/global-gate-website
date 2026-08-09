import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import TrustBar from '../../src/components/trust/TrustBar.astro';
import Testimonials from '../../src/components/trust/Testimonials.astro';
import { TESTIMONIALS } from '../../src/data/testimonials';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Astro component factories have no stable public type
async function render(C: any) {
  const container = await AstroContainer.create();
  return container.renderToString(C);
}

describe('TrustBar', () => {
  it('states the NVOCC and C-TPAT credentials the business confirmed it holds', async () => {
    const html = await render(TrustBar);
    expect(html).toContain('NVOCC');
    expect(html).toContain('C-TPAT');
  });

  it('omits FMC entirely while the license number is unknown', async () => {
    const html = await render(TrustBar);
    // fmcNumber is null today. Any regression that substitutes a placeholder
    // — `FMC License ${fmcNumber ?? 'TBD'}` and friends — must fail loudly here.
    expect(html).not.toContain('FMC');
  });

  it('renders exactly the credentials the business actually holds', async () => {
    const html = await render(TrustBar);
    expect(html).toContain('Licensed NVOCC');
    expect(html).toContain('IATA Member');
    expect(html).toContain('C-TPAT Certified');
    // Exactly three — an extra or empty <li> is a filtering bug.
    expect(html.match(/<li[\s>]/g) ?? []).toHaveLength(3);
  });
});

describe('Testimonials', () => {
  it('renders nothing when empty, and every named source when populated', async () => {
    const html = await render(Testimonials);
    if (TESTIMONIALS.length === 0) {
      expect(html.trim()).toBe('');
    } else {
      for (const t of TESTIMONIALS) {
        expect(html).toContain(t.name);
        expect(html).toContain(t.company);
      }
    }
  });
});

describe('TESTIMONIALS data', () => {
  it('requires a real name, title, and company on every entry', () => {
    for (const t of TESTIMONIALS) {
      expect(t.name.length).toBeGreaterThan(1);
      expect(t.title.length).toBeGreaterThan(1);
      expect(t.company.length).toBeGreaterThan(1);
      expect(t.name.toLowerCase()).not.toContain('anonymous');
    }
  });
});
