import { defineConfig } from '@playwright/test';

// astro preview does not work with the Vercel adapter (it errors rather than
// serving), so we serve the static build output directly. The e2e spec mocks
// /api/quote via page.route, so no serverless runtime is needed.
export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npx --yes serve dist/client -l 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: 'http://localhost:4321' },
});
