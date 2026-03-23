"use client";

import Link from "next/link";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50 p-4">
        <h2 className="mb-6 text-lg font-semibold">Dashboard</h2>

        <nav className="flex flex-col gap-3 text-sm">
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/listings">Listings</Link>
          <Link href="/dashboard/billing">Billing</Link>
          <Link href="/dashboard/referrals">Referrals</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}