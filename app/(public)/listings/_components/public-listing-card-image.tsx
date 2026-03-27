"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

export function PublicListingCardImage({
  mediaAssetId,
  fallbackText,
}: {
  mediaAssetId?: Id<"mediaAssets">;
  fallbackText: string;
}) {
  const mediaAsset = useQuery(
    api.modules.media.queries.getMediaAssetById,
    mediaAssetId ? { mediaAssetId } : "skip",
  );

  const imageUrl = useQuery(
    api.modules.media.queries.getImageUrl,
    mediaAsset?.storageId ? { storageId: mediaAsset.storageId } : "skip",
  );

  if (!mediaAssetId || mediaAsset === null || imageUrl === null) {
    return (
      <div className="flex h-48 items-center justify-center rounded-t-2xl bg-gray-100 text-sm text-gray-400">
        {fallbackText}
      </div>
    );
  }

  if (mediaAsset === undefined || imageUrl === undefined) {
    return (
      <div className="flex h-48 items-center justify-center rounded-t-2xl bg-gray-100 text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gray-100">
      <Image
        src={imageUrl}
        alt={mediaAsset.fileName}
        fill
        className="object-cover"
        unoptimized
      />
    </div>
  );
}