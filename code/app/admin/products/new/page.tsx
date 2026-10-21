import { redirect } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { auth } from "@/lib/auth";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New product</h1>
      <ProductForm />
    </div>
  );
}
