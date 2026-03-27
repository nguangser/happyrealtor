export type ListingStatus =
  | "draft"
  | "pending_payment"
  | "published"
  | "deactivated"
  | "expired";

export function formatListingStatusLabel(status: ListingStatus): string {
  switch (status) {
    case "pending_payment":
      return "Pending Payment";
    case "draft":
      return "Draft";
    case "published":
      return "Published";
    case "deactivated":
      return "Deactivated";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}

export function getListingStatusBadgeClasses(status: ListingStatus): string {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "pending_payment":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "published":
      return "bg-green-100 text-green-700 border-green-200";
    case "deactivated":
      return "bg-red-100 text-red-700 border-red-200";
    case "expired":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}