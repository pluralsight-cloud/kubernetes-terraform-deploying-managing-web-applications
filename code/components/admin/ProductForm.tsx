"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/admin/Field";

type ProductFormData = {
  type: "home" | "robotics";
  title: string;
  tagline: string;
  description?: string;
  image: string;
  link: string;
  sortOrder: number;
};

export default function ProductForm({
  initial,
  id,
}: {
  initial?: ProductFormData;
  id?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(
    initial || {
      type: "home",
      title: "",
      tagline: "",
      description: "",
      image: "/images/",
      link: "#",
      sortOrder: 0,
    },
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof ProductFormData>(key: K, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]:
        key === "sortOrder"
          ? Number(value)
          : (value as ProductFormData[K]),
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(id ? `/api/products/${id}` : "/api/products", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Save failed");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl rounded bg-white p-6 shadow-sm">
      <Field
        label="Type"
        name="type"
        type="select"
        value={form.type}
        onChange={(v) => set("type", v)}
        options={[
          { value: "home", label: "Home" },
          { value: "robotics", label: "Robotics" },
        ]}
      />
      <Field label="Title" name="title" required value={form.title} onChange={(v) => set("title", v)} />
      <Field label="Tagline" name="tagline" required value={form.tagline} onChange={(v) => set("tagline", v)} />
      <Field
        label="Description"
        name="description"
        type="textarea"
        value={form.description || ""}
        onChange={(v) => set("description", v)}
      />
      <Field label="Image path" name="image" required value={form.image} onChange={(v) => set("image", v)} />
      <Field label="Link" name="link" required value={form.link} onChange={(v) => set("link", v)} />
      <Field
        label="Sort order"
        name="sortOrder"
        type="number"
        value={form.sortOrder}
        onChange={(v) => set("sortOrder", v)}
      />
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-globo-teal px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
