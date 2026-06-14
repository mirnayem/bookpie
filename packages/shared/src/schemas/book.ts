import { z } from "zod";

export const authorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const publisherSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const bookSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  author: authorSchema,
  publisher: publisherSchema,
  categories: z.array(categorySchema),
  price: z.number().int().nonnegative(),
  salePrice: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  coverImageUrl: z.string().url().nullable(),
});

export type Author = z.infer<typeof authorSchema>;
export type Publisher = z.infer<typeof publisherSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Book = z.infer<typeof bookSchema>;
