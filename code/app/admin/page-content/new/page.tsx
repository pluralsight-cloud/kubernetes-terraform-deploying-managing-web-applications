import { redirect } from "next/navigation";
import PageContentForm from "@/components/admin/PageContentForm";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New page content</h1>
      <PageContentForm />
    </div>
  );
}
