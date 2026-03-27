"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = useQuery(api.modules.users.queries.getCurrent, {});
  const stats = useQuery(
    api.modules.dashboard.queries.getDashboardStats,
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

    if (user.onboardingStage === "profile_setup") {
      router.replace("/onboarding/profile");
    }
  }, [sessionPending, session, user, router]);

  if (sessionPending || user === undefined || stats === undefined) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (!session || !user) {
    return <div className="p-6">Redirecting...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {user.fullName}
          </p>
        </div>

        <Link
          href="/listings"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Manage Listings
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Published</div>
          <div className="mt-2 text-2xl font-semibold">
            {stats?.publishedCount ?? 0}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Drafts</div>
          <div className="mt-2 text-2xl font-semibold">
            {stats?.draftCount ?? 0}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Pending Payment</div>
          <div className="mt-2 text-2xl font-semibold">
            {stats?.pendingPaymentCount ?? 0}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Deactivated</div>
          <div className="mt-2 text-2xl font-semibold">
            {stats?.deactivatedCount ?? 0}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Partner Overview</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-gray-500">Referral Count</div>
            <div className="mt-1 text-lg font-medium">
              {stats?.referralCount ?? 0}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Partner Tier</div>
            <div className="mt-1 text-lg font-medium">
              {stats?.partnerTier ?? "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}