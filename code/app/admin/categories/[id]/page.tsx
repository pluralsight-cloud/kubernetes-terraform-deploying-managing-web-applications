import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import type { Category } from "@/models/types";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const doc = await (await getCollection<Category>("categories")).findOne({
    _id: new ObjectId(id),
  });
  if (!doc) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit category</h1>
      <CategoryForm
        id={id}
        initial={{
          title: doc.title,
          image: doc.image,
          sortOrder: doc.sortOrder,
        }}
      />
    </div>
  );
}
