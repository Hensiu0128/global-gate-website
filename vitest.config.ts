import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // seo-invariants.test.ts reads dist/, so it only runs after a build via `npm run test:build`.
    exclude: ['node_modules/**', 'tests/build/seo-invariants.test.ts'],
  },
});
