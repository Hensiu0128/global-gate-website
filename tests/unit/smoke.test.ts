import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('project foundation', () => {
  it('declares the canonical site URL', () => {
    const config = readFileSync('astro.config.mjs', 'utf8');
    expect(config).toContain("site: 'https://global-gate.us'");
  });

  it('defines the brand design tokens', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).toContain('--color-navy-900: #0A1628');
    expect(css).toContain('--color-amber-500: #F59E0B');
    expect(css).toContain('Barlow Condensed');
    expect(css).toContain('Source Sans 3');
  });
});
