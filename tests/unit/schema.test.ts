import { describe, it, expect } from 'vitest';
import {
  organizationSchema,
  localBusinessSchema,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
} from '../../src/lib/schema';

describe('organizationSchema', () => {
  const s = organizationSchema() as Record<string, any>;

  it('is a valid schema.org Organization', () => {
    expect(s['@context']).toBe('https://schema.org');
    expect(s['@type']).toBe('Organization');
    expect(s.legalName).toBe('Global Gate Logistics Inc');
  });

  it('omits sameAs entirely when no real social profiles are known', () => {
    expect(s.sameAs).toBeUndefined();
  });

  it('never emits null values, which break Google validation', () => {
    expect(JSON.stringify(s)).not.toContain('null');
  });
});

describe('localBusinessSchema', () => {
  it('publishes the exact NAP for local search consistency', () => {
    const s = localBusinessSchema() as Record<string, any>;
    expect(s.address.streetAddress).toBe('153-04 Rockaway Blvd');
    expect(s.address.postalCode).toBe('11434');
    expect(s.telephone).toBe('+16315965591');
  });
});

describe('faqSchema', () => {
  it('maps questions and answers into FAQPage format', () => {
    const s = faqSchema([{ question: 'How long?', answer: 'About 3 days.' }]) as Record<string, any>;
    expect(s['@type']).toBe('FAQPage');
    expect(s.mainEntity[0]['@type']).toBe('Question');
    expect(s.mainEntity[0].acceptedAnswer.text).toBe('About 3 days.');
  });
});

describe('breadcrumbSchema', () => {
  it('numbers positions from 1 and uses absolute URLs', () => {
    const s = breadcrumbSchema([
      { name: 'Home', href: '/' },
      { name: 'Services', href: '/services' },
    ]) as Record<string, any>;
    expect(s.itemListElement[0].position).toBe(1);
    expect(s.itemListElement[1].item).toBe('https://global-gate.us/services');
  });
});

describe('serviceSchema', () => {
  it('links the service to the providing organization', () => {
    const s = serviceSchema({
      name: 'Ocean Freight',
      description: 'FCL and LCL ocean freight.',
      url: 'https://global-gate.us/services/ocean-freight',
    }) as Record<string, any>;
    expect(s['@type']).toBe('Service');
    expect(s.provider['@type']).toBe('Organization');
    expect(s.provider.name).toBe('Global Gate Logistics');
  });
});
