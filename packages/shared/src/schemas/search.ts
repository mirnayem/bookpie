import { z } from "zod";

export const bookSearchDocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  authorName: z.string(),
  publisherName: z.string(),
  categoryNames: z.array(z.string()),
  price: z.number().int().nonnegative(),
  salePrice: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  coverImageUrl: z.string().url().nullable(),
});

export const searchBooksQuerySchema = z.object({
  q: z.string().min(1),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export const autocompleteQuerySchema = z.object({
  q: z.string().min(1),
  limit: z.number().int().min(1).max(20).optional(),
});

export const searchResultSchema = z.object({
  hits: z.array(bookSearchDocumentSchema),
  query: z.string(),
  limit: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
  estimatedTotalHits: z.number().int().nonnegative(),
});

export const autocompleteSuggestionSchema = z.object({
  title: z.string(),
  slug: z.string(),
});

export const reindexResultSchema = z.object({
  indexed: z.number().int().nonnegative(),
});

export type BookSearchDocument = z.infer<typeof bookSearchDocumentSchema>;
export type SearchBooksQuery = z.infer<typeof searchBooksQuerySchema>;
export type AutocompleteQuery = z.infer<typeof autocompleteQuerySchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type AutocompleteSuggestion = z.infer<
  typeof autocompleteSuggestionSchema
>;
export type ReindexResult = z.infer<typeof reindexResultSchema>;
