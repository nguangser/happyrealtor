import Link from "next/link";
import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <div className="text-lg font-semibold">HappyRealtor</div>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/listings">Listings</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}