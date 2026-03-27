"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import type { ListingStatus } from "./listing-status";

type Props = {
  listingId: Id<"listings">;
  userId: Id<"users">;
  status: ListingStatus;
};

export function ListingActions({ listingId, userId, status }: Props) {
  const router = useRouter();

  const deleteDraft = useMutation(api.modules.listings.mutations.deleteDraft);
  const deactivateListing = useMutation(
    api.modules.listings.mutations.deactivateListing,
  );
  const deleteMediaAssetIfUnreferenced = useMutation(
    api.modules.media.mutations.deleteMediaAssetIfUnreferenced,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeleteDraft() {
    const confirmed = window.confirm(
      "Delete this draft listing? This cannot be undone.",
    );
    if (!confirmed) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await deleteDraft({
        listingId,
        userId,
      });

      const idsToCleanup = new Set<string>();

      for (const imageId of result.deletedImageIds ?? []) {
        idsToCleanup.add(String(imageId));
      }

      if (result.deletedCoverImageId) {
        idsToCleanup.add(String(result.deletedCoverImageId));
      }

      await Promise.all(
        Array.from(idsToCleanup).map((id) =>
          deleteMediaAssetIfUnreferenced({
            mediaAssetId: id as Id<"mediaAssets">,
          }),
        ),
      );

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete draft");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate() {
    const confirmed = window.confirm(
      "Deactivate this listing? You can reactivate later with a future flow.",
    );
    if (!confirmed) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await deactivateListing({
        listingId,
        userId,
      });

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to deactivate listing",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const canDeleteDraft = status === "draft";
  const canDeactivate =
    status === "pending_payment" ||
    status === "published" ||
    status === "expired";

  return (
    <div className="mt-3 space-y-2">
      {canDeleteDraft ? (
        <button
          type="button"
          onClick={handleDeleteDraft}
          disabled={isSubmitting}
          className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 disabled:opacity-60"
        >
          {isSubmitting ? "Deleting..." : "Delete Draft"}
        </button>
      ) : null}

      {canDeactivate ? (
        <button
          type="button"
          onClick={handleDeactivate}
          disabled={isSubmitting}
          className="rounded border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Deactivate"}
        </button>
      ) : null}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}