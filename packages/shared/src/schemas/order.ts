import { z } from "zod";

export const orderStatusSchema = z.enum(["pending", "confirmed", "paid", "processing", "shipped", "delivered", "cancelled"]);
export const paymentProviderSchema = z.enum(["sslcommerz", "bkash"]);
export const paymentStatusSchema = z.enum(["pending", "paid", "failed", "cancelled"]);

export const orderItemSchema = z.object({
  bookId: z.string().uuid(),
  title: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().nonnegative(),
});

export const orderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  status: orderStatusSchema,
  paymentProvider: paymentProviderSchema.nullable(),
  paymentStatus: paymentStatusSchema,
  total: z.number().int().nonnegative(),
  items: z.array(orderItemSchema),
  createdAt: z.string().datetime(),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentProvider = z.infer<typeof paymentProviderSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
