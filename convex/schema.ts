import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * =========================================================
 * ENUMS
 * =========================================================
 */

const userRole = v.union(
  v.literal("pending"),
  v.literal("realtor"),
  v.literal("admin"),
  v.literal("superadmin"),
);

const accountStatus = v.union(
  v.literal("active"),
  v.literal("suspended"),
  v.literal("deactivated"),
);

const onboardingStage = v.union(
  v.literal("pending_cea"),
  v.literal("pending_otp"),
  v.literal("profile_setup"),
  v.literal("completed"),
);

const otpPurpose = v.union(
  v.literal("signup"),
  v.literal("login"),
  v.literal("reset_password"),
  v.literal("verify_mobile"),
);

const listingStatus = v.union(
  v.literal("draft"),
  v.literal("pending_payment"),
  v.literal("published"),
  v.literal("deactivated"),
  v.literal("expired"),
);

const bookingStatus = v.union(
  v.literal("pending"),
  v.literal("active"),
  v.literal("completed"),
  v.literal("cancelled"),
  v.literal("expired"),
);

const paymentStatus = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("failed"),
  v.literal("refunded"),
  v.literal("cancelled"),
);

const billingType = v.union(
  v.literal("listing"),
  v.literal("branding"),
);

const feeType = v.union(
  v.literal("listing"),
  v.literal("branding"),
);

const referralStatus = v.union(
  v.literal("signup"),
  v.literal("qualified"),
);

const earningType = v.union(
  v.literal("commission"),
  v.literal("bonus"),
);

const earningStatus = v.union(
  v.literal("earned"),
  v.literal("paid"),
);

const brandingSpaceType = v.union(
  v.literal("featured_realtor"),
  v.literal("project_tagger"),
  v.literal("team_building"),
);

const entityType = v.union(
  v.literal("listing"),
  v.literal("branding_booking"),
  v.literal("billing"),
  v.literal("referral"),
  v.literal("user"),
  v.literal("property"),
  v.literal("content_page"),
  v.literal("media_asset"),
);

const propertyCategoryCode = v.union(
  v.literal("residential"),
  v.literal("commercial"),
  v.literal("industrial"),
  v.literal("land"),
);

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

const timestamps = {
  createdAt: v.number(),
  updatedAt: v.number(),
};

/**
 * =========================================================
 * SCHEMA
 * =========================================================
 */

