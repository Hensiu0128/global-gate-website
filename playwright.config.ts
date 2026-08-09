import { defineConfig } from '@playwright/test';

// astro preview does not work with the Vercel adapter (it errors rather than
// serving), so we serve the static build output directly. The e2e spec mocks
// /api/quote via page.route, so no serverless runtime is needed.
export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    // Always rebuild before serving — without this, `npm run test:e2e` run on
    // its own would happily serve whatever is already sitting in dist/client/,
    // which can be stale (serve does not error on a missing/outdated dir).
    command: 'npm run build && npx --yes serve dist/client -l 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  use: { baseURL: 'http://localhost:4321' },
});
