import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createMediaAsset = mutation({
  args: {
    userId: v.id("users"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
  },
  handler: async (ctx, args) => {
    const ts = Date.now();

    return await ctx.db.insert("mediaAssets", {
      userId: args.userId,
      storageId: args.storageId,
      fileName: args.fileName,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
      altText: undefined,
      title: undefined,
      createdAt: ts,
      updatedAt: ts,
    });
  },
});

export const deleteMediaAssetIfUnreferenced = mutation({
  args: {
    mediaAssetId: v.id("mediaAssets"),
  },
  handler: async (ctx, args) => {
    const mediaAsset = await ctx.db.get(args.mediaAssetId);
    if (!mediaAsset) {
      return { ok: true, deleted: false, reason: "not_found" as const };
    }

    const listings = await ctx.db.query("listings").collect();

    const isReferenced = listings.some((listing) => {
      const inImageIds = listing.imageIds?.some(
        (imageId) => String(imageId) === String(args.mediaAssetId),
      );

      const isCover =
        listing.coverImageId &&
        String(listing.coverImageId) === String(args.mediaAssetId);

      return Boolean(inImageIds || isCover);
    });

    if (isReferenced) {
      return { ok: true, deleted: false, reason: "still_referenced" as const };
    }

    await ctx.storage.delete(mediaAsset.storageId);
    await ctx.db.delete(args.mediaAssetId);

    return { ok: true, deleted: true, reason: "deleted" as const };
  },
});