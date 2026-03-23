import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import { logger } from "../../../lib/telemetry/logger";
import { generateReferralCode } from "../../lib/referrals";
import { isValidEmail, isValidSingaporeMobile } from "../../lib/validation";
import {
  getUserByAuthUserId,
  getUserByEmail,
  getUserByReferralCode,
} from "../../lib/users";
import { now } from "../../lib/time";

export const createDomainUser = mutation({
  args: {
    authUserId: v.string(),
    email: v.string(),
    fullName: v.string(),
    mobileNumber: v.optional(v.string()),
    referredByCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!isValidEmail(args.email)) {
      throw new Error("Invalid email");
    }

    if (!isValidSingaporeMobile(args.mobileNumber)) {
      throw new Error("Invalid Singapore mobile number");
    }

    const existing = await getUserByAuthUserId(ctx, args.authUserId);

    if (existing) {
      logger.warn("Domain user already exists", {
        authUserId: args.authUserId,
        email: args.email,
        userId: String(existing._id),
      });

      return existing._id;
    }

    const emailExists = await getUserByEmail(ctx, args.email);

    if (emailExists) {
      throw new Error("Email already exists");
    }

    let referredByUserId: Id<"users"> | undefined;
    let referrerUser: Doc<"users"> | null = null;

    if (args.referredByCode) {
      referrerUser = await getUserByReferralCode(ctx, args.referredByCode);

      if (referrerUser) {
        referredByUserId = referrerUser._id;
      }
    }

    const ts = now();

    const userId = await ctx.db.insert("users", {
      authUserId: args.authUserId,
      email: args.email,
      mobileNumber: args.mobileNumber,
      fullName: args.fullName,
      role: "pending",
      accountStatus: "active",
      onboardingStage: "pending_cea",
      ceaRegNo: undefined,
      isCeaVerified: false,
      isMobileVerified: false,
      referralCode: generateReferralCode(args.fullName),
      referredByUserId,
      lastLoginAt: undefined,
      deletedAt: undefined,
      createdAt: ts,
      updatedAt: ts,
    });

    if (referrerUser && args.referredByCode) {
      await ctx.db.insert("referrals", {
        referrerUserId: referrerUser._id,
        referredUserId: userId,
        referralCode: args.referredByCode,
        status: "signup",
        qualifiedAt: undefined,
        createdAt: ts,
        updatedAt: ts,
      });
    }

    await ctx.db.insert("auditLogs", {
      userId,
      action: "user.created",
      details: {
        authUserId: args.authUserId,
        email: args.email,
      },
      ipAddress: undefined,
      userAgent: undefined,
      timestamp: ts,
    });

    logger.info("Domain user created", {
      authUserId: args.authUserId,
      email: args.email,
      userId: String(userId),
      referredByUserId: referredByUserId ? String(referredByUserId) : undefined,
    });

    return userId;
  },
});

export const updateLastLogin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const ts = now();

    await ctx.db.patch(args.userId, {
      lastLoginAt: ts,
      updatedAt: ts,
    });

    logger.info("User last login updated", {
      userId: String(args.userId),
      email: user.email,
    });

    return { ok: true };
  },
});

export const updateProfileBasics = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    mobileNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const nextFullName = args.fullName ?? user.fullName;
    const nextMobileNumber = args.mobileNumber ?? user.mobileNumber;

    if (!isValidSingaporeMobile(nextMobileNumber)) {
      throw new Error("Invalid Singapore mobile number");
    }

    await ctx.db.patch(args.userId, {
      fullName: nextFullName,
      mobileNumber: nextMobileNumber,
      updatedAt: now(),
    });

    logger.info("User profile basics updated", {
      userId: String(args.userId),
      email: user.email,
    });

    return { ok: true };
  },
});