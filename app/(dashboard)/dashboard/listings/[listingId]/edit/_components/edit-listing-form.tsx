"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

type Props = {
  userId: Id<"users">;
  listing: Doc<"listings">;
};

export function EditListingForm({ userId, listing }: Props) {
  const updateDraft = useMutation(api.modules.listings.mutations.updateDraft);

  const [title, setTitle] = useState(listing.title ?? "");
  const [description, setDescription] = useState(listing.description ?? "");
  const [askPrice, setAskPrice] = useState(
    listing.askPrice ? String(listing.askPrice) : "",
  );
  const [contactName, setContactName] = useState(listing.contactName ?? "");
  const [contactMobileNumber, setContactMobileNumber] = useState(
    listing.contactMobileNumber ?? "",
  );
  const [contactWhatsappNumber, setContactWhatsappNumber] = useState(
    listing.contactWhatsappNumber ?? "",
  );
  const [amenitiesInput, setAmenitiesInput] = useState(
    listing.amenities?.join(", ") ?? "",
  );
  const [featureTagsInput, setFeatureTagsInput] = useState(
    listing.featureTags?.join(", ") ?? "",
  );
  const [isPriceOnAsk, setIsPriceOnAsk] = useState(listing.isPriceOnAsk);
  const [isNewProject, setIsNewProject] = useState(listing.isNewProject);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      const amenities = amenitiesInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const featureTags = featureTagsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await updateDraft({
        listingId: listing._id,
        userId,
        title: title || undefined,
        description: description || undefined,
        askPrice: askPrice ? Number(askPrice) : undefined,
        isPriceOnAsk,
        isNewProject,
        amenities: amenities.length > 0 ? amenities : undefined,
        featureTags: featureTags.length > 0 ? featureTags : undefined,
        contactName: contactName || undefined,
        contactMobileNumber: contactMobileNumber || undefined,
        contactWhatsappNumber: contactWhatsappNumber || undefined,
      });

      setInfo("Listing updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update listing");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border bg-white p-5 shadow-sm"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Listing Title
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter listing title"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          className="w-full rounded-md border px-3 py-2 text-sm"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter listing description"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Ask Price
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={askPrice}
            onChange={(e) => setAskPrice(e.target.value)}
            placeholder="e.g. 1800000"
            type="number"
          />
        </div>

        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isNewProject}
              onChange={(e) => setIsNewProject(e.target.checked)}
            />
            New Project
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPriceOnAsk}
              onChange={(e) => setIsPriceOnAsk(e.target.checked)}
            />
            Price on Ask
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Amenities
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={amenitiesInput}
          onChange={(e) => setAmenitiesInput(e.target.value)}
          placeholder="e.g. Pool, Gym, BBQ"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Feature Tags
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={featureTagsInput}
          onChange={(e) => setFeatureTagsInput(e.target.value)}
          placeholder="e.g. Corner Unit, City View"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Contact Name
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Contact person"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Contact Mobile
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={contactMobileNumber}
            onChange={(e) => setContactMobileNumber(e.target.value)}
            placeholder="e.g. 96338323"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            WhatsApp Number
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={contactWhatsappNumber}
            onChange={(e) => setContactWhatsappNumber(e.target.value)}
            placeholder="e.g. 96338323"
          />
        </div>
      </div>

      {info ? <p className="text-sm text-green-700">{info}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}