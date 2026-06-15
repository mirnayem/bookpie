import { z } from "zod";

export const cartItemSchema = z.object({
  bookId: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  coverImageUrl: z.string().url().nullable(),
  unitPrice: z.number().int().nonnegative(),
  originalPrice: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  lineTotal: z.number().int().nonnegative(),
  availableStock: z.number().int().nonnegative(),
});

export const cartSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(cartItemSchema),
  subtotal: z.number().int().nonnegative(),
});

export const addCartItemRequestSchema = z.object({
  bookId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const updateCartItemRequestSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type AddCartItemRequest = z.infer<typeof addCartItemRequestSchema>;
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>;
