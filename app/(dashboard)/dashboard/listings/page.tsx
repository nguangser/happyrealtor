"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";
import { ListingCard } from "./_components/listing-card";

export default function ListingsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = useQuery(api.modules.users.queries.getCurrent, {});
  const listings = useQuery(
    api.modules.listings.queries.listByUser,
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

    if (user.onboardingStage !== "completed") {
      router.replace("/dashboard");
    }
  }, [sessionPending, session, user, router]);

  if (sessionPending || user === undefined || listings === undefined) {
    return <div className="p-6">Loading listings...</div>;
  }

  if (!session || !user) {
    return <div className="p-6">Redirecting...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My Listings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create and manage your property listings.
        </p>
      </div>

      <div className="mb-8 rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Create New Listing</h2>
            <p className="mt-1 text-sm text-gray-600">
              Use the guided multi-step flow to create a draft listing.
            </p>
          </div>

          <Link
            href="/dashboard/listings/new"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Create Listing
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Existing Listings</h2>

        {listings.length === 0 ? (
          <p className="text-sm text-gray-500">No listings yet.</p>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                userId={user._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}