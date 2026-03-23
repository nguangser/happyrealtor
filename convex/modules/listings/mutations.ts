import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { logger } from "../../../lib/telemetry/logger";
import { now } from "../../lib/time";
import { slugify, ensureUniqueListingSlug } from "../../lib/listings";
import { assertOwner } from "../../lib/access";
import {
  validateListingPricing,
  validateListingContactNumbers,
} from "../../lib/listingValidation";
import { createNotification } from "../../lib/notifications";
import {
  assertBillingPaid,
  calculateListingExpiry,
  calculateNextListingRefresh,
} from "../../lib/billings";

export const createDraft = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    propertyId: v.optional(v.id("properties")),
    propertyCategory: v.union(
      v.literal("residential"),
      v.literal("commercial"),
      v.literal("industrial"),
      v.literal("land"),
    ),
    propertyTypeId: v.optional(v.id("propertyTypes")),
    propertySubTypeId: v.optional(v.id("propertySubTypes")),
    propertyModelId: v.optional(v.id("propertyModels")),
    districtId: v.optional(v.id("districts")),
    estateId: v.optional(v.id("estates")),
    tenureId: v.optional(v.id("tenures")),
    block: v.optional(v.string()),
    streetName: v.optional(v.string()),
    address: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    floorArea: v.optional(v.number()),
    floorAreaUnit: v.optional(v.string()),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    askPrice: v.optional(v.number()),
    isNewProject: v.boolean(),
    isPriceOnAsk: v.boolean(),
    amenities: v.optional(v.array(v.string())),
    featureTags: v.optional(v.array(v.string())),
    coverImageId: v.optional(v.id("mediaAssets")),
    imageIds: v.optional(v.array(v.id("mediaAssets"))),
    videoLinks: v.optional(v.array(v.string())),
    contactName: v.optional(v.string()),
    contactMobileNumber: v.optional(v.string()),
    contactWhatsappNumber: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    mrtStation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    if (
      user.role !== "realtor" &&
      user.role !== "admin" &&
      user.role !== "superadmin"
    ) {
      throw new Error("Only activated users can create listings");
    }

    if (user.accountStatus !== "active") {
      throw new Error("Account is not active");
    }

    validateListingPricing({
      isNewProject: args.isNewProject,
      isPriceOnAsk: args.isPriceOnAsk,
      askPrice: args.askPrice,
    });

    validateListingContactNumbers({
      contactMobileNumber: args.contactMobileNumber,
      contactWhatsappNumber: args.contactWhatsappNumber,
    });

    const ts = now();
    const slug = await ensureUniqueListingSlug(ctx, slugify(args.title));

    const listingId = await ctx.db.insert("listings", {
      userId: args.userId,
      slug,
      title: args.title,
      description: args.description,
      propertyId: args.propertyId,
      propertyCategory: args.propertyCategory,
      propertyTypeId: args.propertyTypeId,
      propertySubTypeId: args.propertySubTypeId,
      propertyModelId: args.propertyModelId,
      districtId: args.districtId,
      estateId: args.estateId,
      tenureId: args.tenureId,
      block: args.block,
      streetName: args.streetName,
      address: args.address,
      postalCode: args.postalCode,
      floorArea: args.floorArea,
      floorAreaUnit: args.floorAreaUnit,
      bedrooms: args.bedrooms,
      bathrooms: args.bathrooms,
      askPrice: args.isPriceOnAsk ? undefined : args.askPrice,
      isNewProject: args.isNewProject,
      isPriceOnAsk: args.isPriceOnAsk,
      amenities: args.amenities,
      featureTags: args.featureTags,
      coverImageId: args.coverImageId,
      imageIds: args.imageIds,
      videoLinks: args.videoLinks,
      contactName: args.contactName,
      contactMobileNumber: args.contactMobileNumber,
      contactWhatsappNumber: args.contactWhatsappNumber,
      latitude: args.latitude,
      longitude: args.longitude,
      mrtStation: args.mrtStation,
      publishedAt: undefined,
      billingId: undefined,
      feeRuleId: undefined,
      status: "draft",
      lastRefreshAt: undefined,
      nextRefreshAt: undefined,
      expiresAt: undefined,
      isSearchIndexed: false,
      createdAt: ts,
      updatedAt: ts,
    });

    logger.info("Listing draft created", {
      listingId: String(listingId),
      userId: String(args.userId),
      title: args.title,
      slug,
    });

    return listingId;
  },
});

