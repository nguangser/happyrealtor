export function assertBillingPaid(billing: { paymentStatus: string }) {
    if (billing.paymentStatus !== "paid") {
      throw new Error("Billing is not paid");
    }
  }
  
  export function calculateListingExpiry(from: number): number {
    return from + 30 * 24 * 60 * 60 * 1000;
  }
  
  export function calculateNextListingRefresh(from: number): number {
    return from + 6 * 60 * 60 * 1000;
  }