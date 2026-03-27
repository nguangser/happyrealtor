import { mutation } from "../../_generated/server";
import { now } from "../../lib/time";

export const seedDefaultFeeRule = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("feeRules")
      .filter((q) => q.eq(q.field("feeCode"), "STANDARD_LISTING"))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("feeRules", {
      feeType: "listing",
      feeCode: "STANDARD_LISTING",
      feeCents: 9900, // SGD 99.00
      gstPercent: 9,
      isActive: true,
      location: undefined,
      project: undefined,
      effectiveFrom: undefined,
      effectiveTo: undefined,
      createdAt: now(),
      updatedAt: now(),
    });
  },
});