export default defineSchema({
  /**
   * Domain user profile.
   * Better Auth identity should live separately in auth tables.
   */
  users: defineTable({
    authUserId: v.string(), // Better Auth user.id
    email: v.string(),
    mobileNumber: v.optional(v.string()),
    fullName: v.string(),

    role: userRole,
    accountStatus: accountStatus,
    onboardingStage: onboardingStage,

    ceaRegNo: v.optional(v.string()),
    isCeaVerified: v.boolean(),
    isMobileVerified: v.boolean(),

    referralCode: v.string(),
    referredByUserId: v.optional(v.id("users")),

    lastLoginAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),

    ...timestamps,
  })
    .index("by_authUserId", ["authUserId"])
    .index("by_email", ["email"])
    .index("by_mobileNumber", ["mobileNumber"])
    .index("by_ceaRegNo", ["ceaRegNo"])
    .index("by_referralCode", ["referralCode"])
    .index("by_referredByUserId", ["referredByUserId"])
    .index("by_role", ["role"])
    .index("by_accountStatus", ["accountStatus"])
    .index("by_onboardingStage", ["onboardingStage"]),

  realtors: defineTable({
    userId: v.id("users"),

    businessName: v.string(),
    tagline: v.string(),

    agencyName: v.optional(v.string()),
    agencyLicenseNo: v.optional(v.string()),
    profileImageId: v.optional(v.id("mediaAssets")),
    about: v.optional(v.string()),

    whatsappNumber: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),

    specialties: v.optional(v.array(v.string())),

    referralCount: v.number(),
    partnerTier: v.optional(v.string()),
    loyaltyDiscountPercent: v.number(),
    commissionCutPercent: v.number(),

    isPublicProfileEnabled: v.boolean(),

    ...timestamps,
  })
    .index("by_userId", ["userId"])
    .index("by_partnerTier", ["partnerTier"])
    .index("by_isPublicProfileEnabled", ["isPublicProfileEnabled"]),

  agencies: defineTable({
    agencyLicense: v.string(),
    agencyName: v.string(),
    agencyLogoUrl: v.optional(v.string()),
    isActive: v.boolean(),
    ...timestamps,
  })
    .index("by_agencyLicense", ["agencyLicense"])
    .index("by_agencyName", ["agencyName"])
    .index("by_isActive", ["isActive"]),

  otpVerifications: defineTable({
    mobileNumber: v.string(),
    codeHash: v.string(),
    purpose: otpPurpose,

    expiresAt: v.number(),
    consumedAt: v.optional(v.number()),

    resendCount: v.number(),
    failedAttemptCount: v.number(),
    lockedUntil: v.optional(v.number()),

    ...timestamps,
  })
    .index("by_mobileNumber", ["mobileNumber"])
    .index("by_mobileNumber_purpose", ["mobileNumber", "purpose"])
    .index("by_expiresAt", ["expiresAt"]),

  ceaSalespersons: defineTable({
    registrationNo: v.string(),
    name: v.string(),
    estateAgentName: v.string(),
    estateAgentLicenceNo: v.string(),
    registrationStartDate: v.optional(v.string()),
    registrationEndDate: v.optional(v.string()),
    isActive: v.boolean(),
    lastSyncedAt: v.optional(v.number()),
    ...timestamps,
  })
    .index("by_registrationNo", ["registrationNo"])
    .index("by_name", ["name"])
    .index("by_estateAgentName", ["estateAgentName"])
    .index("by_isActive", ["isActive"]),

  districts: defineTable({
    code: v.string(),
    name: v.string(),
    sortOrder: v.optional(v.number()),
    isActive: v.boolean(),
    ...timestamps,
  })
    .index("by_code", ["code"])
    .index("by_name", ["name"])
    .index("by_isActive", ["isActive"]),

  estates: defineTable({
    name: v.string(),
    sortOrder: v.optional(v.number()),
    isActive: v.boolean(),
    ...timestamps,
  })
    .index("by_name", ["name"])
    .index("by_isActive", ["isActive"]),

  tenures: defineTable({
    tenureGroup: v.string(),
    tenureLabel: v.string(),
    sortOrder: v.optional(v.number()),
    isActive: v.boolean(),
    ...timestamps,
  })
    .index("by_tenureGroup", ["tenureGroup"])
    .index("by_tenureLabel", ["tenureLabel"])
    .index("by_isActive", ["isActive"]),

  propertyCategories: defineTable({
    code: v.string(),
    label: v.string(),
    sortOrder: v.number(),
    isActive: v.boolean(),
    ...timestamps,
  })
    .index("by_code", ["code"])
    .index("by_sortOrder", ["sortOrder"])
    .index("by_isActive", ["isActive"]),

  propertyTypes: defineTable({
    categoryCode: v.string(),
    code: v.string(),
    label: v.string(),
    ...timestamps,
  })
    .index("by_categoryCode", ["categoryCode"])
    .index("by_categoryCode_code", ["categoryCode", "code"]),

  propertySubTypes: defineTable({
    typeId: v.id("propertyTypes"),
    code: v.string(),
    label: v.string(),
    ...timestamps,
  })
    .index("by_typeId", ["typeId"])
    .index("by_typeId_code", ["typeId", "code"]),

  propertyModels: defineTable({
    subTypeId: v.id("propertySubTypes"),
    code: v.string(),
    label: v.string(),
    ...timestamps,
  })
    .index("by_subTypeId", ["subTypeId"])
    .index("by_subTypeId_code", ["subTypeId", "code"]),

  properties: defineTable({
    slug: v.string(),
    propertyName: v.string(),
    propertyCategory: propertyCategoryCode,

    districtId: v.optional(v.id("districts")),
    estateId: v.optional(v.id("estates")),
    address: v.optional(v.string()),
    streetName: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    tenureId: v.optional(v.id("tenures")),

    totalUnits: v.optional(v.number()),
    expectedTOP: v.optional(v.string()),
    developerName: v.optional(v.string()),
    launchDate: v.optional(v.string()),
    siteAreaSqft: v.optional(v.number()),

    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),

    description: v.optional(v.string()),
    coverImageId: v.optional(v.id("mediaAssets")),
    imageIds: v.optional(v.array(v.id("mediaAssets"))),

    isPublished: v.boolean(),

    ...timestamps,
  })
    .index("by_slug", ["slug"])
    .index("by_propertyName", ["propertyName"])
    .index("by_propertyCategory", ["propertyCategory"])
    .index("by_districtId", ["districtId"])
    .index("by_estateId", ["estateId"])
    .index("by_isPublished", ["isPublished"]),

  listings: defineTable({
    userId: v.id("users"),

    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),

    propertyId: v.optional(v.id("properties")),

    propertyCategory: propertyCategoryCode,
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

    askPrice: v.optional(v.number()), // cents
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

    publishedAt: v.optional(v.number()),
    billingId: v.optional(v.id("billings")),
    feeRuleId: v.optional(v.id("feeRules")),

    status: listingStatus,
    lastRefreshAt: v.optional(v.number()),
    nextRefreshAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),

    isSearchIndexed: v.boolean(),

    ...timestamps,
  })
    .index("by_userId", ["userId"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_propertyId", ["propertyId"])
    .index("by_propertyCategory", ["propertyCategory"])
    .index("by_districtId", ["districtId"])
    .index("by_estateId", ["estateId"])
    .index("by_publishedAt", ["publishedAt"])
    .index("by_nextRefreshAt", ["nextRefreshAt"])
    .index("by_expiresAt", ["expiresAt"])
    .index("by_billingId", ["billingId"]),

  listingNotes: defineTable({
    userId: v.id("users"),
    listingId: v.id("listings"),
    note: v.string(),
    ...timestamps,
  })
    .index("by_userId", ["userId"])
    .index("by_listingId", ["listingId"])
    .index("by_userId_listingId", ["userId", "listingId"]),

  brandingSpaces: defineTable({
    brandingSpaceType: brandingSpaceType,
    propertyCategory: v.optional(propertyCategoryCode),
    propertyId: v.optional(v.id("properties")),
    propertyName: v.optional(v.string()),
    districtId: v.optional(v.id("districts")),
    estateId: v.optional(v.id("estates")),
    label: v.string(),
    description: v.optional(v.string()),
    totalSlots: v.number(),
    feeRuleId: v.optional(v.id("feeRules")),
    sortOrder: v.number(),
    isActive: v.boolean(),
    ...timestamps,
  })
    .index("by_brandingSpaceType", ["brandingSpaceType"])
    .index("by_propertyCategory", ["propertyCategory"])
    .index("by_propertyId", ["propertyId"])
    .index("by_districtId", ["districtId"])
    .index("by_estateId", ["estateId"])
    .index("by_isActive", ["isActive"]),

  brandingBookings: defineTable({
    userId: v.id("users"),
    brandingSpaceId: v.id("brandingSpaces"),

    startsAt: v.number(),
    endsAt: v.number(),

    status: bookingStatus,
    billingId: v.optional(v.id("billings")),

    ...timestamps,
  })
    .index("by_userId", ["userId"])
    .index("by_brandingSpaceId", ["brandingSpaceId"])
    .index("by_status", ["status"])
    .index("by_startsAt", ["startsAt"])
    .index("by_endsAt", ["endsAt"])
    .index("by_billingId", ["billingId"]),

  billings: defineTable({
    userId: v.id("users"),

    amountCents: v.number(),
    gstCents: v.number(),
    totalCents: v.number(),

    paymentStatus: paymentStatus,
    paymentProvider: v.string(),
    paymentProviderTransactionId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),

    billingType: billingType,
    referenceId: v.string(), // listingId or brandingBookingId serialized
    description: v.string(),
    idempotencyKey: v.string(),

    invoiceNumber: v.optional(v.string()),
    invoiceUrl: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),

    paidAt: v.optional(v.number()),
    paymentErrorDetails: v.optional(v.string()),
    refundedAt: v.optional(v.number()),
    refundReason: v.optional(v.string()),

    ...timestamps,
  })
    .index("by_userId", ["userId"])
    .index("by_paymentStatus", ["paymentStatus"])
    .index("by_paymentProviderTransactionId", ["paymentProviderTransactionId"])
    .index("by_billingType", ["billingType"])
    .index("by_referenceId", ["referenceId"])
    .index("by_billingType_referenceId", ["billingType", "referenceId"])
    .index("by_idempotencyKey", ["idempotencyKey"])
    .index("by_paidAt", ["paidAt"]),

  feeRules: defineTable({
    feeCode: v.string(),
    feeType: feeType,

    location: v.optional(v.string()),
    project: v.optional(v.string()),
    feeCents: v.number(),
    gstPercent: v.number(),

    isActive: v.boolean(),
    effectiveFrom: v.optional(v.number()),
    effectiveTo: v.optional(v.number()),

    ...timestamps,
  })
    .index("by_feeCode", ["feeCode"])
    .index("by_feeType", ["feeType"])
    .index("by_feeType_isActive", ["feeType", "isActive"]),

  referrals: defineTable({
    referrerUserId: v.id("users"),
    referredUserId: v.id("users"),
    referralCode: v.string(),
    status: referralStatus,
    qualifiedAt: v.optional(v.number()),
    ...timestamps,
  })
    .index("by_referrerUserId", ["referrerUserId"])
    .index("by_referredUserId", ["referredUserId"])
    .index("by_referralCode", ["referralCode"])
    .index("by_status", ["status"])
    .index("by_referrerUserId_referredUserId", ["referrerUserId", "referredUserId"]),

  referralEarnings: defineTable({
    referralId: v.id("referrals"),
    billingId: v.id("billings"),
    earningType: earningType,
    amountCents: v.number(),
    status: earningStatus,
    paidAt: v.optional(v.number()),
    ...timestamps,
  })
    .index("by_referralId", ["referralId"])
    .index("by_billingId", ["billingId"])
    .index("by_status", ["status"]),

  partnerTierConfig: defineTable({
    tierName: v.string(),
    referralTarget: v.number(),
    loyaltyDiscountPercent: v.number(),
    commissionCutPercent: v.number(),
    isActive: v.boolean(),
    ...timestamps,
  })
    .index("by_tierName", ["tierName"])
    .index("by_referralTarget", ["referralTarget"])
    .index("by_isActive", ["isActive"]),

  contentPages: defineTable({
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    isPublished: v.boolean(),
    lastUpdatedByUserId: v.id("users"),
    ...timestamps,
  })
    .index("by_slug", ["slug"])
    .index("by_isPublished", ["isPublished"])
    .index("by_lastUpdatedByUserId", ["lastUpdatedByUserId"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    listingId: v.id("listings"),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_listingId", ["listingId"])
    .index("by_userId_listingId", ["userId", "listingId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    entityType: entityType,
    entityId: v.optional(v.string()),
    isRead: v.boolean(),
    ...timestamps,
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isRead", ["userId", "isRead"])
    .index("by_entityType_entityId", ["entityType", "entityId"]),

  mediaAssets: defineTable({
    storageId: v.string(),
    ownerUserId: v.id("users"),
    entityType: v.optional(entityType),
    entityId: v.optional(v.string()),
    fileType: v.string(),
    url: v.optional(v.string()),
    altText: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    ...timestamps,
  })
    .index("by_storageId", ["storageId"])
    .index("by_ownerUserId", ["ownerUserId"])
    .index("by_entityType_entityId", ["entityType", "entityId"]),

  auditLogs: defineTable({
    userId: v.optional(v.id("users")),
    action: v.string(),
    details: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"]),
});