"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";
import { CeaVerificationForm } from "./_components/cea-verification-form";

export default function CeaPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = useQuery(api.modules.users.queries.getCurrent, {});

  useEffect(() => {
    if (sessionPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    if (user === undefined) return;
    if (!user) return;

    if (user.onboardingStage === "pending_otp") {
      router.replace("/onboarding/otp");
      return;
    }

    if (user.onboardingStage === "profile_setup") {
      router.replace("/onboarding/profile");
      return;
    }

    if (user.onboardingStage === "completed") {
      router.replace("/dashboard");
    }
  }, [sessionPending, session, user, router]);

  if (sessionPending || user === undefined) {
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

  if (user.onboardingStage !== "pending_cea") {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="text-sm text-gray-500">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">CEA Verification</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your CEA registration number to continue onboarding.
        </p>
      </div>

      <CeaVerificationForm userId={user._id} />
    </div>
  );
}