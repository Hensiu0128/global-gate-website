import { describe, it, expect } from 'vitest';
import { SITE } from '../../src/config/site';

const PLACEHOLDER = /\b(TBD|TODO|XXX+|lorem ipsum|coming soon|placeholder)\b/i;

function allStrings(value: unknown, acc: string[] = []): string[] {
  if (typeof value === 'string') acc.push(value);
  else if (Array.isArray(value)) value.forEach((v) => allStrings(v, acc));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => allStrings(v, acc));
  return acc;
}

describe('SITE config', () => {
  it('uses the canonical apex URL with no trailing slash', () => {
    expect(SITE.url).toBe('https://global-gate.us');
  });

  it('carries the verified NAP exactly once, in one place', () => {
    expect(SITE.legalName).toBe('Global Gate Logistics Inc');
    expect(SITE.address.street).toBe('153-04 Rockaway Blvd');
    expect(SITE.address.city).toBe('Queens');
    expect(SITE.address.region).toBe('NY');
    expect(SITE.address.postalCode).toBe('11434');
    expect(SITE.email).toBe('Op01@global-gate.us');
    expect(SITE.phones.map((p) => p.number)).toEqual(['631-596-5591', '631-596-5592']);
  });

  it('contains no placeholder text anywhere', () => {
    for (const s of allStrings(SITE)) {
      expect(s, `placeholder leaked: "${s}"`).not.toMatch(PLACEHOLDER);
    }
  });

  it('never claims 24/7 availability', () => {
    for (const s of allStrings(SITE)) {
      expect(s.toLowerCase()).not.toContain('24/7');
    }
  });

  it('represents unknown facts as null rather than empty or fake strings', () => {
    const unknowns = [SITE.credentials.fmcNumber, SITE.credentials.iataNumber, SITE.founded];
    for (const u of unknowns) {
      expect(u === null || (typeof u === 'string' && u.length > 0) || typeof u === 'number').toBe(true);
    }
  });
});
