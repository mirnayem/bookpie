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

export const brandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  logoUrl: z.string().url().nullable(),
});

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().uuid().nullable(),
  imageUrl: z.string().url().nullable(),
});

export const productVariantSchema = z.object({
  id: z.string().uuid(),
  bookId: z.string().uuid(),
  sku: z.string().min(1),
  title: z.string().min(1),
  attributes: z.record(z.unknown()),
  price: z.number().int().nonnegative(),
  salePrice: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  isActive: z.boolean(),
});

export const productPricingRuleSchema = z.object({
  id: z.string().uuid(),
  bookId: z.string().uuid(),
  name: z.string().min(1),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  discountPercent: z.number().int().min(0).max(100).nullable(),
  fixedSalePrice: z.number().int().nonnegative().nullable(),
  isActive: z.boolean(),
});

export const bookSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  author: authorSchema,
  publisher: publisherSchema,
  brand: brandSchema.nullable(),
  categories: z.array(categorySchema),
  variants: z.array(productVariantSchema),
  pricingRules: z.array(productPricingRuleSchema),
  price: z.number().int().nonnegative(),
  salePrice: z.number().int().nonnegative(),
  warehousePrice: z.number().int().nonnegative().nullable(),
  stock: z.number().int().nonnegative(),
  coverImageUrl: z.string().url().nullable(),
  galleryImageUrls: z.array(z.string().url()),
  tags: z.array(z.string()),
  specifications: z.record(z.unknown()),
  attributes: z.record(z.unknown()),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  sku: z.string().nullable(),
  barcode: z.string().nullable(),
  dynamicPricingEnabled: z.boolean(),
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
  parentId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const upsertBrandRequestSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(180),
  logoUrl: z.string().url().nullable().optional(),
});

export const upsertBookRequestSchema = z
  .object({
    title: z.string().min(1).max(240),
    slug: z.string().min(1).max(260),
    description: z.string().max(5000).nullable().optional(),
    authorId: z.string().uuid(),
    publisherId: z.string().uuid(),
    brandId: z.string().uuid().nullable().optional(),
    categoryIds: z.array(z.string().uuid()).min(1),
    price: z.number().int().nonnegative(),
    salePrice: z.number().int().nonnegative(),
    warehousePrice: z.number().int().nonnegative().nullable().optional(),
    stock: z.number().int().nonnegative(),
    coverImageUrl: z.string().url().nullable().optional(),
    galleryImageUrls: z.array(z.string().url()),
    tags: z.array(z.string()),
    specifications: z.record(z.unknown()),
    attributes: z.record(z.unknown()),
    seoTitle: z.string().max(180).nullable().optional(),
    seoDescription: z.string().max(320).nullable().optional(),
    sku: z.string().max(80).nullable().optional(),
    barcode: z.string().max(80).nullable().optional(),
    dynamicPricingEnabled: z.boolean(),
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
export type Brand = z.infer<typeof brandSchema>;
export type Category = z.infer<typeof categorySchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type ProductPricingRule = z.infer<typeof productPricingRuleSchema>;
export type Book = z.infer<typeof bookSchema>;
export type UpsertAuthorRequest = z.infer<typeof upsertAuthorRequestSchema>;
export type UpsertPublisherRequest = z.infer<typeof upsertPublisherRequestSchema>;
export type UpsertBrandRequest = z.infer<typeof upsertBrandRequestSchema>;
export type UpsertCategoryRequest = z.infer<typeof upsertCategoryRequestSchema>;
export type UpsertBookRequest = z.infer<typeof upsertBookRequestSchema>;
export type ListCatalogQuery = z.infer<typeof listCatalogQuerySchema>;
