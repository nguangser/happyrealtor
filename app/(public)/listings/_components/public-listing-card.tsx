import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";
import { PublicListingCardImage } from "./public-listing-card-image";

type Props = {
  listing: Doc<"listings">;
};

function formatPrice(listing: {
  askPrice?: number;
  isPriceOnAsk?: boolean;
}) {
  if (listing.isPriceOnAsk) return "Price on ask";
  if (!listing.askPrice) return "Price unavailable";

  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(listing.askPrice);
}

export function PublicListingCard({ listing }: Props) {
  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
    >
      <PublicListingCardImage
        mediaAssetId={listing.coverImageId}
        fallbackText="No image"
      />

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 text-lg font-semibold text-gray-900">
            {listing.title}
          </h2>
        </div>

        <p className="text-base font-medium text-gray-800">
          {formatPrice(listing)}
        </p>

        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {listing.address ?? listing.streetName ?? "Address unavailable"}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-gray-600">
          <div>
            <div className="text-xs text-gray-400">Beds</div>
            <div>{listing.bedrooms ?? "-"}</div>
          </div>

          <div>
            <div className="text-xs text-gray-400">Baths</div>
            <div>{listing.bathrooms ?? "-"}</div>
          </div>

          <div>
            <div className="text-xs text-gray-400">Category</div>
            <div className="capitalize">{listing.propertyCategory}</div>
          </div>
        </div>

        {listing.featureTags && listing.featureTags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {listing.featureTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border bg-gray-50 px-2.5 py-1 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}