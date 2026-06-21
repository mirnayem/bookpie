import { z } from "zod";

export const dashboardMetricsSchema = z.object({
  totalCustomers: z.number().int().nonnegative(),
  totalBooks: z.number().int().nonnegative(),
  totalOrders: z.number().int().nonnegative(),
  pendingOrders: z.number().int().nonnegative(),
  paidRevenue: z.number().int().nonnegative(),
});

export const moneyReportSchema = z.object({
  grossMerchandiseValue: z.number().int().nonnegative(),
  paidRevenue: z.number().int().nonnegative(),
  averageOrderValue: z.number().int().nonnegative(),
});

export const inventoryReportSchema = z.object({
  totalStock: z.number().int().nonnegative(),
  lowStockBooks: z.number().int().nonnegative(),
  outOfStockBooks: z.number().int().nonnegative(),
  estimatedStockValue: z.number().int().nonnegative(),
});

export const warehouseReportSchema = z.object({
  pending: z.number().int().nonnegative(),
  picking: z.number().int().nonnegative(),
  packed: z.number().int().nonnegative(),
  outForDelivery: z.number().int().nonnegative(),
});

export const deliveryReportSchema = z.object({
  assigned: z.number().int().nonnegative(),
  pickedUp: z.number().int().nonnegative(),
  delivered: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});

export const cohortReportSchema = z.object({
  newCustomers30d: z.number().int().nonnegative(),
  ordersFromNewCustomers30d: z.number().int().nonnegative(),
});

export const retentionReportSchema = z.object({
  repeatCustomers: z.number().int().nonnegative(),
  customersWithOrders: z.number().int().nonnegative(),
  repeatCustomerRate: z.number().min(0).max(1),
});

export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
export type MoneyReport = z.infer<typeof moneyReportSchema>;
export type InventoryReport = z.infer<typeof inventoryReportSchema>;
export type WarehouseReport = z.infer<typeof warehouseReportSchema>;
export type DeliveryReport = z.infer<typeof deliveryReportSchema>;
export type CohortReport = z.infer<typeof cohortReportSchema>;
export type RetentionReport = z.infer<typeof retentionReportSchema>;
