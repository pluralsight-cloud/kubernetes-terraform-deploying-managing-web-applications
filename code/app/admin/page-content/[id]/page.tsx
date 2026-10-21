import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import PageContentForm from "@/components/admin/PageContentForm";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import type { PageContent } from "@/models/types";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const doc = await (await getCollection<PageContent>("pageContent")).findOne({
    _id: new ObjectId(id),
  });
  if (!doc) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit page content</h1>
      <PageContentForm
        id={id}
        initial={{
          slug: doc.slug,
          title: doc.title,
          subtitle: doc.subtitle || "",
          description: doc.description || "",
          heroImage: doc.heroImage,
          paragraphs: doc.paragraphs || [],
        }}
      />
    </div>
  );
}
