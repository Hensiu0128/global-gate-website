import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://global-gate.us',
  trailingSlash: 'never',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      // Exclude the 404 page and the three noindex /quote/ confirmation pages
      // (sent, invalid, error) — listing a page marked noindex in the sitemap
      // is a contradictory signal to Google.
      filter: (page) =>
        !page.includes('/404') &&
        !page.includes('/quote/sent') &&
        !page.includes('/quote/invalid') &&
        !page.includes('/quote/error'),
      changefreq: 'weekly',
      lastmod: new Date(),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
});
