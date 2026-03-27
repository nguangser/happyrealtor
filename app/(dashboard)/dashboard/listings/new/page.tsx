"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";
import { ListingWizard } from "../_components/listing-wizard";
import {
  getInitialListingWizardValues,
  type ListingWizardSubmitPayload,
} from "../_components/listing-wizard-types";

export default function NewListingPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = useQuery(api.modules.users.queries.getCurrent, {});
  const createDraft = useMutation(api.modules.listings.mutations.createDraft);

  useEffect(() => {
    if (sessionPending) return;
    if (!session) {
      router.replace("/sign-in");
      return;
    }
    if (user === undefined) return;
    if (!user) return;
    if (user.onboardingStage !== "completed") {
      router.replace("/dashboard");
    }
  }, [sessionPending, session, user, router]);

  if (sessionPending || user === undefined) {
    return <div className="p-6">Loading...</div>;
  }

  if (!session || !user) {
    return <div className="p-6">Redirecting...</div>;
  }

  const currentUser = user;

  async function handleCreate(payload: ListingWizardSubmitPayload) {
    await createDraft({
      userId: currentUser._id,
      title: payload.title,
      description: payload.description,
      propertyId: undefined,
      propertyCategory: payload.propertyCategory,
      propertyTypeId: undefined,
      propertySubTypeId: undefined,
      propertyModelId: undefined,
      districtId: undefined,
      estateId: undefined,
      tenureId: undefined,
      block: undefined,
      streetName: payload.streetName,
      address: payload.address,
      postalCode: payload.postalCode,
      floorArea: payload.floorArea,
      floorAreaUnit: payload.floorAreaUnit,
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms,
      askPrice: payload.askPrice,
      isNewProject: payload.isNewProject,
      isPriceOnAsk: payload.isPriceOnAsk,
      amenities: payload.amenities,
      featureTags: payload.featureTags,
      coverImageId: payload.coverImageId,
      imageIds: payload.imageIds,
      videoLinks: undefined,
      contactName: payload.contactName,
      contactMobileNumber: payload.contactMobileNumber,
      contactWhatsappNumber: payload.contactWhatsappNumber,
      latitude: undefined,
      longitude: undefined,
      mrtStation: payload.mrtStation,
    });

    router.push("/dashboard/listings");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create Listing</h1>
        <p className="mt-1 text-sm text-gray-600">
          Complete the steps below to create a new draft listing.
        </p>
      </div>

      <ListingWizard
        userId={currentUser._id}
        initialValues={getInitialListingWizardValues({ user: currentUser })}
        submitLabel="Create Draft"
        onSubmit={handleCreate}
      />
    </div>
  );
}