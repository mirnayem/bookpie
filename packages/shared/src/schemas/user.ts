import { z } from "zod";

export const userRoleSchema = z.enum(["customer", "admin"]);

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: userRoleSchema,
  createdAt: z.string().datetime(),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type User = z.infer<typeof userSchema>;
