import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const cards = [
  { href: "/admin/products", title: "Products", desc: "Home & robotics products" },
  { href: "/admin/categories", title: "Categories", desc: "Robotics application categories" },
  { href: "/admin/media", title: "Media", desc: "Media page articles" },
  { href: "/admin/story", title: "Story", desc: "Our Story sections" },
  { href: "/admin/events", title: "Events", desc: "Future Conference details" },
  { href: "/admin/page-content", title: "Page Content", desc: "Hero copy per page" },
  { href: "/admin/registrations", title: "Registrations", desc: "Conference signups" },
];

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Dashboard</h1>
      <p className="mb-8 text-gray-600">
        Signed in as {session.user.email}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-globo-teal"
          >
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
