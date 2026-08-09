import { describe, it, expect } from 'vitest';
import { existsSync, statSync, readFileSync } from 'node:fs';

const REQUIRED = [
  'public/images/logo.png',
  'public/images/hero-bg.webp',
  'public/images/service-ocean.webp',
  'public/images/service-air.webp',
  'public/images/service-warehouse.webp',
  'public/images/og-default.jpg',
];

const FAVICON = 'public/favicon.svg';

describe('migrated assets', () => {
  it.each(REQUIRED)('%s exists locally, with no dependency on the Manus CDN', (path) => {
    expect(existsSync(path)).toBe(true);
  });

  // The 1024-byte floor catches a truncated or placeholder download. It applies only to the
  // six raster assets — a hand-written SVG favicon is legitimately much smaller than that.
  it.each(REQUIRED)('%s is non-empty', (path) => {
    expect(statSync(path).size).toBeGreaterThan(1024);
  });

  it('keeps the hero background under 250KB for mobile performance', () => {
    expect(statSync('public/images/hero-bg.webp').size).toBeLessThan(250 * 1024);
  });
});

describe('favicon', () => {
  it('exists locally', () => {
    expect(existsSync(FAVICON)).toBe(true);
  });

  it('is non-empty', () => {
    expect(statSync(FAVICON).size).toBeGreaterThan(0);
  });

  it('contains valid SVG markup', () => {
    const contents = readFileSync(FAVICON, 'utf-8');
    expect(contents).toContain('<svg');
  });
});
