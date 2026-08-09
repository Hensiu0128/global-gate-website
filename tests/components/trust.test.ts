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

  it('omits the FMC number rather than printing a placeholder when it is unknown', async () => {
    const html = await render(TrustBar);
    expect(html).not.toMatch(/FMC\s*#?\s*(TBD|XXX|_+)/i);
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
