"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

type Props = {
  coverImageId?: Id<"mediaAssets">;
  imageIds?: Id<"mediaAssets">[];
};

export function PublicListingGallery({ coverImageId, imageIds }: Props) {
  const orderedIds = useMemo(() => {
    const ids: Id<"mediaAssets">[] = [];

    if (coverImageId) {
      ids.push(coverImageId);
    }

    for (const id of imageIds ?? []) {
      if (!ids.includes(id)) {
        ids.push(id);
      }
    }

    return ids;
  }, [coverImageId, imageIds]);

  const mediaAssets = useQuery(
    api.modules.media.queries.getMediaAssetsByIds,
    orderedIds.length > 0 ? { mediaAssetIds: orderedIds } : "skip",
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!orderedIds.length) {
    return (
      <div className="rounded-2xl border bg-gray-100 p-10 text-center text-sm text-gray-500">
        No images available.
      </div>
    );
  }

  if (mediaAssets === undefined) {
    return (
      <div className="rounded-2xl border bg-gray-100 p-10 text-center text-sm text-gray-500">
        Loading images...
      </div>
    );
  }

  if (mediaAssets.length === 0) {
    return (
      <div className="rounded-2xl border bg-gray-100 p-10 text-center text-sm text-gray-500">
        No images available.
      </div>
    );
  }

  const safeIndex =
    selectedIndex >= 0 && selectedIndex < mediaAssets.length ? selectedIndex : 0;
  const selected = mediaAssets[safeIndex];

  return (
    <div className="space-y-4">
      <GalleryMainImage mediaAsset={selected} />

      {mediaAssets.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
          {mediaAssets.map((asset, index) => (
            <button
              key={asset._id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`overflow-hidden rounded-xl border ${
                index === safeIndex ? "ring-2 ring-black" : ""
              }`}
            >
              <GalleryThumb mediaAsset={asset} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function GalleryMainImage({ mediaAsset }: { mediaAsset: Doc<"mediaAssets"> }) {
  const imageUrl = useQuery(api.modules.media.queries.getImageUrl, {
    storageId: mediaAsset.storageId,
  });

  if (!imageUrl) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border bg-gray-100 text-sm text-gray-500">
        Image unavailable.
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full  overflow-hidden rounded-2xl border bg-gray-100">
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

function GalleryThumb({ mediaAsset }: { mediaAsset: Doc<"mediaAssets"> }) {
  const imageUrl = useQuery(api.modules.media.queries.getImageUrl, {
    storageId: mediaAsset.storageId,
  });

  if (!imageUrl) {
    return (
      <div className="flex h-20 items-center justify-center bg-gray-100 text-[10px] text-gray-400">
        N/A
      </div>
    );
  }

  return (
    <div className="relative h-20 w-full bg-gray-100">
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