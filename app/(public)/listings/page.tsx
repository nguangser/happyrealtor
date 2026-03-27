"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PublicListingsSearch } from "./_components/public-listings-search";
import { PublicListingCard } from "./_components/public-listing-card";

export default function PublicListingsPage() {
  const [keyword, setKeyword] = useState("");
  const [propertyCategory, setPropertyCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const filters = useMemo(() => {
    return {
      keyword: keyword.trim() || undefined,
      propertyCategory:
        propertyCategory === ""
          ? undefined
          : (propertyCategory as
              | "residential"
              | "commercial"
              | "industrial"
              | "land"),
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    };
  }, [keyword, propertyCategory, minPrice, maxPrice]);

  const listings = useQuery(api.modules.listings.queries.searchPublished, filters);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Browse Listings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Discover published property listings across Singapore.
        </p>
      </div>

      <div className="mb-6">
        <PublicListingsSearch
          keyword={keyword}
          setKeyword={setKeyword}
          propertyCategory={propertyCategory}
          setPropertyCategory={setPropertyCategory}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
        />
      </div>

      {listings === undefined ? (
        <div className="text-sm text-gray-500">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          No published listings match your search.
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-500">
            {listings.length} listing{listings.length === 1 ? "" : "s"} found
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <PublicListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}