import { redirect } from "next/navigation";
import MediaForm from "@/components/admin/MediaForm";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New media item</h1>
      <MediaForm />
    </div>
  );
}
