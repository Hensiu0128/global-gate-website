import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-Web',
  'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bingbot',
];

describe('robots.txt', () => {
  const robots = readFileSync('public/robots.txt', 'utf8');

  it.each(AI_CRAWLERS)('explicitly allows %s', (bot) => {
    expect(robots).toContain(`User-agent: ${bot}`);
  });

  it('never issues a blanket Disallow of the whole site', () => {
    expect(robots).not.toMatch(/^Disallow:\s*\/\s*$/m);
  });

  it('points crawlers at the sitemap', () => {
    expect(robots).toContain('Sitemap: https://global-gate.us/sitemap-index.xml');
  });

  it('keeps the API endpoint out of the index', () => {
    expect(robots).toContain('Disallow: /api/');
  });
});

describe('llms.txt', () => {
  const llms = readFileSync('public/llms.txt', 'utf8');

  it('exists at the site root', () => {
    expect(existsSync('public/llms.txt')).toBe(true);
  });

  it('identifies the company as a verifiable entity', () => {
    expect(llms).toContain('Global Gate Logistics Inc');
    expect(llms).toContain('153-04 Rockaway Blvd');
    expect(llms).toContain('631-596-5591');
  });

  it('lists every service page so models can navigate the site', () => {
    for (const slug of [
      'ocean-freight', 'air-freight', 'warehousing-distribution',
      'customs-clearance', 'domestic-trucking', 'overseas-agent-network',
    ]) {
      expect(llms).toContain(`/services/${slug}`);
    }
  });

  it('makes no claim of round-the-clock availability', () => {
    expect(llms).not.toContain('24/7');
  });

  it('lists the blog', () => {
    expect(llms).toContain('/blog');
  });

  it('lists the overseas-agent partner page', () => {
    expect(llms).toContain('/partners/agents');
  });

  it('credits WCA membership', () => {
    expect(llms).toContain('WCA member');
  });

  it('no longer frames the business as Asia-America exclusive', () => {
    expect(llms).not.toContain('Asia-America');
    expect(llms).not.toContain('Asia to America');
  });

  it('lists the trade-lane hub and both lane pages', () => {
    // The hub route is /shipping (not /shipping/asia-to-usa — that URL was an
    // error in an earlier draft of this plan; Task 10 already built the real
    // hub at src/pages/shipping/index.astro, served at /shipping). Match the
    // closing paren so this doesn't trivially pass via the lane URLs below,
    // which also contain "/shipping" as a substring.
    expect(llms).toContain('(https://global-gate.us/shipping)');
    expect(llms).toContain('/shipping/china-to-usa');
    expect(llms).toContain('/shipping/vietnam-to-usa');
  });

  it('lists both location pages', () => {
    expect(llms).toContain('/locations/jfk-freight-forwarder');
    expect(llms).toContain('/locations/new-york-freight-forwarder');
  });

  it('lists the brokers partner page', () => {
    expect(llms).toContain('/partners/brokers');
  });
});
