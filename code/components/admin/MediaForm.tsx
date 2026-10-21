"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/admin/Field";

type Data = {
  title: string;
  body: string;
  image: string;
  layout: "image-right" | "image-left";
  sortOrder: number;
};

export default function MediaForm({
  initial,
  id,
}: {
  initial?: Data;
  id?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Data>(
    initial || {
      title: "",
      body: "",
      image: "/images/",
      layout: "image-right",
      sortOrder: 0,
    },
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(id ? `/api/media/${id}` : "/api/media", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Save failed");
      return;
    }
    router.push("/admin/media");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl rounded bg-white p-6 shadow-sm">
      <Field label="Title" name="title" required value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Field label="Body" name="body" type="textarea" required value={form.body} onChange={(v) => setForm({ ...form, body: v })} />
      <Field label="Image path" name="image" required value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
      <Field
        label="Layout"
        name="layout"
        type="select"
        value={form.layout}
        onChange={(v) => setForm({ ...form, layout: v as Data["layout"] })}
        options={[
          { value: "image-right", label: "Image right" },
          { value: "image-left", label: "Image left" },
        ]}
      />
      <Field label="Sort order" name="sortOrder" type="number" value={form.sortOrder} onChange={(v) => setForm({ ...form, sortOrder: Number(v) })} />
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="rounded bg-globo-teal px-4 py-2 font-semibold text-white disabled:opacity-60">
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
