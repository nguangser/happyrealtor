"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Id } from "@/convex/_generated/dataModel";
import { UploadedImagePreview } from "./uploaded-image-preview";
import type { UploadedImage } from "./listing-wizard-types";

type Props = {
  images: UploadedImage[];
  coverImageId?: Id<"mediaAssets">;
  onChange: (images: UploadedImage[]) => void;
  onChangeCover: (coverImageId?: Id<"mediaAssets">) => void;
  onDeleteImage?: (mediaAssetId: Id<"mediaAssets">) => Promise<void> | void;
};

export function ListingImagesManager({
  images,
  coverImageId,
  onChange,
  onChangeCover,
  onDeleteImage,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.mediaAssetId === active.id);
    const newIndex = images.findIndex((img) => img.mediaAssetId === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    onChange(arrayMove(images, oldIndex, newIndex));
  }

  async function handleDelete(mediaAssetId: Id<"mediaAssets">) {
    const nextImages = images.filter((img) => img.mediaAssetId !== mediaAssetId);
    onChange(nextImages);

    if (coverImageId === mediaAssetId) {
      onChangeCover(nextImages[0]?.mediaAssetId);
    }

    await onDeleteImage?.(mediaAssetId);
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((img) => img.mediaAssetId)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <SortableImageCard
                key={image.mediaAssetId}
                image={image}
                index={index}
                isCover={coverImageId === image.mediaAssetId}
                onSetCover={() => onChangeCover(image.mediaAssetId)}
                onDelete={() => {
                  void handleDelete(image.mediaAssetId);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-xs text-gray-500">
        Drag images to reorder. The first image can be used as the default cover.
      </p>
    </div>
  );
}

function SortableImageCard({
  image,
  index,
  isCover,
  onSetCover,
  onDelete,
}: {
  image: UploadedImage;
  index: number;
  isCover: boolean;
  onSetCover: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image.mediaAssetId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`space-y-2 rounded-lg border bg-white p-2 ${
        isDragging ? "opacity-60 shadow-lg" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab rounded-md border border-dashed px-2 py-1 text-xs text-gray-500 active:cursor-grabbing"
      >
        Drag to reorder • Position {index + 1}
      </div>

      <UploadedImagePreview
        storageId={image.storageId}
        fileName={image.fileName}
      />

      <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
        <span>{isCover ? "Cover image" : `Image ${index + 1}`}</span>

        <div className="flex items-center gap-2">
          {!isCover ? (
            <button
              type="button"
              onClick={onSetCover}
              className="rounded border px-2 py-1"
            >
              Set as cover
            </button>
          ) : null}

          <button
            type="button"
            onClick={onDelete}
            className="rounded border border-red-200 px-2 py-1 text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}