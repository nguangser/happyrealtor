import {
    formatListingStatusLabel,
    getListingStatusBadgeClasses,
    type ListingStatus,
  } from "./listing-status";
  
  type Props = {
    status: ListingStatus;
  };
  
  export function StatusBadge({ status }: Props) {
    return (
      <span
        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getListingStatusBadgeClasses(
          status,
        )}`}
      >
        {formatListingStatusLabel(status)}
      </span>
    );
  }