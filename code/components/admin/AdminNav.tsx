"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/story", label: "Story" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/page-content", label: "Page Content" },
  { href: "/admin/registrations", label: "Registrations" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
        <p className="font-semibold text-globo-header">Globomantics</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded px-3 py-2 text-sm ${
                active
                  ? "bg-globo-teal text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 space-y-2">
        <Link
          href="/"
          className="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          View site
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
