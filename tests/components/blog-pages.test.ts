import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getCollection, render } from 'astro:content';
import BlogPost from '../../src/pages/blog/[slug].astro';
import BlogIndex from '../../src/pages/blog/index.astro';

async function renderPost(slug: string) {
  const posts = await getCollection('blog');
  const post = posts.find((p) => p.id === slug)!;
  const container = await AstroContainer.create();
  return container.renderToString(BlogPost, {
    props: { post },
    params: { slug },
  });
}

function stripJsonLd(html: string): string {
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
}

describe('Blog index', () => {
  it('lists every published post by title', async () => {
    const posts = await getCollection('blog');
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlogIndex);
    for (const post of posts) {
      expect(html).toContain(post.data.title);
      expect(html).toContain(`/blog/${post.id}`);
    }
  });
});

describe('Blog post: fixture-post', () => {
  it('renders exactly one h1 with the post title', async () => {
    const html = await renderPost('fixture-post');
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
    expect(html).toContain('Fixture Post');
  });

  it('emits Article JSON-LD with dateModified', async () => {
    const html = await renderPost('fixture-post');
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain('"dateModified"');
  });

  it('renders the article body as crawlable text', async () => {
    const html = await renderPost('fixture-post');
    const body = stripJsonLd(html);
    expect(body).toContain('temporary fixture content');
  });

  it('renders every FAQ answer as crawlable text, not hidden behind JavaScript', async () => {
    const posts = await getCollection('blog');
    const post = posts.find((p) => p.id === 'fixture-post')!;
    const html = await renderPost('fixture-post');
    const body = stripJsonLd(html);
    for (const faq of post.data.faqs) {
      expect(body).toContain(faq.question);
      expect(body).toContain(faq.answer);
    }
    expect(html).not.toMatch(/<details[^>]*\sopen[\s>]/);
  });
});
