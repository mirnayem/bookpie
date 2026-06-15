import { z } from "zod";

export const customerAddressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  label: z.string(),
  recipientName: z.string(),
  phone: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string(),
  zone: z.string().nullable(),
  postalCode: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  isDefault: z.boolean(),
});

export const customerProfileSchema = z.object({
  userId: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  phone: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  addresses: z.array(customerAddressSchema),
});

export const updateProfileRequestSchema = z.object({
  displayName: z.string().min(1).max(160).nullable().optional(),
  phone: z.string().min(6).max(32).nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
});

export const upsertAddressRequestSchema = z.object({
  label: z.string().min(1).max(80),
  recipientName: z.string().min(1).max(160),
  phone: z.string().min(6).max(32),
  addressLine1: z.string().min(5).max(240),
  addressLine2: z.string().max(240).nullable().optional(),
  city: z.string().min(1).max(120),
  zone: z.string().max(120).nullable().optional(),
  postalCode: z.string().max(32).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  isDefault: z.boolean(),
});

export const adminCustomerSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  addressCount: z.number().int().nonnegative(),
});

export type CustomerAddress = z.infer<typeof customerAddressSchema>;
export type CustomerProfile = z.infer<typeof customerProfileSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
export type UpsertAddressRequest = z.infer<typeof upsertAddressRequestSchema>;
export type AdminCustomerSummary = z.infer<typeof adminCustomerSummarySchema>;
