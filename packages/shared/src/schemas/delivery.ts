import { z } from "zod";

export const deliveryZoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  city: z.string(),
  fee: z.number().int().nonnegative(),
  isActive: z.boolean(),
});

export const upsertDeliveryZoneRequestSchema = z.object({
  name: z.string().min(1).max(120),
  city: z.string().min(1).max(80),
  fee: z.number().int().nonnegative(),
  isActive: z.boolean().optional(),
});

export const deliveryFeeRequestSchema = z.object({
  city: z.string().min(1).max(80),
  subtotal: z.number().int().nonnegative(),
});

export const deliveryFeeQuoteSchema = z.object({
  city: z.string(),
  fee: z.number().int().nonnegative(),
  freeShipping: z.boolean(),
});

export const riderStatusSchema = z.enum(["active", "inactive", "suspended"]);

export const riderSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  status: riderStatusSchema.or(z.string()),
});

export const upsertRiderRequestSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(6).max(32),
  status: riderStatusSchema.optional(),
});

export const deliveryEventSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  status: z.string(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  note: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const deliveryEventRequestSchema = z.object({
  orderId: z.string().uuid(),
  status: z.string().min(1).max(80),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  note: z.string().max(240).optional(),
});

export const routePlanRequestSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1).max(50),
});

export const routePlanSchema = z.object({
  orderIds: z.array(z.string().uuid()),
  estimatedMinutes: z.number().int().nonnegative(),
});

export const proofUploadRequestSchema = z.object({
  orderId: z.string().uuid(),
  proofUrl: z.string().url(),
  note: z.string().max(240).optional(),
});

export const failedDeliveryRequestSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().min(1).max(240),
  nextAttemptAt: z.string().datetime().optional(),
});

export type DeliveryZone = z.infer<typeof deliveryZoneSchema>;
export type UpsertDeliveryZoneRequest = z.infer<
  typeof upsertDeliveryZoneRequestSchema
>;
export type DeliveryFeeRequest = z.infer<typeof deliveryFeeRequestSchema>;
export type DeliveryFeeQuote = z.infer<typeof deliveryFeeQuoteSchema>;
export type RiderStatus = z.infer<typeof riderStatusSchema>;
export type Rider = z.infer<typeof riderSchema>;
export type UpsertRiderRequest = z.infer<typeof upsertRiderRequestSchema>;
export type DeliveryEvent = z.infer<typeof deliveryEventSchema>;
export type DeliveryEventRequest = z.infer<typeof deliveryEventRequestSchema>;
export type RoutePlanRequest = z.infer<typeof routePlanRequestSchema>;
export type RoutePlan = z.infer<typeof routePlanSchema>;
export type ProofUploadRequest = z.infer<typeof proofUploadRequestSchema>;
export type FailedDeliveryRequest = z.infer<typeof failedDeliveryRequestSchema>;
