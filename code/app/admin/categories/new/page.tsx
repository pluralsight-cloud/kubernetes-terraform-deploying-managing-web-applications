import { redirect } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New category</h1>
      <CategoryForm />
    </div>
  );
}
