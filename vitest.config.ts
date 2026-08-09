import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // seo-invariants.test.ts and sitemap.test.ts read dist/client/, so they're excluded here
    // and only run via `npm run test:build` (see vitest.build.config.ts), which builds first.
    exclude: ['node_modules/**', 'tests/build/seo-invariants.test.ts', 'tests/build/sitemap.test.ts'],
  },
});
