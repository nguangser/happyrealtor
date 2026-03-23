"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";
import { ProfileSetupForm } from "./_components/profile-setup-form";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = useQuery(api.modules.users.queries.getCurrent, {});
  const realtor = useQuery(
    api.modules.realtors.queries.getByUserId,
    user ? { userId: user._id } : "skip",
  );

  useEffect(() => {
    if (sessionPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    if (user === undefined) return;
    if (!user) return;

    if (user.onboardingStage === "pending_cea") {
      router.replace("/onboarding/cea");
      return;
    }

    if (user.onboardingStage === "pending_otp") {
      router.replace("/onboarding/otp");
      return;
    }

    if (user.onboardingStage === "completed") {
      router.replace("/dashboard");
    }
  }, [sessionPending, session, user, router]);

  if (sessionPending || user === undefined || realtor === undefined) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="text-sm text-gray-500">Loading your account...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="text-sm text-gray-500">Redirecting to sign in...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="text-sm text-gray-500">Loading your profile...</div>
      </div>
    );
  }

  if (user.onboardingStage !== "profile_setup") {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="text-sm text-gray-500">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Profile Setup</h1>
        <p className="mt-2 text-sm text-gray-600">
          Complete your realtor profile to activate your account.
        </p>
      </div>

      <div className="mb-6 rounded-xl border bg-gray-50 p-4">
        <div className="mb-3 text-sm font-medium text-gray-500">
          Account Information
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <div className="text-gray-500">Full Name</div>
            <div className="font-medium text-gray-900">{user.fullName}</div>
          </div>

          <div>
            <div className="text-gray-500">Mobile Number</div>
            <div className="font-medium text-gray-900">
              {user.mobileNumber ?? "-"}
            </div>
          </div>
        </div>
      </div>

      <ProfileSetupForm
        userId={user._id}
        initialAgencyName={realtor?.agencyName}
        initialAgencyLicenseNo={realtor?.agencyLicenseNo}
      />
    </div>
  );
}