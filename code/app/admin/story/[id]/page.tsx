import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import StoryForm from "@/components/admin/StoryForm";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import type { StorySection } from "@/models/types";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const doc = await (
    await getCollection<StorySection>("storySections")
  ).findOne({ _id: new ObjectId(id) });
  if (!doc) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit story section</h1>
      <StoryForm
        id={id}
        initial={{
          title: doc.title,
          paragraphs: doc.paragraphs,
          sidebarTitle: doc.sidebarTitle,
          sidebarBody: doc.sidebarBody,
          sidebarImage: doc.sidebarImage,
          sortOrder: doc.sortOrder,
        }}
      />
    </div>
  );
}
