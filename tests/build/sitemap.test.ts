import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Reads the built sitemap, so it only runs after `npm run build` (see vitest.config.ts exclude).
const sitemap = readFileSync('dist/client/sitemap-0.xml', 'utf8');

describe('sitemap-0.xml', () => {
  it('excludes the 404 page', () => {
    expect(sitemap).not.toContain('/404');
  });

  it('excludes the three noindex quote confirmation pages', () => {
    expect(sitemap).not.toContain('/quote/sent');
    expect(sitemap).not.toContain('/quote/invalid');
    expect(sitemap).not.toContain('/quote/error');
  });

  it('includes the indexable pages', () => {
    expect(sitemap).toContain('<loc>https://global-gate.us</loc>');
    expect(sitemap).toContain('https://global-gate.us/quote</loc>');
    expect(sitemap).toContain('https://global-gate.us/services</loc>');
    expect(sitemap).toContain('https://global-gate.us/about</loc>');
    expect(sitemap).toContain('https://global-gate.us/contact</loc>');
    expect(sitemap).toContain('https://global-gate.us/privacy-policy</loc>');
    expect(sitemap).toContain('https://global-gate.us/terms</loc>');
    expect(sitemap).toContain('https://global-gate.us/blog</loc>');
    expect(sitemap).toContain('https://global-gate.us/blog/choosing-a-us-freight-forwarding-partner</loc>');
    expect(sitemap).toContain('https://global-gate.us/partners/agents</loc>');
  });
});
