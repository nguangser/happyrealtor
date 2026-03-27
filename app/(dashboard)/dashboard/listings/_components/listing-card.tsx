import Link from "next/link";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { SubmitForPaymentButton } from "./submit-for-payment-button";
import { PublishAfterPaymentButton } from "./publish-after-payment-button";
import { ListingActions } from "./listing-actions";
import { ListingSummary } from "./listing-summary";

type Props = {
  listing: Doc<"listings">;
  userId: Id<"users">;
};

export function ListingCard({ listing, userId }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <ListingSummary listing={listing} />

        <div className="text-right text-sm text-gray-600">
          <div>
            {listing.askPrice ? `$${listing.askPrice}` : "Price on ask"}
          </div>

          {(listing.status === "draft" ||
            listing.status === "pending_payment") && (
            <Link
              href={`/dashboard/listings/${listing._id}/edit`}
              className="mt-2 inline-block rounded border px-3 py-1 text-xs font-medium text-gray-700"
            >
              Edit
            </Link>
          )}

          {listing.status === "published" && (
            <Link
              href={`/listings/${listing.slug}`}
              className="mt-2 ml-2 inline-block rounded border px-3 py-1 text-xs font-medium text-gray-700"
            >
              View Public Page
            </Link>
          )}

          <ListingActions
            listingId={listing._id}
            userId={userId}
            status={listing.status}
          />
        </div>
      </div>

      {listing.status === "draft" && (
        <div className="mt-4">
          <SubmitForPaymentButton listingId={listing._id} userId={userId} />
        </div>
      )}

      {listing.status === "pending_payment" && listing.feeRuleId && (
        <div className="mt-4">
          <PublishAfterPaymentButton
            listingId={listing._id}
            userId={userId}
            feeRuleId={listing.feeRuleId}
          />
        </div>
      )}
    </div>
  );
}