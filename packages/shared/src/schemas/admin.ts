import { z } from "zod";

export const adminDashboardSummarySchema = z.object({
  totalCustomers: z.number().int().nonnegative(),
  totalBooks: z.number().int().nonnegative(),
  totalOrders: z.number().int().nonnegative(),
  pendingOrders: z.number().int().nonnegative(),
  lowStockBooks: z.number().int().nonnegative(),
  paidRevenue: z.number().int().nonnegative(),
});

export const adminListQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  search: z.string().min(3).max(120).optional(),
  status: z.string().min(1).max(80).optional(),
});

export const adminInventoryStatusSchema = z.enum(["all", "low", "out"]);

export const adminInventoryQuerySchema = adminListQuerySchema.extend({
  stockStatus: adminInventoryStatusSchema.optional(),
  bookId: z.string().uuid().optional(),
});

export type AdminDashboardSummary = z.infer<
  typeof adminDashboardSummarySchema
>;
export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
export type AdminInventoryStatus = z.infer<typeof adminInventoryStatusSchema>;
export type AdminInventoryQuery = z.infer<typeof adminInventoryQuerySchema>;
