import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("realtors")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});