"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

type UploadedImage = {
  mediaAssetId: Id<"mediaAssets">;
  storageId: Id<"_storage">;
  fileName: string;
};

type Props = {
  userId: Id<"users">;
  onUploaded: (image: UploadedImage) => void;
};

export function ImageUpload({ userId, onUploaded }: Props) {
  const generateUploadUrl = useMutation(
    api.modules.media.mutations.generateUploadUrl,
  );
  const createMediaAsset = useMutation(
    api.modules.media.mutations.createMediaAsset,
  );

  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file.");
      }

      const uploadUrl = await generateUploadUrl({});

      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResult.ok) {
        throw new Error("Upload failed.");
      }

      const { storageId } = (await uploadResult.json()) as {
        storageId: Id<"_storage">;
      };

      const mediaAssetId = await createMediaAsset({
        userId,
        storageId,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });

      onUploaded({
        mediaAssetId,
        storageId,
        fileName: file.name,
      });

      e.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Upload Image
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="block w-full rounded-md border px-3 py-2 text-sm"
      />

      {isUploading ? (
        <p className="text-sm text-gray-500">Uploading...</p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}