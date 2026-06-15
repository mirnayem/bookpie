import { z } from "zod";

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "picking",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
]);

export const paymentProviderSchema = z.enum(["sslcommerz", "bkash"]);
export const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "cancelled",
  "refunded",
]);

export const deliveryStatusSchema = z.enum([
  "assigned",
  "picked_up",
  "delivered",
  "failed",
]);

export const orderItemSchema = z.object({
  bookId: z.string().uuid(),
  title: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().nonnegative(),
  lineTotal: z.number().int().nonnegative(),
});

export const deliveryAssignmentSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  agentName: z.string(),
  agentPhone: z.string(),
  status: deliveryStatusSchema,
  note: z.string().nullable(),
});

export const orderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  addressId: z.string().uuid().nullable(),
  status: orderStatusSchema,
  paymentProvider: paymentProviderSchema.nullable(),
  paymentStatus: paymentStatusSchema,
  subtotal: z.number().int().nonnegative(),
  shippingFee: z.number().int().nonnegative(),
  discountTotal: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  items: z.array(orderItemSchema),
  delivery: deliveryAssignmentSchema.nullable(),
  createdAt: z.string().datetime(),
});

export const createOrderRequestSchema = z.object({
  addressId: z.string().uuid(),
  paymentProvider: paymentProviderSchema.nullable().optional(),
});

export const updateOrderStatusRequestSchema = z.object({
  status: orderStatusSchema,
  note: z.string().max(240).nullable().optional(),
});

export const assignDeliveryRequestSchema = z.object({
  agentName: z.string().min(1).max(160),
  agentPhone: z.string().min(6).max(32),
  status: deliveryStatusSchema.optional(),
  note: z.string().max(240).nullable().optional(),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentProvider = z.infer<typeof paymentProviderSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type DeliveryAssignment = z.infer<typeof deliveryAssignmentSchema>;
export type Order = z.infer<typeof orderSchema>;
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
export type UpdateOrderStatusRequest = z.infer<
  typeof updateOrderStatusRequestSchema
>;
export type AssignDeliveryRequest = z.infer<typeof assignDeliveryRequestSchema>;
