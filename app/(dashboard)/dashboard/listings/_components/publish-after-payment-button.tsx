"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

type Props = {
  listingId: Id<"listings">;
  userId: Id<"users">;
  feeRuleId: Id<"feeRules">;
};

export function PublishAfterPaymentButton({
  listingId,
  userId,
  feeRuleId,
}: Props) {
  const createMockPaidBilling = useMutation(
    api.modules.billing.mutations.createMockPaidBilling,
  );
  const publishAfterPayment = useMutation(
    api.modules.listings.mutations.publishAfterPayment,
  );

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePublish() {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      const billingId = await createMockPaidBilling({
        userId,
        listingId,
        feeRuleId,
      });

      const result = await publishAfterPayment({
        listingId,
        billingId,
      });

      if (result.ok) {
        setInfo("Payment confirmed and listing published.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to publish after payment",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border bg-green-50 p-4">
      {info ? <p className="text-sm text-green-700">{info}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        onClick={handlePublish}
        disabled={isSubmitting}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? "Publishing..." : "Mock Pay & Publish"}
      </button>
    </div>
  );
}