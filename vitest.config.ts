import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // seo-invariants.test.ts and sitemap.test.ts read dist/, so they only run after a build
    // (seo-invariants via the future `npm run test:build`; sitemap.test.ts is run manually
    // post-build until that script exists).
    exclude: ['node_modules/**', 'tests/build/seo-invariants.test.ts', 'tests/build/sitemap.test.ts'],
  },
});
