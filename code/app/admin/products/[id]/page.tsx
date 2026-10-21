import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import type { Product } from "@/models/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();

  const col = await getCollection<Product>("products");
  const product = await col.findOne({ _id: new ObjectId(id) });
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit product</h1>
      <ProductForm
        id={id}
        initial={{
          type: product.type,
          title: product.title,
          tagline: product.tagline,
          description: product.description || "",
          image: product.image,
          link: product.link,
          sortOrder: product.sortOrder,
        }}
      />
    </div>
  );
}
