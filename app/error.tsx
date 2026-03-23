"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-semibold">Something went wrong</h2>

      <p className="text-sm text-gray-600">
        {error.message || "Unexpected error occurred"}
      </p>

      <button
        onClick={() => reset()}
        className="rounded-md bg-black px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  );
}