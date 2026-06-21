import { z } from "zod";

export const notificationChannelSchema = z.enum(["email", "sms", "push", "whatsapp"]);
export const notificationStatusSchema = z.enum(["queued", "sent", "failed"]);

export const notificationEventSchema = z.object({
  id: z.string().uuid(),
  channel: notificationChannelSchema,
  recipient: z.string(),
  subject: z.string().nullable(),
  body: z.string(),
  status: notificationStatusSchema,
  metadata: z.record(z.unknown()),
  createdAt: z.string().datetime(),
  sentAt: z.string().datetime().nullable(),
});

export const sendNotificationRequestSchema = z.object({
  recipient: z.string().min(3).max(180),
  subject: z.string().max(160).optional(),
  body: z.string().min(1).max(2000),
  metadata: z.record(z.unknown()).optional(),
});

export const orderNotificationRequestSchema = z.object({
  orderId: z.string().uuid(),
  event: z.string().min(1).max(80),
  recipient: z.string().min(3).max(180),
});

export const marketingNotificationRequestSchema = z.object({
  subject: z.string().min(1).max(160),
  body: z.string().min(1).max(2000),
  channels: z.array(notificationChannelSchema).min(1).max(4),
  recipients: z.array(z.string().min(1).max(100)).min(1).max(100),
});

export const registerPushTokenRequestSchema = z.object({
  token: z.string().min(10).max(512),
  platform: z.enum(["web", "ios", "android"]),
});

export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
export type NotificationStatus = z.infer<typeof notificationStatusSchema>;
export type NotificationEvent = z.infer<typeof notificationEventSchema>;
export type SendNotificationRequest = z.infer<
  typeof sendNotificationRequestSchema
>;
export type OrderNotificationRequest = z.infer<
  typeof orderNotificationRequestSchema
>;
export type MarketingNotificationRequest = z.infer<
  typeof marketingNotificationRequestSchema
>;
export type RegisterPushTokenRequest = z.infer<
  typeof registerPushTokenRequestSchema
>;
