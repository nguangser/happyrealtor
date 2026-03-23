"use client";

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold">
          HappyRealtor
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/search" className="hover:underline">
            Search
          </Link>
          <Link href="/projects" className="hover:underline">
            Projects
          </Link>
          <Link href="/realtors" className="hover:underline">
            Realtors
          </Link>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-md border px-3 py-1 text-sm"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-black px-3 py-1 text-sm text-white"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}