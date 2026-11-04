import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const rueckblick = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/rueckblick' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      description: z.string(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      video: z.string().optional(),
    }),
});

export const collections = { rueckblick };
