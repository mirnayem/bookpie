import { z } from "zod";

export const adminDashboardSummarySchema = z.object({
  totalCustomers: z.number().int().nonnegative(),
  totalBooks: z.number().int().nonnegative(),
  totalOrders: z.number().int().nonnegative(),
  pendingOrders: z.number().int().nonnegative(),
  lowStockBooks: z.number().int().nonnegative(),
  paidRevenue: z.number().int().nonnegative(),
});

export type AdminDashboardSummary = z.infer<
  typeof adminDashboardSummarySchema
>;
