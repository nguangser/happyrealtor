import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const createMockPaidBilling = mutation({
  args: {
    userId: v.id("users"),
    listingId: v.id("listings"),
    feeRuleId: v.id("feeRules"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    const feeRule = await ctx.db.get(args.feeRuleId);
    if (!feeRule) throw new Error("Fee rule not found");

    const ts = Date.now();

    return await ctx.db.insert("billings", {
      userId: args.userId,
      listingId: args.listingId,
      feeRuleId: args.feeRuleId,
      feeType: feeRule.feeType,
      feeCode: feeRule.feeCode,
      feeCents: feeRule.feeCents,
      gstPercent: feeRule.gstPercent,
      totalCents: Math.round(feeRule.feeCents * (1 + feeRule.gstPercent / 100)),
      currency: "SGD",
      paymentProvider: "mock",
      paymentProviderTransactionId: `MOCK-${ts}`,
      paymentStatus: "paid",
      idempotencyKey: `mock-${args.listingId}-${ts}`,
      createdAt: ts,
      updatedAt: ts,
    });
  },
});