import { getViteConfig } from 'astro/config';

// Separate config for `npm run test:build`. The main vitest.config.ts excludes
// tests/build/seo-invariants.test.ts and tests/build/sitemap.test.ts because they
// read dist/client/ and must not run (and fail) during the fast `npm test` loop
// before a build exists. This config runs the full tests/build/ directory,
// including those two, after `astro build` has produced dist/client/.
export default getViteConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/build/**/*.test.ts'],
    exclude: ['node_modules/**'],
  },
});
