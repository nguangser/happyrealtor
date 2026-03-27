"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";
import { ListingWizard } from "../../_components/listing-wizard";
import {
  getInitialListingWizardValues,
  type ListingWizardSubmitPayload,
  type UploadedImage,
} from "../../_components/listing-wizard-types";
import { PublishAfterPaymentButton } from "../../_components/publish-after-payment-button";
import { SubmitForPaymentButton } from "../../_components/submit-for-payment-button";
import { ListingActions } from "../../_components/listing-actions";

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.listingId as string;

  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = useQuery(api.modules.users.queries.getCurrent, {});
  const listing = useQuery(
    api.modules.listings.queries.getById,
    listingId ? { listingId: listingId as never } : "skip",
  );

  const mediaAssets = useQuery(
    api.modules.media.queries.getMediaAssetsByIds,
    listing?.imageIds && listing.imageIds.length > 0
      ? { mediaAssetIds: listing.imageIds }
      : "skip",
  );

  const updateDraft = useMutation(api.modules.listings.mutations.updateDraft);
  const deleteMediaAssetIfUnreferenced = useMutation(
    api.modules.media.mutations.deleteMediaAssetIfUnreferenced,
  );

  useEffect(() => {
    if (sessionPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    if (user === undefined || listing === undefined) return;
    if (!user || !listing) return;

    if (String(listing.userId) !== String(user._id)) {
      router.replace("/dashboard/listings");
    }
  }, [sessionPending, session, user, listing, router]);

  const uploadedImages: UploadedImage[] = useMemo(() => {
    if (!listing?.imageIds || !mediaAssets) return [];

    const mediaById = new Map(
      mediaAssets.map((asset) => [String(asset._id), asset]),
    );

    return listing.imageIds
      .map((imageId) => {
        const asset = mediaById.get(String(imageId));
        if (!asset) return null;

        return {
          mediaAssetId: asset._id,
          storageId: asset.storageId,
          fileName: asset.fileName,
        };
      })
      .filter((item): item is UploadedImage => item !== null);
  }, [listing?.imageIds, mediaAssets]);

  if (
    sessionPending ||
    user === undefined ||
    listing === undefined ||
    (listing?.imageIds?.length ? mediaAssets === undefined : false)
  ) {
    return <div className="p-6">Loading listing...</div>;
  }

  if (!session || !user || !listing) {
    return <div className="p-6">Redirecting...</div>;
  }

  const currentUser = user;
  const currentListing = listing;
  const originalImageIds = currentListing.imageIds ?? [];

  async function handleUpdate(payload: ListingWizardSubmitPayload) {
    const nextImageIds = payload.imageIds ?? [];
    const removedImageIds = originalImageIds.filter(
      (oldId) => !nextImageIds.some((newId) => String(newId) === String(oldId)),
    );

    await updateDraft({
      listingId: currentListing._id,
      userId: currentUser._id,
      title: payload.title,
      description: payload.description,
      propertyCategory: payload.propertyCategory,
      streetName: payload.streetName,
      address: payload.address,
      postalCode: payload.postalCode,
      floorArea: payload.floorArea,
      floorAreaUnit: payload.floorAreaUnit,
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms,
      askPrice: payload.askPrice,
      isPriceOnAsk: payload.isPriceOnAsk,
      isNewProject: payload.isNewProject,
      amenities: payload.amenities,
      featureTags: payload.featureTags,
      coverImageId: payload.coverImageId,
      imageIds: payload.imageIds,
      contactName: payload.contactName,
      contactMobileNumber: payload.contactMobileNumber,
      contactWhatsappNumber: payload.contactWhatsappNumber,
      mrtStation: payload.mrtStation,
    });

    await Promise.all(
      removedImageIds.map((mediaAssetId) =>
        deleteMediaAssetIfUnreferenced({ mediaAssetId }),
      ),
    );

    router.push("/dashboard/listings");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit Listing</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your listing details.
        </p>
      </div>

      <ListingWizard
        userId={currentUser._id}
        initialValues={getInitialListingWizardValues({
          user: currentUser,
          listing: currentListing,
          uploadedImages,
        })}
        submitLabel="Save Changes"
        onSubmit={handleUpdate}
      />

      <div className="mt-6">
        <ListingActions
          listingId={currentListing._id}
          userId={currentUser._id}
          status={currentListing.status}
        />
      </div>

      {currentListing.status === "draft" && (
        <div className="mt-6">
          <SubmitForPaymentButton
            listingId={currentListing._id}
            userId={currentUser._id}
          />
        </div>
      )}

      {currentListing.status === "pending_payment" &&
      currentListing.feeRuleId ? (
        <div className="mt-6">
          <PublishAfterPaymentButton
            listingId={currentListing._id}
            userId={currentUser._id}
            feeRuleId={currentListing.feeRuleId}
          />
        </div>
      ) : null}
    </div>
  );
}