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

function decodeHtmlEntities(html: string): string {
  return html
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
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

describe('Blog post: choosing-a-us-freight-forwarding-partner', () => {
  it('renders exactly one h1 with the post title', async () => {
    const html = await renderPost('choosing-a-us-freight-forwarding-partner');
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
    expect(html).toContain('How to Choose a US Freight Forwarding Partner');
  });

  it('emits Article JSON-LD with dateModified', async () => {
    const html = await renderPost('choosing-a-us-freight-forwarding-partner');
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain('"dateModified"');
  });

  it('renders the article body as crawlable text', async () => {
    const html = await renderPost('choosing-a-us-freight-forwarding-partner');
    const body = stripJsonLd(html);
    expect(body).toContain('licensing status, in-house service scope, and quote turnaround time');
  });

  it('renders every FAQ answer as crawlable text, not hidden behind JavaScript', async () => {
    const posts = await getCollection('blog');
    const post = posts.find((p) => p.id === 'choosing-a-us-freight-forwarding-partner')!;
    const html = await renderPost('choosing-a-us-freight-forwarding-partner');
    const body = stripJsonLd(html);
    const decodedBody = decodeHtmlEntities(body);
    for (const faq of post.data.faqs) {
      expect(decodedBody).toContain(faq.question);
      expect(decodedBody).toContain(faq.answer);
    }
    expect(html).not.toMatch(/<details[^>]*\sopen[\s>]/);
  });
});
