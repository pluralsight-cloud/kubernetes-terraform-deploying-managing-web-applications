import { redirect } from "next/navigation";
import StoryForm from "@/components/admin/StoryForm";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New story section</h1>
      <StoryForm />
    </div>
  );
}
