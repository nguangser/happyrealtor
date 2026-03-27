import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.listingId);
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getPublishedBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!listing) return null;
    if (listing.status !== "published") return null;

    return listing;
  },
});

export const listByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("listings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const listings = await ctx.db.query("listings").collect();
    return listings.filter((listing) => listing.status === "published");
  },
});

export const searchPublished = query({
  args: {
    keyword: v.optional(v.string()),
    propertyCategory: v.optional(
      v.union(
        v.literal("residential"),
        v.literal("commercial"),
        v.literal("industrial"),
        v.literal("land"),
      ),
    ),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("listings").collect();

    const keyword = args.keyword?.trim().toLowerCase();

    return all.filter((listing) => {
      if (listing.status !== "published") return false;

      if (args.propertyCategory && listing.propertyCategory !== args.propertyCategory) {
        return false;
      }

      if (args.minPrice !== undefined) {
        if (listing.askPrice === undefined || listing.askPrice < args.minPrice) {
          return false;
        }
      }

      if (args.maxPrice !== undefined) {
        if (listing.askPrice === undefined || listing.askPrice > args.maxPrice) {
          return false;
        }
      }

      if (keyword) {
        const haystack = [
          listing.title,
          listing.description,
          listing.address,
          listing.streetName,
          listing.mrtStation,
          ...(listing.featureTags ?? []),
          ...(listing.amenities ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(keyword)) {
          return false;
        }
      }

      return true;
    });
  },
});