export const updateDraft = mutation({
  args: {
    listingId: v.id("listings"),
    userId: v.id("users"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    askPrice: v.optional(v.number()),
    isPriceOnAsk: v.optional(v.boolean()),
    isNewProject: v.optional(v.boolean()),
    amenities: v.optional(v.array(v.string())),
    featureTags: v.optional(v.array(v.string())),
    coverImageId: v.optional(v.id("mediaAssets")),
    imageIds: v.optional(v.array(v.id("mediaAssets"))),
    contactName: v.optional(v.string()),
    contactMobileNumber: v.optional(v.string()),
    contactWhatsappNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    assertOwner(String(listing.userId), String(args.userId));

    if (listing.status !== "draft" && listing.status !== "pending_payment") {
      throw new Error("Only draft or pending payment listings can be edited");
    }

    const nextIsNewProject = args.isNewProject ?? listing.isNewProject;
    const nextIsPriceOnAsk = args.isPriceOnAsk ?? listing.isPriceOnAsk;
    const nextAskPrice = args.askPrice ?? listing.askPrice;

    validateListingPricing({
      isNewProject: nextIsNewProject,
      isPriceOnAsk: nextIsPriceOnAsk,
      askPrice: nextAskPrice ?? undefined,
    });

    validateListingContactNumbers({
      contactMobileNumber: args.contactMobileNumber,
      contactWhatsappNumber: args.contactWhatsappNumber,
    });

    const ts = now();
    const patch: Record<string, unknown> = {
      updatedAt: ts,
    };

    if (args.title !== undefined) {
      patch.title = args.title;
      patch.slug = await ensureUniqueListingSlug(ctx, slugify(args.title));
    }
    if (args.description !== undefined) patch.description = args.description;
    if (args.askPrice !== undefined) patch.askPrice = args.askPrice;
    if (args.isPriceOnAsk !== undefined) patch.isPriceOnAsk = args.isPriceOnAsk;
    if (args.isNewProject !== undefined) patch.isNewProject = args.isNewProject;
    if (args.amenities !== undefined) patch.amenities = args.amenities;
    if (args.featureTags !== undefined) patch.featureTags = args.featureTags;
    if (args.coverImageId !== undefined) patch.coverImageId = args.coverImageId;
    if (args.imageIds !== undefined) patch.imageIds = args.imageIds;
    if (args.contactName !== undefined) patch.contactName = args.contactName;
    if (args.contactMobileNumber !== undefined) {
      patch.contactMobileNumber = args.contactMobileNumber;
    }
    if (args.contactWhatsappNumber !== undefined) {
      patch.contactWhatsappNumber = args.contactWhatsappNumber;
    }

    await ctx.db.patch(args.listingId, patch);

    logger.info("Listing draft updated", {
      listingId: String(args.listingId),
      userId: String(args.userId),
    });

    return { ok: true };
  },
});

export const submitForPayment = mutation({
  args: {
    listingId: v.id("listings"),
    userId: v.id("users"),
    feeRuleId: v.id("feeRules"),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    assertOwner(String(listing.userId), String(args.userId));

    if (listing.status !== "draft") {
      throw new Error("Only draft listings can be submitted for payment");
    }

    const ts = now();

    await ctx.db.patch(args.listingId, {
      status: "pending_payment",
      feeRuleId: args.feeRuleId,
      updatedAt: ts,
    });

    logger.info("Listing submitted for payment", {
      listingId: String(args.listingId),
      userId: String(args.userId),
      feeRuleId: String(args.feeRuleId),
    });

    return {
      ok: true,
      status: "pending_payment" as const,
    };
  },
});

export const publishAfterPayment = mutation({
  args: {
    listingId: v.id("listings"),
    billingId: v.id("billings"),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    const billing = await ctx.db.get(args.billingId);
    if (!billing) throw new Error("Billing not found");

    assertBillingPaid(billing);

    const ts = now();
    const expiresAt = calculateListingExpiry(ts);
    const nextRefreshAt = calculateNextListingRefresh(ts);

    await ctx.db.patch(args.listingId, {
      status: "published",
      billingId: args.billingId,
      publishedAt: ts,
      lastRefreshAt: ts,
      nextRefreshAt,
      expiresAt,
      isSearchIndexed: false,
      updatedAt: ts,
    });

    await createNotification(ctx, {
      userId: listing.userId,
      type: "listing_published",
      title: "Listing published",
      message: `${listing.title} is now live.`,
      entityType: "listing",
      entityId: String(args.listingId),
      createdAt: ts,
    });

    logger.info("Listing published after payment", {
      listingId: String(args.listingId),
      billingId: String(args.billingId),
      userId: String(listing.userId),
    });

    return { ok: true, status: "published" as const };
  },
});

export const deactivateListing = mutation({
  args: {
    listingId: v.id("listings"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) throw new Error("Listing not found");

    assertOwner(String(listing.userId), String(args.userId));

    const ts = now();

    await ctx.db.patch(args.listingId, {
      status: "deactivated",
      updatedAt: ts,
    });

    logger.info("Listing deactivated", {
      listingId: String(args.listingId),
      userId: String(args.userId),
    });

    return { ok: true, status: "deactivated" as const };
  },
});