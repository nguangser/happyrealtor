import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { logger } from "../../../lib/telemetry/logger";
import { isValidSingaporeMobile } from "../../lib/validation";
import { now } from "../../lib/time";
import {
  generateOtp,
  hashOtp,
  OTP_FAILED_ATTEMPT_LIMIT,
  OTP_LOCK_MS,
  OTP_RESEND_LIMIT,
  OTP_TTL_MS,
} from "../../lib/otp";

export const requestOtp = mutation({
  args: {
    userId: v.id("users"),
    mobileNumber: v.string(),
    purpose: v.union(
      v.literal("signup"),
      v.literal("login"),
      v.literal("reset_password"),
      v.literal("verify_mobile"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    if (!isValidSingaporeMobile(args.mobileNumber)) {
      throw new Error("Invalid Singapore mobile number");
    }

    const existing = await ctx.db
      .query("otpVerifications")
      .withIndex("by_mobileNumber_purpose", (q) =>
        q.eq("mobileNumber", args.mobileNumber).eq("purpose", args.purpose),
      )
      .collect();

    const ts = now();

    const activeRecords = existing.filter(
      (r) => !r.consumedAt && r.expiresAt > ts,
    );

    const latest = activeRecords.sort((a, b) => b.createdAt - a.createdAt)[0];

    if (latest?.lockedUntil && latest.lockedUntil > ts) {
      logger.warn("OTP request blocked by lock", {
        userId: String(args.userId),
        mobileNumber: args.mobileNumber,
        purpose: args.purpose,
      });
      throw new Error("OTP is temporarily locked");
    }

    if (latest && latest.resendCount >= OTP_RESEND_LIMIT) {
      logger.warn("OTP resend limit reached", {
        userId: String(args.userId),
        mobileNumber: args.mobileNumber,
        purpose: args.purpose,
      });
      throw new Error("OTP resend limit reached");
    }

    const code = generateOtp();
    const codeHash = await hashOtp(code);

    if (latest) {
      await ctx.db.patch(latest._id, {
        codeHash,
        expiresAt: ts + OTP_TTL_MS,
        resendCount: latest.resendCount + 1,
        updatedAt: ts,
      });
    } else {
      await ctx.db.insert("otpVerifications", {
        mobileNumber: args.mobileNumber,
        codeHash,
        purpose: args.purpose,
        expiresAt: ts + OTP_TTL_MS,
        consumedAt: undefined,
        resendCount: 0,
        failedAttemptCount: 0,
        lockedUntil: undefined,
        createdAt: ts,
        updatedAt: ts,
      });
    }

    await ctx.db.patch(args.userId, {
      mobileNumber: args.mobileNumber,
      updatedAt: ts,
    });

    logger.info("OTP requested", {
      userId: String(args.userId),
      mobileNumber: args.mobileNumber,
      purpose: args.purpose,
      expiresAt: ts + OTP_TTL_MS,
    });

    console.log(`[MOCK OTP] ${args.mobileNumber} => ${code}`);

    return {
      ok: true,
      expiresAt: ts + OTP_TTL_MS,
    };
  },
});

export const verifyOtp = mutation({
  args: {
    userId: v.id("users"),
    mobileNumber: v.string(),
    purpose: v.union(
      v.literal("signup"),
      v.literal("login"),
      v.literal("reset_password"),
      v.literal("verify_mobile"),
    ),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const records = await ctx.db
      .query("otpVerifications")
      .withIndex("by_mobileNumber_purpose", (q) =>
        q.eq("mobileNumber", args.mobileNumber).eq("purpose", args.purpose),
      )
      .collect();

    const latest = records.sort((a, b) => b.createdAt - a.createdAt)[0];
    if (!latest) throw new Error("OTP not found");

    const ts = now();

    if (latest.lockedUntil && latest.lockedUntil > ts) {
      logger.warn("OTP verify blocked by lock", {
        userId: String(args.userId),
        mobileNumber: args.mobileNumber,
        purpose: args.purpose,
      });
      throw new Error("OTP is locked");
    }

    if (latest.consumedAt) {
      throw new Error("OTP has already been used");
    }

    if (latest.expiresAt < ts) {
      throw new Error("OTP has expired");
    }

    const incomingHash = await hashOtp(args.code);

    if (incomingHash !== latest.codeHash) {
      const failedAttemptCount = latest.failedAttemptCount + 1;
      const lockedUntil =
        failedAttemptCount >= OTP_FAILED_ATTEMPT_LIMIT
          ? ts + OTP_LOCK_MS
          : undefined;

      await ctx.db.patch(latest._id, {
        failedAttemptCount,
        lockedUntil,
        updatedAt: ts,
      });

      logger.warn("OTP verification failed", {
        userId: String(args.userId),
        mobileNumber: args.mobileNumber,
        purpose: args.purpose,
        failedAttemptCount,
        lockedUntil,
      });

      throw new Error(
        lockedUntil ? "Too many failed attempts. OTP locked." : "Invalid OTP",
      );
    }

    await ctx.db.patch(latest._id, {
      consumedAt: ts,
      updatedAt: ts,
    });

    await ctx.db.patch(args.userId, {
      mobileNumber: args.mobileNumber,
      isMobileVerified: true,
      onboardingStage: "profile_setup",
      updatedAt: ts,
    });

    logger.info("OTP verified", {
      userId: String(args.userId),
      mobileNumber: args.mobileNumber,
      purpose: args.purpose,
    });

    return {
      ok: true,
      nextStage: "profile_setup" as const,
    };
  },
});