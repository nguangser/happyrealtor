"use client";

import { useMemo, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ImageUpload } from "./image-upload";
import { ListingImagesManager } from "./listing-images-manager";
import type { ListingWizardValues } from "./listing-wizard-types";
import { buildListingWizardSubmitPayload } from "./listing-wizard-types";

const steps = [
  "Basic Info",
  "Property Details",
  "Media",
  "Contact",
  "Review",
] as const;

type Props = {
  userId: Id<"users">;
  initialValues: ListingWizardValues;
  submitLabel: string;
  onSubmit: (
    payload: ReturnType<typeof buildListingWizardSubmitPayload>,
  ) => Promise<void>;
};

export function ListingWizard({
  userId,
  initialValues,
  submitLabel,
  onSubmit,
}: Props) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<ListingWizardValues>(initialValues);

  const featureTags = useMemo(
    () =>
      values.featureTagsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [values.featureTagsInput],
  );

  const amenities = useMemo(
    () =>
      values.amenitiesInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [values.amenitiesInput],
  );

  function update<K extends keyof ListingWizardValues>(
    key: K,
    value: ListingWizardValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validateCurrentStep() {
    if (step === 0) {
      if (!values.title.trim()) {
        setError("Listing title is required.");
        return false;
      }
      if (!values.description.trim()) {
        setError("Description is required.");
        return false;
      }
    }

    if (step === 1) {
      if (!values.isPriceOnAsk && !values.askPrice.trim()) {
        setError("Ask price is required unless price on ask is enabled.");
        return false;
      }
    }

    if (step === 3) {
      if (!values.contactName.trim()) {
        setError("Contact name is required.");
        return false;
      }
      if (!values.contactMobileNumber.trim()) {
        setError("Contact mobile number is required.");
        return false;
      }
    }

    setError(null);
    return true;
  }

  async function handleNext() {
    if (!validateCurrentStep()) return;
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  }

  async function handleSubmit() {
    if (!values.title.trim()) {
      setError("Listing title is required.");
      return;
    }

    if (!values.isPriceOnAsk && !values.askPrice.trim()) {
      setError("Ask price is required unless price on ask is enabled.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(buildListingWizardSubmitPayload(values));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`rounded-lg border px-3 py-2 text-sm ${
                index === step
                  ? "border-black bg-black text-white"
                  : index < step
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-500"
              }`}
            >
              <div className="font-medium">Step {index + 1}</div>
              <div>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Basic Info</h2>

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Listing title"
            />

            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={6}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Description"
            />

            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={values.propertyCategory}
              onChange={(e) =>
                update(
                  "propertyCategory",
                  e.target.value as ListingWizardValues["propertyCategory"],
                )
              }
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="land">Land</option>
            </select>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Property Details</h2>

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={values.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Address"
            />

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={values.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
              placeholder="Postal code"
            />

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={values.streetName}
              onChange={(e) => update("streetName", e.target.value)}
              placeholder="Street name"
            />

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={values.mrtStation}
              onChange={(e) => update("mrtStation", e.target.value)}
              placeholder="MRT station"
            />

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              type="number"
              value={values.bedrooms}
              onChange={(e) => update("bedrooms", e.target.value)}
              placeholder="Bedrooms"
            />

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              type="number"
              value={values.bathrooms}
              onChange={(e) => update("bathrooms", e.target.value)}
              placeholder="Bathrooms"
            />

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              type="number"
              value={values.floorArea}
              onChange={(e) => update("floorArea", e.target.value)}
              placeholder="Floor area"
            />

            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={values.floorAreaUnit}
              onChange={(e) => update("floorAreaUnit", e.target.value)}
            >
              <option value="sqft">sqft</option>
              <option value="sqm">sqm</option>
            </select>

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              type="number"
              value={values.askPrice}
              onChange={(e) => update("askPrice", e.target.value)}
              disabled={values.isPriceOnAsk}
              placeholder="Ask price"
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.isNewProject}
                onChange={(e) => update("isNewProject", e.target.checked)}
              />
              New Project
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.isPriceOnAsk}
                onChange={(e) => update("isPriceOnAsk", e.target.checked)}
              />
              Price on Ask
            </label>

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={values.featureTagsInput}
              onChange={(e) => update("featureTagsInput", e.target.value)}
              placeholder="Feature tags, comma separated"
            />

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={values.amenitiesInput}
              onChange={(e) => update("amenitiesInput", e.target.value)}
              placeholder="Amenities, comma separated"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Media</h2>

            <ImageUpload
              userId={userId}
              onUploaded={(image) => {
                setValues((prev) => ({
                  ...prev,
                  uploadedImages: [...prev.uploadedImages, image],
                  coverImageId: prev.coverImageId ?? image.mediaAssetId,
                }));
              }}
            />

            {values.uploadedImages.length > 0 ? (
              <ListingImagesManager
                images={values.uploadedImages}
                coverImageId={values.coverImageId}
                onChange={(images) => update("uploadedImages", images)}
                onChangeCover={(nextCover) =>
                  update("coverImageId", nextCover)
                }
                onDeleteImage={async () => {
                  // UI-only removal here.
                  // Persisted cleanup is handled after save in edit page.
                }}
              />
            ) : (
              <p className="text-sm text-gray-500">No images uploaded yet.</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Contact</h2>

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={values.contactName}
              onChange={(e) => update("contactName", e.target.value)}
              placeholder="Contact name"
            />

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={values.contactMobileNumber}
              onChange={(e) => update("contactMobileNumber", e.target.value)}
              placeholder="Contact mobile"
            />

            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={values.contactWhatsappNumber}
              onChange={(e) => update("contactWhatsappNumber", e.target.value)}
              placeholder="WhatsApp number"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review</h2>

            <ReviewItem label="Title" value={values.title} />
            <ReviewItem label="Category" value={values.propertyCategory} />
            <ReviewItem
              label="Ask Price"
              value={values.isPriceOnAsk ? "Price on ask" : values.askPrice || "-"}
            />
            <ReviewItem label="Address" value={values.address || "-"} />
            <ReviewItem label="MRT Station" value={values.mrtStation || "-"} />
            <ReviewItem label="Contact Name" value={values.contactName || "-"} />
            <ReviewItem
              label="Feature Tags"
              value={featureTags.length ? featureTags.join(", ") : "-"}
            />
            <ReviewItem
              label="Amenities"
              value={amenities.length ? amenities.join(", ") : "-"}
            />
            <ReviewItem
              label="Images Uploaded"
              value={String(values.uploadedImages.length)}
            />
          </div>
        )}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Back
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-gray-50 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}