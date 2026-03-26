import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.string(),
    order: z.number(),
    prev: z.object({ label: z.string(), slug: z.string() }).optional(),
    next: z.object({ label: z.string(), slug: z.string() }).optional(),
  }),
});

export const collections = { docs };
