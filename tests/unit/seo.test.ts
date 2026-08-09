import { describe, it, expect } from 'vitest';
import { buildTitle, canonicalUrl } from '../../src/lib/seo';

describe('buildTitle', () => {
  it('appends the brand to a page title', () => {
    expect(buildTitle('Ocean Freight')).toBe('Ocean Freight | Global Gate Logistics');
  });
  it('returns the full brand title for the homepage', () => {
    expect(buildTitle()).toBe(
      'Global Gate Logistics | International Freight Forwarder'
    );
  });
  it('keeps titles within the 60-character display limit', () => {
    expect(buildTitle('Ocean Freight').length).toBeLessThanOrEqual(60);
  });
  it('keeps the homepage brand title within the 60-character display limit', () => {
    expect(buildTitle().length).toBeLessThanOrEqual(60);
  });
});

describe('canonicalUrl', () => {
  it('builds an absolute apex URL', () => {
    expect(canonicalUrl('/services/ocean-freight')).toBe(
      'https://global-gate.us/services/ocean-freight'
    );
  });
  it('normalizes the homepage to the bare origin', () => {
    expect(canonicalUrl('/')).toBe('https://global-gate.us');
  });
  it('strips a trailing slash', () => {
    expect(canonicalUrl('/about/')).toBe('https://global-gate.us/about');
  });
});
