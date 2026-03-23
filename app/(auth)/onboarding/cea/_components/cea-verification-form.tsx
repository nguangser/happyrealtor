"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

export function CeaVerificationForm({
  userId,
}: {
  userId: Id<"users">;
}) {
  const router = useRouter();
  const submitCeaVerification = useMutation(
    api.modules.onboarding.mutations.submitCeaVerification,
  );

  const [ceaRegNo, setCeaRegNo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await submitCeaVerification({
        userId,
        ceaRegNo,
      });

      if (result.ok) {
        router.push("/onboarding/otp");
        router.refresh();
        return;
      }

      setError("Unable to verify CEA registration");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "CEA verification failed";

      if (message.includes("Invalid or inactive CEA registration")) {
        setError(
          "CEA registration number not found or inactive. Please check and try again.",
        );
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border bg-white p-5 shadow-sm"
    >
      <div>
        <label
          htmlFor="ceaRegNo"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          CEA Registration Number
        </label>
        <input
          id="ceaRegNo"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          placeholder="e.g. R012345A"
          value={ceaRegNo}
          onChange={(e) => setCeaRegNo(e.target.value.toUpperCase())}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? "Verifying..." : "Verify CEA"}
      </button>
    </form>
  );
}