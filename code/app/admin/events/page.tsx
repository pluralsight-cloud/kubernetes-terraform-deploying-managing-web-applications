import Link from "next/link";
import { redirect } from "next/navigation";
import CrudTable from "@/components/admin/CrudTable";
import { auth } from "@/lib/auth";
import { getEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const rows = await getEvents();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link href="/admin/events/new" className="rounded bg-globo-teal px-4 py-2 text-sm font-semibold text-white">
          New event
        </Link>
      </div>
      <CrudTable
        basePath="/admin/events"
        apiPath="/api/events"
        columns={[
          { key: "title", label: "Title" },
          { key: "subtitle", label: "Subtitle" },
          { key: "ctaLabel", label: "CTA" },
          { key: "active", label: "Active" },
        ]}
        rows={rows as Record<string, unknown>[]}
      />
    </div>
  );
}
