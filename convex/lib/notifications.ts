import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type NotificationEntityType =
  | "listing"
  | "branding_booking"
  | "billing"
  | "referral"
  | "user"
  | "property"
  | "content_page"
  | "media_asset";

export async function createNotification(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    type: string;
    title: string;
    message: string;
    entityType: NotificationEntityType;
    entityId?: string;
    createdAt: number;
  },
) {
  return await ctx.db.insert("notifications", {
    userId: args.userId,
    type: args.type,
    title: args.title,
    message: args.message,
    entityType: args.entityType,
    entityId: args.entityId,
    isRead: false,
    createdAt: args.createdAt,
    updatedAt: args.createdAt,
  });
}