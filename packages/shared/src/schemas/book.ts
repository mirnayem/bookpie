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

export const upsertAuthorRequestSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(180),
});

export const upsertPublisherRequestSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(180),
});

export const upsertCategoryRequestSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(180),
});

export const upsertBookRequestSchema = z
  .object({
    title: z.string().min(1).max(240),
    slug: z.string().min(1).max(260),
    description: z.string().max(5000).nullable().optional(),
    authorId: z.string().uuid(),
    publisherId: z.string().uuid(),
    categoryIds: z.array(z.string().uuid()).min(1),
    price: z.number().int().nonnegative(),
    salePrice: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative(),
    coverImageUrl: z.string().url().nullable().optional(),
  })
  .refine((book) => book.salePrice <= book.price, {
    message: "salePrice must be less than or equal to price",
    path: ["salePrice"],
  });

export const listCatalogQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export type Author = z.infer<typeof authorSchema>;
export type Publisher = z.infer<typeof publisherSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Book = z.infer<typeof bookSchema>;
export type UpsertAuthorRequest = z.infer<typeof upsertAuthorRequestSchema>;
export type UpsertPublisherRequest = z.infer<typeof upsertPublisherRequestSchema>;
export type UpsertCategoryRequest = z.infer<typeof upsertCategoryRequestSchema>;
export type UpsertBookRequest = z.infer<typeof upsertBookRequestSchema>;
export type ListCatalogQuery = z.infer<typeof listCatalogQuerySchema>;
