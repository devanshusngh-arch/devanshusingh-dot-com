import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    tag: z.string().optional(),
    category: z.string().optional(),
    title: z.string(),
    excerpt: z.string().optional(),
    description: z.string().optional(),
    date: z.string().optional(),
    publishDate: z.string().optional(),
    image: z.string().optional(),
    photographer: z.string().optional(),
    imageCredit: z.string().optional(),
    photographerProfile: z.string().optional(),
    author: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    slug: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { blog };
