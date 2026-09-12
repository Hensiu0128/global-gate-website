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
});
