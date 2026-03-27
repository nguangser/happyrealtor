"use client";

type Props = {
  keyword: string;
  setKeyword: (value: string) => void;
  propertyCategory: string;
  setPropertyCategory: (value: string) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
};

export function PublicListingsSearch({
  keyword,
  setKeyword,
  propertyCategory,
  setPropertyCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Keyword
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search title, MRT, features..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={propertyCategory}
            onChange={(e) => setPropertyCategory(e.target.value)}
          >
            <option value="">All</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="land">Land</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Min Price
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Max Price
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="5000000"
          />
        </div>
      </div>
    </div>
  );
}