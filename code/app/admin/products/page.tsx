import Link from "next/link";
import { redirect } from "next/navigation";
import CrudTable from "@/components/admin/CrudTable";
import { auth } from "@/lib/auth";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const products = await getProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded bg-globo-teal px-4 py-2 text-sm font-semibold text-white"
        >
          New product
        </Link>
      </div>
      <CrudTable
        basePath="/admin/products"
        apiPath="/api/products"
        columns={[
          { key: "title", label: "Title" },
          { key: "type", label: "Type" },
          { key: "tagline", label: "Tagline" },
          { key: "sortOrder", label: "Order" },
        ]}
        rows={products as Record<string, unknown>[]}
      />
    </div>
  );
}
