"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

export function UploadedImagePreview({
  storageId,
  fileName,
}: {
  storageId: Id<"_storage">;
  fileName: string;
}) {
  const imageUrl = useQuery(api.modules.media.queries.getImageUrl, {
    storageId,
  });

  if (imageUrl === undefined) {
    return <div className="text-sm text-gray-500">Loading preview...</div>;
  }

  if (!imageUrl) {
    return <div className="text-sm text-gray-500">Preview unavailable.</div>;
  }

  return (
    <div className="rounded-lg border p-3">
      <Image
        src={imageUrl}
        alt={fileName}
        width={400}
        height={200}
        className="h-40 w-full rounded-md object-cover"
        unoptimized
      />
      <p className="mt-2 text-xs text-gray-500">{fileName}</p>
    </div>
  );
}