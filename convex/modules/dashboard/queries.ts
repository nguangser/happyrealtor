import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const publishedCount = listings.filter(
      (listing) => listing.status === "published",
    ).length;

    const draftCount = listings.filter(
      (listing) => listing.status === "draft",
    ).length;

    const pendingPaymentCount = listings.filter(
      (listing) => listing.status === "pending_payment",
    ).length;

    const deactivatedCount = listings.filter(
      (listing) => listing.status === "deactivated",
    ).length;

    const realtor = await ctx.db
      .query("realtors")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    return {
      publishedCount,
      draftCount,
      pendingPaymentCount,
      deactivatedCount,
      referralCount: realtor?.referralCount ?? 0,
      partnerTier: realtor?.partnerTier,
    };
  },
});