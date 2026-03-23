import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { now } from "../../lib/time";
import {
  extractBusinessName,
  getDefaultRealtorTagline,
} from "../../lib/realtors";
import { createNotification } from "../../lib/notifications";
import { logger } from "../../../lib/telemetry/logger";
import {
  assertActiveAccount,
  assertOnboardingStage,
  assertReadyForProfileSetup,
} from "../../lib/onboarding";
import { isValidSingaporeMobile } from "../../lib/validation";

/**
 * =========================
 * CEA VERIFICATION
 * =========================
 */
export const submitCeaVerification = mutation({
  args: {
    userId: v.id("users"),
    ceaRegNo: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    assertActiveAccount(user.accountStatus);
    assertOnboardingStage(user.onboardingStage, "pending_cea");

    const normalizedCeaRegNo = args.ceaRegNo.trim().toUpperCase();

    const ceaRecord = await ctx.db
      .query("ceaSalespersons")
      .withIndex("by_registrationNo", (q) =>
        q.eq("registrationNo", normalizedCeaRegNo),
      )
      .unique();

    if (!ceaRecord || !ceaRecord.isActive) {
      throw new Error("Invalid or inactive CEA registration");
    }

    const ts = now();

    /**
     * 👇 PREFILL REALTOR FROM CEA
     */
    const existingRealtor = await ctx.db
      .query("realtors")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existingRealtor) {
      await ctx.db.patch(existingRealtor._id, {
        agencyName: ceaRecord.estateAgentName,
        agencyLicenseNo: ceaRecord.estateAgentLicenceNo,
        updatedAt: ts,
      });
    } else {
      await ctx.db.insert("realtors", {
        userId: args.userId,
        businessName: extractBusinessName(user.fullName),
        tagline: getDefaultRealtorTagline(),

        // 👇 CEA PREFILL
        agencyName: ceaRecord.estateAgentName,
        agencyLicenseNo: ceaRecord.estateAgentLicenceNo,

        referralCount: 0,
        loyaltyDiscountPercent: 0,
        commissionCutPercent: 0,
        isPublicProfileEnabled: false,
        createdAt: ts,
        updatedAt: ts,
      });
    }

    /**
     * 👇 UPDATE USER STATE
     */
    await ctx.db.patch(args.userId, {
      ceaRegNo: normalizedCeaRegNo,
      isCeaVerified: true,
      onboardingStage: "pending_otp",
      updatedAt: ts,
    });

    logger.info("CEA verification submitted", {
      userId: String(args.userId),
      ceaRegNo: normalizedCeaRegNo,
    });

    return {
      ok: true,
      nextStage: "pending_otp" as const,
    };
  },
});

/**
 * =========================
 * PROFILE SETUP
 * =========================
 */
export const completeProfileSetup = mutation({
  args: {
    userId: v.id("users"),
    agencyName: v.optional(v.string()),
    agencyLicenseNo: v.optional(v.string()),
    about: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    profileImageId: v.optional(v.id("mediaAssets")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    assertActiveAccount(user.accountStatus);
    assertReadyForProfileSetup({
      isCeaVerified: user.isCeaVerified,
      isMobileVerified: user.isMobileVerified,
    });

    if (user.onboardingStage !== "profile_setup") {
      throw new Error("User is not in profile setup stage");
    }

    if (
      args.whatsappNumber &&
      !isValidSingaporeMobile(args.whatsappNumber)
    ) {
      throw new Error("Invalid WhatsApp number");
    }

    const existingRealtor = await ctx.db
      .query("realtors")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const ts = now();

    if (existingRealtor) {
      await ctx.db.patch(existingRealtor._id, {
        agencyName: args.agencyName ?? existingRealtor.agencyName,
        agencyLicenseNo:
          args.agencyLicenseNo ?? existingRealtor.agencyLicenseNo,
        about: args.about,
        whatsappNumber: args.whatsappNumber,
        facebookUrl: args.facebookUrl,
        instagramUrl: args.instagramUrl,
        linkedinUrl: args.linkedinUrl,
        websiteUrl: args.websiteUrl,
        specialties: args.specialties,
        profileImageId: args.profileImageId,
        isPublicProfileEnabled: true,
        updatedAt: ts,
      });
    } else {
      // fallback (should not happen normally)
      await ctx.db.insert("realtors", {
        userId: args.userId,
        businessName: extractBusinessName(user.fullName),
        tagline: getDefaultRealtorTagline(),
        agencyName: args.agencyName,
        agencyLicenseNo: args.agencyLicenseNo,
        about: args.about,
        whatsappNumber: args.whatsappNumber,
        facebookUrl: args.facebookUrl,
        instagramUrl: args.instagramUrl,
        linkedinUrl: args.linkedinUrl,
        websiteUrl: args.websiteUrl,
        specialties: args.specialties,
        profileImageId: args.profileImageId,
        referralCount: 0,
        loyaltyDiscountPercent: 0,
        commissionCutPercent: 0,
        isPublicProfileEnabled: true,
        createdAt: ts,
        updatedAt: ts,
      });
    }

    /**
     * 👇 FINAL USER STATE
     */
    await ctx.db.patch(args.userId, {
      role: "realtor",
      onboardingStage: "completed",
      updatedAt: ts,
    });

    await createNotification(ctx, {
      userId: args.userId,
      type: "onboarding_completed",
      title: "Welcome aboard",
      message: "Your realtor profile is now active.",
      entityType: "user",
      entityId: String(args.userId),
      createdAt: ts,
    });

    logger.info("Profile setup completed", {
      userId: String(args.userId),
    });

    return {
      ok: true,
      nextStage: "completed" as const,
    };
  },
});