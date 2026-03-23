"use client";

import Link from "next/link";

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-4">
        <h2 className="mb-6 text-lg font-semibold">Admin</h2>

        <nav className="flex flex-col gap-3 text-sm">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/users">Users</Link>
          <Link href="/admin/listings">Listings</Link>
          <Link href="/admin/billing">Billing</Link>
          <Link href="/admin/referrals">Referrals</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}