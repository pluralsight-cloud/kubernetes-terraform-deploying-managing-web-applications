import { redirect } from "next/navigation";
import EventForm from "@/components/admin/EventForm";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New event</h1>
      <EventForm />
    </div>
  );
}
