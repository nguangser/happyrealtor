import { query } from "../../_generated/server";
import { v } from "convex/values";

export const listActiveFeeRules = query({
  args: {},
  handler: async (ctx) => {
    const feeRules = await ctx.db.query("feeRules").collect();
    return feeRules.filter((rule) => rule.isActive);
  },
});

export const getFeeRuleById = query({
  args: {
    feeRuleId: v.id("feeRules"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.feeRuleId);
  },
});