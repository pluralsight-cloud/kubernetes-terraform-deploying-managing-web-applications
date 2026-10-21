import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import EventForm from "@/components/admin/EventForm";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import type { EventDoc } from "@/models/types";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const doc = await (await getCollection<EventDoc>("events")).findOne({
    _id: new ObjectId(id),
  });
  if (!doc) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit event</h1>
      <EventForm
        id={id}
        initial={{
          title: doc.title,
          subtitle: doc.subtitle,
          description: doc.description,
          ctaLabel: doc.ctaLabel,
          active: doc.active,
        }}
      />
    </div>
  );
}
