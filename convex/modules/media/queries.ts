import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getImageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getMediaAssetById = query({
  args: {
    mediaAssetId: v.id("mediaAssets"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.mediaAssetId);
  },
});

export const getMediaAssetsByIds = query({
  args: {
    mediaAssetIds: v.array(v.id("mediaAssets")),
  },
  handler: async (ctx, args) => {
    const items = await Promise.all(
      args.mediaAssetIds.map(async (id) => await ctx.db.get(id)),
    );

    return items.filter((item): item is NonNullable<typeof item> => item !== null);
  },
});