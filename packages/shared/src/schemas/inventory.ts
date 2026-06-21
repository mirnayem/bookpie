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

export const warehouseOrderSchema = z.object({
  orderId: z.string().uuid(),
  status: z.string(),
  customerId: z.string().uuid(),
  itemCount: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export const batchPickingRequestSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1).max(50),
  note: z.string().max(240).optional(),
});

export const assignPickerRequestSchema = z.object({
  pickerId: z.string().uuid(),
  note: z.string().max(240).optional(),
});

export const barcodeScanRequestSchema = z.object({
  orderId: z.string().uuid(),
  barcode: z.string().min(3).max(80),
});

export const barcodeScanResultSchema = z.object({
  orderId: z.string().uuid(),
  barcode: z.string(),
  matched: z.boolean(),
  bookId: z.string().uuid().nullable(),
  title: z.string().nullable(),
});

export const packingVerificationRequestSchema = z.object({
  orderId: z.string().uuid(),
  packageCount: z.number().int().positive(),
  note: z.string().max(240).optional(),
});

export const dispatchRequestSchema = z.object({
  orderId: z.string().uuid(),
  carrier: z.string().max(80).optional(),
  trackingNumber: z.string().max(120).optional(),
  note: z.string().max(240).optional(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type StockMovement = z.infer<typeof stockMovementSchema>;
export type UpdateStockRequest = z.infer<typeof updateStockRequestSchema>;
export type WarehouseOrder = z.infer<typeof warehouseOrderSchema>;
export type BatchPickingRequest = z.infer<typeof batchPickingRequestSchema>;
export type AssignPickerRequest = z.infer<typeof assignPickerRequestSchema>;
export type BarcodeScanRequest = z.infer<typeof barcodeScanRequestSchema>;
export type BarcodeScanResult = z.infer<typeof barcodeScanResultSchema>;
export type PackingVerificationRequest = z.infer<typeof packingVerificationRequestSchema>;
export type DispatchRequest = z.infer<typeof dispatchRequestSchema>;
