import type { Doc, Id } from "@/convex/_generated/dataModel";

export type UploadedImage = {
  mediaAssetId: Id<"mediaAssets">;
  storageId: Id<"_storage">;
  fileName: string;
};

export type PropertyCategory =
  | "residential"
  | "commercial"
  | "industrial"
  | "land";

export type ListingWizardValues = {
  title: string;
  description: string;
  propertyCategory: PropertyCategory;
  address: string;
  postalCode: string;
  streetName: string;
  mrtStation: string;
  bedrooms: string;
  bathrooms: string;
  floorArea: string;
  floorAreaUnit: string;
  askPrice: string;
  isNewProject: boolean;
  isPriceOnAsk: boolean;
  featureTagsInput: string;
  amenitiesInput: string;
  contactName: string;
  contactMobileNumber: string;
  contactWhatsappNumber: string;
  coverImageId?: Id<"mediaAssets">;
  uploadedImages: UploadedImage[];
};

export type ListingWizardSubmitPayload = {
  title: string;
  description?: string;
  propertyCategory: PropertyCategory;
  streetName?: string;
  address?: string;
  postalCode?: string;
  floorArea?: number;
  floorAreaUnit?: string;
  bedrooms?: number;
  bathrooms?: number;
  askPrice?: number;
  isNewProject: boolean;
  isPriceOnAsk: boolean;
  amenities?: string[];
  featureTags?: string[];
  coverImageId?: Id<"mediaAssets">;
  imageIds?: Id<"mediaAssets">[];
  contactName?: string;
  contactMobileNumber?: string;
  contactWhatsappNumber?: string;
  mrtStation?: string;
};

export function getInitialListingWizardValues(args: {
  user: Doc<"users">;
  listing?: Doc<"listings"> | null;
  uploadedImages?: UploadedImage[];
}): ListingWizardValues {
  const { user, listing, uploadedImages = [] } = args;

  return {
    title: listing?.title ?? "",
    description: listing?.description ?? "",
    propertyCategory: listing?.propertyCategory ?? "residential",
    address: listing?.address ?? "",
    postalCode: listing?.postalCode ?? "",
    streetName: listing?.streetName ?? "",
    mrtStation: listing?.mrtStation ?? "",
    bedrooms: listing?.bedrooms ? String(listing.bedrooms) : "",
    bathrooms: listing?.bathrooms ? String(listing.bathrooms) : "",
    floorArea: listing?.floorArea ? String(listing.floorArea) : "",
    floorAreaUnit: listing?.floorAreaUnit ?? "sqft",
    askPrice: listing?.askPrice ? String(listing.askPrice) : "",
    isNewProject: listing?.isNewProject ?? false,
    isPriceOnAsk: listing?.isPriceOnAsk ?? false,
    featureTagsInput: listing?.featureTags?.join(", ") ?? "",
    amenitiesInput: listing?.amenities?.join(", ") ?? "",
    contactName: listing?.contactName ?? user.fullName ?? "",
    contactMobileNumber: listing?.contactMobileNumber ?? user.mobileNumber ?? "",
    contactWhatsappNumber:
      listing?.contactWhatsappNumber ?? user.mobileNumber ?? "",
    coverImageId: listing?.coverImageId,
    uploadedImages,
  };
}

export function buildListingWizardSubmitPayload(
  values: ListingWizardValues,
): ListingWizardSubmitPayload {
  const featureTags = values.featureTagsInput
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const amenities = values.amenitiesInput
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    propertyCategory: values.propertyCategory,
    streetName: values.streetName || undefined,
    address: values.address || undefined,
    postalCode: values.postalCode || undefined,
    floorArea: values.floorArea ? Number(values.floorArea) : undefined,
    floorAreaUnit: values.floorAreaUnit || undefined,
    bedrooms: values.bedrooms ? Number(values.bedrooms) : undefined,
    bathrooms: values.bathrooms ? Number(values.bathrooms) : undefined,
    askPrice: values.isPriceOnAsk ? undefined : Number(values.askPrice),
    isNewProject: values.isNewProject,
    isPriceOnAsk: values.isPriceOnAsk,
    amenities: amenities.length > 0 ? amenities : undefined,
    featureTags: featureTags.length > 0 ? featureTags : undefined,
    coverImageId: values.coverImageId,
    imageIds:
      values.uploadedImages.length > 0
        ? values.uploadedImages.map((img) => img.mediaAssetId)
        : undefined,
    contactName: values.contactName || undefined,
    contactMobileNumber: values.contactMobileNumber || undefined,
    contactWhatsappNumber: values.contactWhatsappNumber || undefined,
    mrtStation: values.mrtStation || undefined,
  };
}