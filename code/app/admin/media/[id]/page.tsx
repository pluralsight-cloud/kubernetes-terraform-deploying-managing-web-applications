import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import MediaForm from "@/components/admin/MediaForm";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import type { MediaItem } from "@/models/types";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const doc = await (await getCollection<MediaItem>("mediaItems")).findOne({
    _id: new ObjectId(id),
  });
  if (!doc) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit media item</h1>
      <MediaForm
        id={id}
        initial={{
          title: doc.title,
          body: doc.body,
          image: doc.image,
          layout: doc.layout,
          sortOrder: doc.sortOrder,
        }}
      />
    </div>
  );
}
