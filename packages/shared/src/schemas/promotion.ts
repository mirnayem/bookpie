import { z } from "zod";

export const couponDiscountTypeSchema = z.enum(["percent", "fixed", "free_shipping"]);

export const couponSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  discountType: couponDiscountTypeSchema,
  discountValue: z.number().int().nonnegative(),
  minOrderTotal: z.number().int().nonnegative(),
  usageLimit: z.number().int().positive().nullable(),
  usedCount: z.number().int().nonnegative(),
  startsAt: z.string().datetime().nullable(),
  endsAt: z.string().datetime().nullable(),
  isActive: z.boolean(),
});

export const upsertCouponRequestSchema = z.object({
  code: z.string().min(2).max(40),
  name: z.string().min(1).max(120),
  discountType: couponDiscountTypeSchema,
  discountValue: z.number().int().nonnegative(),
  minOrderTotal: z.number().int().nonnegative(),
  usageLimit: z.number().int().positive().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const validateCouponRequestSchema = z.object({
  code: z.string().min(2).max(40),
  subtotal: z.number().int().nonnegative(),
  shippingFee: z.number().int().nonnegative().optional(),
});

export const couponValidationSchema = z.object({
  valid: z.boolean(),
  code: z.string(),
  discount: z.number().int().nonnegative(),
  freeShipping: z.boolean(),
  message: z.string(),
});

export const buyXGetYRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  buyBookId: z.string().uuid(),
  getBookId: z.string().uuid(),
  buyQuantity: z.number().int().positive(),
  getQuantity: z.number().int().positive(),
  startsAt: z.string().datetime().nullable(),
  endsAt: z.string().datetime().nullable(),
  isActive: z.boolean(),
});

export const upsertBuyXGetYRuleRequestSchema = z.object({
  name: z.string().min(1).max(120),
  buyBookId: z.string().uuid(),
  getBookId: z.string().uuid(),
  buyQuantity: z.number().int().positive(),
  getQuantity: z.number().int().positive(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const flashSaleCampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isActive: z.boolean(),
});

export const upsertFlashSaleCampaignRequestSchema = z.object({
  name: z.string().min(1).max(120),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isActive: z.boolean().optional(),
});

export const referralSummarySchema = z.object({
  code: z.string(),
  rewardPoints: z.number().int().nonnegative(),
  referrals: z.number().int().nonnegative(),
});

export const createReferralRequestSchema = z.object({
  code: z.string().min(2).max(40),
});

export const loyaltyAccountSchema = z.object({
  userId: z.string().uuid(),
  points: z.number().int().nonnegative(),
  tier: z.string(),
});

export const adjustLoyaltyRequestSchema = z.object({
  userId: z.string().uuid(),
  pointsDelta: z.number().int(),
  reason: z.string().min(1).max(160),
  orderId: z.string().uuid().optional(),
});

export const cashbackRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  percent: z.number().int().min(0).max(100),
  maxCashback: z.number().int().nonnegative().nullable(),
  minOrderTotal: z.number().int().nonnegative(),
  startsAt: z.string().datetime().nullable(),
  endsAt: z.string().datetime().nullable(),
  isActive: z.boolean(),
});

export const upsertCashbackRuleRequestSchema = z.object({
  name: z.string().min(1).max(120),
  percent: z.number().int().min(0).max(100),
  maxCashback: z.number().int().nonnegative().optional(),
  minOrderTotal: z.number().int().nonnegative(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const membershipPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  price: z.number().int().nonnegative(),
  durationDays: z.number().int().positive(),
  benefits: z.record(z.unknown()),
  isActive: z.boolean(),
});

export const upsertMembershipPlanRequestSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(2).max(80),
  price: z.number().int().nonnegative(),
  durationDays: z.number().int().positive(),
  benefits: z.record(z.unknown()),
  isActive: z.boolean().optional(),
});

export type CouponDiscountType = z.infer<typeof couponDiscountTypeSchema>;
export type Coupon = z.infer<typeof couponSchema>;
export type UpsertCouponRequest = z.infer<typeof upsertCouponRequestSchema>;
export type ValidateCouponRequest = z.infer<typeof validateCouponRequestSchema>;
export type CouponValidation = z.infer<typeof couponValidationSchema>;
export type BuyXGetYRule = z.infer<typeof buyXGetYRuleSchema>;
export type UpsertBuyXGetYRuleRequest = z.infer<
  typeof upsertBuyXGetYRuleRequestSchema
>;
export type FlashSaleCampaign = z.infer<typeof flashSaleCampaignSchema>;
export type UpsertFlashSaleCampaignRequest = z.infer<
  typeof upsertFlashSaleCampaignRequestSchema
>;
export type ReferralSummary = z.infer<typeof referralSummarySchema>;
export type CreateReferralRequest = z.infer<typeof createReferralRequestSchema>;
export type LoyaltyAccount = z.infer<typeof loyaltyAccountSchema>;
export type AdjustLoyaltyRequest = z.infer<typeof adjustLoyaltyRequestSchema>;
export type CashbackRule = z.infer<typeof cashbackRuleSchema>;
export type UpsertCashbackRuleRequest = z.infer<
  typeof upsertCashbackRuleRequestSchema
>;
export type MembershipPlan = z.infer<typeof membershipPlanSchema>;
export type UpsertMembershipPlanRequest = z.infer<
  typeof upsertMembershipPlanRequestSchema
>;
