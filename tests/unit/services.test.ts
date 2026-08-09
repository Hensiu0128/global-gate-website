import { describe, it, expect } from 'vitest';
import { SERVICES, getService } from '../../src/data/services';

describe('SERVICES', () => {
  it('covers all six services from the original site', () => {
    expect(SERVICES.map((s) => s.slug).sort()).toEqual(
      [
        'air-freight',
        'customs-clearance',
        'domestic-trucking',
        'ocean-freight',
        'overseas-agent-network',
        'warehousing-distribution',
      ].sort()
    );
  });

  it('gives every service a unique slug', () => {
    expect(new Set(SERVICES.map((s) => s.slug)).size).toBe(SERVICES.length);
  });

  it('keeps every meta title within the 60-character search display limit', () => {
    for (const s of SERVICES) {
      expect(s.metaTitle.length, `${s.slug} title too long`).toBeLessThanOrEqual(60);
    }
  });

  it('keeps every meta description between 120 and 160 characters', () => {
    for (const s of SERVICES) {
      expect(s.metaDescription.length, `${s.slug} description length`).toBeGreaterThanOrEqual(120);
      expect(s.metaDescription.length, `${s.slug} description length`).toBeLessThanOrEqual(160);
    }
  });

  it('gives every service at least three FAQs, the format AI engines cite most', () => {
    for (const s of SERVICES) {
      expect(s.faqs.length, `${s.slug} needs more FAQs`).toBeGreaterThanOrEqual(3);
    }
  });

  it('opens every FAQ answer with a self-contained sentence, not a pronoun', () => {
    for (const s of SERVICES) {
      for (const f of s.faqs) {
        expect(f.answer, `${s.slug}: "${f.answer}"`).not.toMatch(/^(It|They|This|That|These|Those)\b/);
      }
    }
  });

  it('resolves a service by slug', () => {
    expect(getService('ocean-freight')?.name).toBe('Ocean Freight');
    expect(getService('nope')).toBeUndefined();
  });
});
