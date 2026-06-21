import { z } from "zod";

export const reviewStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const productReviewSchema = z.object({
  id: z.string().uuid(),
  bookId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().nullable(),
  body: z.string(),
  status: reviewStatusSchema,
  photoUrls: z.array(z.string()),
  moderatedBy: z.string().uuid().nullable(),
  moderatedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export const productRatingSummarySchema = z.object({
  bookId: z.string().uuid(),
  averageRating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
});

export const createReviewRequestSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(1).max(2000),
  photoUrls: z.array(z.string().url()).max(6).optional(),
});

export const moderateReviewRequestSchema = z.object({
  status: reviewStatusSchema,
});

export type ReviewStatus = z.infer<typeof reviewStatusSchema>;
export type ProductReview = z.infer<typeof productReviewSchema>;
export type ProductRatingSummary = z.infer<typeof productRatingSummarySchema>;
export type CreateReviewRequest = z.infer<typeof createReviewRequestSchema>;
export type ModerateReviewRequest = z.infer<typeof moderateReviewRequestSchema>;
