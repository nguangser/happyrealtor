import type { Doc } from "@/convex/_generated/dataModel";
import { StatusBadge } from "./status-badge";

type Props = {
  listing: Doc<"listings">;
};

export function ListingSummary({ listing }: Props) {
  return (
    <div>
      <h3 className="font-medium text-gray-900">{listing.title}</h3>

      <div className="mt-1 flex items-center gap-2 text-sm">
        <span className="text-gray-500">Status:</span>
        <StatusBadge status={listing.status} />
      </div>

      <p className="mt-1 text-sm text-gray-500">Slug: {listing.slug}</p>

      {(listing.address || listing.streetName || listing.mrtStation) && (
        <p className="mt-2 text-sm text-gray-600">
          {listing.address ?? listing.streetName ?? listing.mrtStation}
        </p>
      )}
    </div>
  );
}