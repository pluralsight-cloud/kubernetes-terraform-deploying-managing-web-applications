"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/admin/Field";

type Data = {
  title: string;
  paragraphs: string[];
  sidebarTitle: string;
  sidebarBody: string;
  sidebarImage: string;
  sortOrder: number;
};

export default function StoryForm({
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
      paragraphs: [""],
      sidebarTitle: "",
      sidebarBody: "",
      sidebarImage: "/images/",
      sortOrder: 0,
    },
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      paragraphs: form.paragraphs.filter((p) => p.trim().length > 0),
    };
    const res = await fetch(id ? `/api/story/${id}` : "/api/story", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Save failed");
      return;
    }
    router.push("/admin/story");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl rounded bg-white p-6 shadow-sm">
      <Field label="Title" name="title" required value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Field
        label="Paragraphs (separate with --- on its own line)"
        name="paragraphs"
        type="textarea"
        required
        value={form.paragraphs.join("\n---\n")}
        onChange={(v) =>
          setForm({
            ...form,
            paragraphs: v.split(/\n---\n/).map((p) => p.trim()),
          })
        }
      />
      <Field label="Sidebar title" name="sidebarTitle" required value={form.sidebarTitle} onChange={(v) => setForm({ ...form, sidebarTitle: v })} />
      <Field label="Sidebar body" name="sidebarBody" type="textarea" required value={form.sidebarBody} onChange={(v) => setForm({ ...form, sidebarBody: v })} />
      <Field label="Sidebar image" name="sidebarImage" required value={form.sidebarImage} onChange={(v) => setForm({ ...form, sidebarImage: v })} />
      <Field label="Sort order" name="sortOrder" type="number" value={form.sortOrder} onChange={(v) => setForm({ ...form, sortOrder: Number(v) })} />
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="rounded bg-globo-teal px-4 py-2 font-semibold text-white disabled:opacity-60">
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
