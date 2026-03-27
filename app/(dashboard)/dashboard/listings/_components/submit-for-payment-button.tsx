"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

type Props = {
  listingId: Id<"listings">;
  userId: Id<"users">;
};

export function SubmitForPaymentButton({ listingId, userId }: Props) {
  const feeRules = useQuery(api.modules.billing.queries.listActiveFeeRules, {});
  const submitForPayment = useMutation(
    api.modules.listings.mutations.submitForPayment,
  );

  const [selectedFeeRuleId, setSelectedFeeRuleId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setInfo(null);

    if (!selectedFeeRuleId) {
      setError("Please select a fee rule.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitForPayment({
        listingId,
        userId,
        feeRuleId: selectedFeeRuleId as Id<"feeRules">,
      });

      if (result.ok) {
        setInfo("Listing submitted for payment.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit for payment",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (feeRules === undefined) {
    return <div className="text-sm text-gray-500">Loading fee rules...</div>;
  }

  return (
    <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Select Fee Rule
        </label>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={selectedFeeRuleId}
          onChange={(e) => setSelectedFeeRuleId(e.target.value)}
        >
          <option value="">Choose a fee rule</option>
          {feeRules.map((rule) => (
            <option key={rule._id} value={rule._id}>
              {rule.feeCode} - ${(rule.feeCents / 100).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {info ? <p className="text-sm text-green-700">{info}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit for Payment"}
      </button>
    </div>
  );
}