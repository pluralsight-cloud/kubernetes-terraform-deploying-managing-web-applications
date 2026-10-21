import Link from "next/link";
import { redirect } from "next/navigation";
import CrudTable from "@/components/admin/CrudTable";
import { auth } from "@/lib/auth";
import { getStorySections } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const rows = await getStorySections();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Story sections</h1>
        <Link href="/admin/story/new" className="rounded bg-globo-teal px-4 py-2 text-sm font-semibold text-white">
          New section
        </Link>
      </div>
      <CrudTable
        basePath="/admin/story"
        apiPath="/api/story"
        columns={[
          { key: "title", label: "Title" },
          { key: "sidebarTitle", label: "Sidebar" },
          { key: "sortOrder", label: "Order" },
        ]}
        rows={rows as Record<string, unknown>[]}
      />
    </div>
  );
}
