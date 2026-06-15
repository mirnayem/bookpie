import { z } from "zod";

export const inventoryItemSchema = z.object({
  bookId: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  coverImageUrl: z.string().url().nullable(),
  stock: z.number().int().nonnegative(),
});

export const stockMovementSchema = z.object({
  id: z.string().uuid(),
  warehouseId: z.string().uuid(),
  bookId: z.string().uuid(),
  quantityDelta: z.number().int(),
  reason: z.string(),
  note: z.string().nullable(),
  createdBy: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});

export const updateStockRequestSchema = z.object({
  stock: z.number().int().nonnegative(),
  note: z.string().max(240).nullable().optional(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type StockMovement = z.infer<typeof stockMovementSchema>;
export type UpdateStockRequest = z.infer<typeof updateStockRequestSchema>;
