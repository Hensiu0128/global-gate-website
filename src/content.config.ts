import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    dateModified: z.coerce.date(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
});

export const collections = { blog };
