import { describe, it, expect } from 'vitest';
import { telHref, formatPhone, formatAddressOneLine } from '../../src/lib/format';

describe('telHref', () => {
  it('produces an E.164 tel: URI from a dashed US number', () => {
    expect(telHref('631-596-5591')).toBe('tel:+16315965591');
  });
  it('is idempotent for already-clean input', () => {
    expect(telHref('+16315965591')).toBe('tel:+16315965591');
  });
});

describe('formatPhone', () => {
  it('renders a readable display number', () => {
    expect(formatPhone('631-596-5591')).toBe('(631) 596-5591');
  });
});

describe('formatAddressOneLine', () => {
  it('joins the address into a single NAP-consistent line', () => {
    expect(
      formatAddressOneLine({
        street: '153-04 Rockaway Blvd',
        city: 'Queens',
        region: 'NY',
        postalCode: '11434',
        country: 'US',
      })
    ).toBe('153-04 Rockaway Blvd, Queens, NY 11434');
  });
});
