import Link from "next/link";
import { redirect } from "next/navigation";
import CrudTable from "@/components/admin/CrudTable";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import type { PageContent } from "@/models/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const col = await getCollection<PageContent>("pageContent");
  const docs = await col.find({}).toArray();
  const rows = docs.map((d) => ({ ...d, _id: String(d._id) }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Page content</h1>
        <Link href="/admin/page-content/new" className="rounded bg-globo-teal px-4 py-2 text-sm font-semibold text-white">
          New page content
        </Link>
      </div>
      <CrudTable
        basePath="/admin/page-content"
        apiPath="/api/page-content"
        columns={[
          { key: "slug", label: "Slug" },
          { key: "title", label: "Title" },
          { key: "subtitle", label: "Subtitle" },
        ]}
        rows={rows as Record<string, unknown>[]}
      />
    </div>
  );
}
