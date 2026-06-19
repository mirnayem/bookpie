import { z } from "zod";

export const userRoleSchema = z.enum([
  "customer",
  "warehouse_manager",
  "delivery_agent",
  "admin",
  "super_admin",
]);

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: userRoleSchema,
  isActive: z.boolean().optional(),
  createdAt: z.string().datetime(),
});

export const adminUpdateUserRequestSchema = z.object({
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type User = z.infer<typeof userSchema>;
export type AdminUpdateUserRequest = z.infer<typeof adminUpdateUserRequestSchema>;
