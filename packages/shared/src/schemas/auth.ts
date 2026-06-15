import { z } from "zod";
import { userSchema } from "./user";

export const registerRequestSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(16),
});

export const logoutRequestSchema = refreshTokenRequestSchema;

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetConfirmRequestSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8).max(128),
});

export const otpPurposeSchema = z.enum([
  "email_verification",
  "phone_verification",
]);

export const otpRequestSchema = z.object({
  email: z.string().email(),
  purpose: otpPurposeSchema,
});

export const verifyOtpRequestSchema = z.object({
  email: z.string().email(),
  purpose: otpPurposeSchema,
  code: z.string().length(6),
});

export const passwordResetResponseSchema = z.object({
  resetToken: z.string().nullable().optional(),
});

export const otpResponseSchema = z.object({
  otpCode: z.string().nullable().optional(),
});

export const verificationResponseSchema = z.object({
  verified: z.boolean(),
});

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const authResponseSchema = z.object({
  user: userSchema,
  tokens: authTokensSchema,
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmRequest = z.infer<
  typeof passwordResetConfirmRequestSchema
>;
export type OtpPurpose = z.infer<typeof otpPurposeSchema>;
export type OtpRequest = z.infer<typeof otpRequestSchema>;
export type VerifyOtpRequest = z.infer<typeof verifyOtpRequestSchema>;
export type PasswordResetResponse = z.infer<typeof passwordResetResponseSchema>;
export type OtpResponse = z.infer<typeof otpResponseSchema>;
export type VerificationResponse = z.infer<typeof verificationResponseSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
