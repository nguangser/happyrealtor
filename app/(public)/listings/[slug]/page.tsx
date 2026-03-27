"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PublicListingGallery } from "./_components/public-listing-gallery";

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

export default function PublicListingDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const listing = useQuery(
    api.modules.listings.queries.getPublishedBySlug,
    slug ? { slug } : "skip",
  );

  if (listing === undefined) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="text-sm text-gray-500">Loading listing...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-2xl font-semibold">Listing not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          This listing may not exist or is not publicly available.
        </p>

        <Link
          href="/"
          className="mt-4 inline-block rounded-md border px-4 py-2 text-sm font-medium"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PublicListingGallery
            coverImageId={listing.coverImageId}
            imageIds={listing.imageIds}
          />

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h1 className="text-3xl font-semibold text-gray-900">
                {listing.title}
              </h1>

              <p className="mt-2 text-lg font-medium text-gray-800">
                {formatPrice(listing)}
              </p>

              {listing.address ? (
                <p className="mt-2 text-sm text-gray-600">{listing.address}</p>
              ) : null}
            </div>

            {listing.description ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                  {listing.description}
                </p>
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="text-xs text-gray-500">Bedrooms</div>
                <div className="mt-1 text-sm font-medium">
                  {listing.bedrooms ?? "-"}
                </div>
              </div>

              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="text-xs text-gray-500">Bathrooms</div>
                <div className="mt-1 text-sm font-medium">
                  {listing.bathrooms ?? "-"}
                </div>
              </div>

              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="text-xs text-gray-500">Floor Area</div>
                <div className="mt-1 text-sm font-medium">
                  {listing.floorArea
                    ? `${listing.floorArea}${listing.floorAreaUnit ? ` ${listing.floorAreaUnit}` : ""}`
                    : "-"}
                </div>
              </div>

              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="text-xs text-gray-500">Category</div>
                <div className="mt-1 text-sm font-medium capitalize">
                  {listing.propertyCategory}
                </div>
              </div>
            </div>

            {listing.featureTags && listing.featureTags.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">Features</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.featureTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border bg-gray-50 px-3 py-1 text-xs text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {listing.amenities && listing.amenities.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">Amenities</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.amenities.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border bg-gray-50 px-3 py-1 text-xs text-gray-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Contact Agent</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-gray-500">Name</div>
                <div className="font-medium text-gray-900">
                  {listing.contactName ?? "-"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Mobile</div>
                <div className="font-medium text-gray-900">
                  {listing.contactMobileNumber ?? "-"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">WhatsApp</div>
                <div className="font-medium text-gray-900">
                  {listing.contactWhatsappNumber ?? "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Listing Info</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-gray-500">Slug</div>
                <div className="font-medium text-gray-900">{listing.slug}</div>
              </div>

              <div>
                <div className="text-gray-500">New Project</div>
                <div className="font-medium text-gray-900">
                  {listing.isNewProject ? "Yes" : "No"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">MRT Station</div>
                <div className="font-medium text-gray-900">
                  {listing.mrtStation ?? "-"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Postal Code</div>
                <div className="font-medium text-gray-900">
                  {listing.postalCode ?? "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
