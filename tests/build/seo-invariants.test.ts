import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { globSync } from 'glob';
import { parseHTML } from 'linkedom';

interface Page { path: string; html: string; doc: Document; }

let pages: Page[] = [];

beforeAll(() => {
  // The Vercel adapter nests static output under dist/client/, not dist/.
  const files = globSync('dist/client/**/*.html');
  expect(files.length, 'run `npm run build` before this suite').toBeGreaterThan(0);
  pages = files.map((path) => {
    const html = readFileSync(path, 'utf8');
    return { path, html, doc: parseHTML(html).document as unknown as Document };
  });
});

describe('every built page', () => {
  it('was actually generated for all expected routes', () => {
    const paths = pages.map((p) => p.path.replace(/\\/g, '/'));
    const expected = [
      'dist/client/index.html', 'dist/client/about/index.html', 'dist/client/contact/index.html',
      'dist/client/quote/index.html', 'dist/client/quote/sent/index.html',
      'dist/client/quote/invalid/index.html', 'dist/client/quote/error/index.html',
      'dist/client/services/index.html',
      'dist/client/services/ocean-freight/index.html', 'dist/client/services/air-freight/index.html',
      'dist/client/services/warehousing-distribution/index.html',
      'dist/client/services/customs-clearance/index.html',
      'dist/client/services/domestic-trucking/index.html',
      'dist/client/services/overseas-agent-network/index.html',
      'dist/client/privacy-policy/index.html', 'dist/client/terms/index.html', 'dist/client/404.html',
    ];
    for (const route of expected) expect(paths, `missing ${route}`).toContain(route);
  });

  it('has exactly one h1', () => {
    for (const p of pages) {
      expect(p.doc.querySelectorAll('h1').length, `${p.path}`).toBe(1);
    }
  });

  it('has a title of 60 characters or fewer', () => {
    for (const p of pages) {
      const title = p.doc.querySelector('title')?.textContent ?? '';
      expect(title.length, `${p.path}: "${title}"`).toBeGreaterThan(0);
      expect(title.length, `${p.path}: "${title}"`).toBeLessThanOrEqual(60);
    }
  });

  it('has a meta description between 50 and 165 characters', () => {
    for (const p of pages) {
      const desc = p.doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
      expect(desc.length, `${p.path}`).toBeGreaterThanOrEqual(50);
      expect(desc.length, `${p.path}`).toBeLessThanOrEqual(165);
    }
  });

  it('has a canonical URL on the apex domain', () => {
    for (const p of pages) {
      const href = p.doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
      expect(href, `${p.path}`).toMatch(/^https:\/\/global-gate\.us/);
      expect(href, `${p.path} has a trailing slash`).not.toMatch(/.\/$/);
    }
  });

  it('gives every image an alt attribute', () => {
    for (const p of pages) {
      for (const img of [...p.doc.querySelectorAll('img')]) {
        expect(img.hasAttribute('alt'), `${p.path}: ${img.getAttribute('src')}`).toBe(true);
      }
    }
  });

  it('contains valid, parseable JSON-LD', () => {
    for (const p of pages) {
      const blocks = [...p.doc.querySelectorAll('script[type="application/ld+json"]')];
      expect(blocks.length, `${p.path}`).toBeGreaterThan(0);
      for (const block of blocks) {
        expect(() => JSON.parse(block.textContent ?? ''), `${p.path}`).not.toThrow();
      }
    }
  });

  it('never emits a null value inside JSON-LD, which Google rejects', () => {
    for (const p of pages) {
      for (const block of [...p.doc.querySelectorAll('script[type="application/ld+json"]')]) {
        expect(block.textContent, `${p.path}`).not.toContain('null');
      }
    }
  });

  it('contains no placeholder text', () => {
    const PLACEHOLDER = /\b(lorem ipsum|TODO|FIXME|coming soon)\b/i;
    for (const p of pages) {
      const text = p.doc.querySelector('body')?.textContent ?? '';
      expect(text, `${p.path}`).not.toMatch(PLACEHOLDER);
    }
  });

  it('never claims round-the-clock availability', () => {
    for (const p of pages) {
      expect(p.doc.querySelector('body')?.textContent ?? '', `${p.path}`).not.toContain('24/7');
    }
  });

  it('shows the current copyright year, not a stale one', () => {
    const year = String(new Date().getFullYear());
    for (const p of pages) {
      const footer = p.doc.querySelector('footer')?.textContent ?? '';
      if (footer.includes('©')) expect(footer, `${p.path}`).toContain(year);
    }
  });

  it('never links to a bare social network homepage', () => {
    for (const p of pages) {
      for (const a of [...p.doc.querySelectorAll('a')]) {
        const href = a.getAttribute('href') ?? '';
        expect(href, `${p.path}`).not.toMatch(/^https:\/\/(www\.)?(facebook|instagram)\.com\/?$/);
      }
    }
  });

  it('sets lang on the html element', () => {
    for (const p of pages) {
      expect(p.doc.querySelector('html')?.getAttribute('lang'), `${p.path}`).toBe('en');
    }
  });

  it('never disables pinch zoom, which fails accessibility', () => {
    for (const p of pages) {
      const viewport = p.doc.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? '';
      expect(viewport, `${p.path}`).not.toContain('maximum-scale=1');
    }
  });
});

describe('content is readable without JavaScript', () => {
  it('renders substantial body text in the static HTML', () => {
    // 404 and the three /quote/ confirmation pages are noindex, single-purpose
    // transactional screens reached only after a form action (never linked in
    // nav) — they are deliberately terse. Padding them with filler content to
    // clear a content-richness bar meant for indexable pages would itself be
    // the kind of placeholder text the suite elsewhere forbids.
    const EXEMPT = ['404', 'quote/sent', 'quote/invalid', 'quote/error'];
    for (const p of pages) {
      const normalized = p.path.replace(/\\/g, '/');
      if (EXEMPT.some((route) => normalized.includes(route))) continue;
      const text = (p.doc.querySelector('main')?.textContent ?? '').replace(/\s+/g, ' ').trim();
      expect(text.length, `${p.path} has too little static text`).toBeGreaterThan(400);
    }
  });

  it('renders every FAQ answer as static text, not JavaScript-injected', () => {
    const oceanPage = pages.find((p) => p.path.includes('ocean-freight'));
    expect(oceanPage).toBeDefined();
    expect(oceanPage!.doc.body.textContent).toContain('FCL means your cargo occupies an entire container');
  });

  it('exposes the quote form without JavaScript', () => {
    const quote = pages.find((p) => p.path.replace(/\\/g, '/').endsWith('quote/index.html'));
    const form = quote!.doc.querySelector('form#quote-form');
    expect(form?.getAttribute('action')).toBe('/api/quote');
    expect(form?.getAttribute('method')?.toLowerCase()).toBe('post');
  });
});

describe('internal links', () => {
  it('resolve to pages that exist', () => {
    const built = new Set(
      pages.map((p) =>
        p.path.replace(/\\/g, '/').replace(/^dist\/client/, '').replace(/\/index\.html$/, '').replace(/\.html$/, '') || '/'
      )
    );
    for (const p of pages) {
      for (const a of [...p.doc.querySelectorAll('a')]) {
        const href = (a.getAttribute('href') ?? '').split('#')[0].split('?')[0];
        if (!href.startsWith('/') || href.startsWith('/api/')) continue;
        const normalized = href.replace(/\/$/, '') || '/';
        expect(built.has(normalized), `${p.path} links to missing ${href}`).toBe(true);
      }
    }
  });
});
