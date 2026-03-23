"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Props = {
  userId: Id<"users">;
  initialAgencyName?: string;
  initialAgencyLicenseNo?: string;
};

export function ProfileSetupForm({
  userId,
  initialAgencyName,
  initialAgencyLicenseNo,
}: Props) {
  const completeProfileSetup = useMutation(
    api.modules.onboarding.mutations.completeProfileSetup,
  );

  const [agencyName, setAgencyName] = useState(initialAgencyName ?? "");
  const [agencyLicenseNo, setAgencyLicenseNo] = useState(
    initialAgencyLicenseNo ?? "",
  );
  const [about, setAbout] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [specialtiesInput, setSpecialtiesInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialAgencyName !== undefined) {
      setAgencyName(initialAgencyName);
    }
  }, [initialAgencyName]);

  useEffect(() => {
    if (initialAgencyLicenseNo !== undefined) {
      setAgencyLicenseNo(initialAgencyLicenseNo);
    }
  }, [initialAgencyLicenseNo]);

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const specialties = specialtiesInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const result = await completeProfileSetup({
        userId,
        agencyName: agencyName || undefined,
        agencyLicenseNo: agencyLicenseNo || undefined,
        about: about || undefined,
        whatsappNumber: whatsappNumber || undefined,
        facebookUrl: facebookUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        websiteUrl: websiteUrl || undefined,
        specialties: specialties.length > 0 ? specialties : undefined,
      });

      if (result.ok) {
        window.location.assign("/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete profile",
      );
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
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Agency Name
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
          placeholder="Enter agency name"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Agency License No
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={agencyLicenseNo}
          onChange={(e) => setAgencyLicenseNo(e.target.value)}
          placeholder="Enter agency license number"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          About
        </label>
        <textarea
          className="w-full rounded-md border px-3 py-2 text-sm"
          rows={4}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Tell clients about yourself"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          WhatsApp Number
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="e.g. 96338323"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Facebook URL
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={facebookUrl}
          onChange={(e) => setFacebookUrl(e.target.value)}
          placeholder="https://facebook.com/..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Instagram URL
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://instagram.com/..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          LinkedIn URL
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://linkedin.com/in/..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Website URL
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Specialties
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={specialtiesInput}
          onChange={(e) => setSpecialtiesInput(e.target.value)}
          placeholder="e.g. New Launches, HDB, Condos"
        />
        <p className="mt-1 text-xs text-gray-500">
          Separate multiple specialties with commas.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Complete Profile"}
      </button>
    </form>
  );
}