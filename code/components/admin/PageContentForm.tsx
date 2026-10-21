"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/admin/Field";

type Data = {
  slug: "home" | "our-story" | "robotics" | "media";
  title: string;
  subtitle?: string;
  description?: string;
  heroImage: string;
  paragraphs?: string[];
};

export default function PageContentForm({
  initial,
  id,
}: {
  initial?: Data;
  id?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Data>(
    initial || {
      slug: "home",
      title: "",
      subtitle: "",
      description: "",
      heroImage: "/images/",
      paragraphs: [],
    },
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      paragraphs: (form.paragraphs || []).filter((p) => p.trim().length > 0),
    };
    const res = await fetch(
      id ? `/api/page-content/${id}` : "/api/page-content",
      {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    setLoading(false);
    if (!res.ok) {
      setError("Save failed");
      return;
    }
    router.push("/admin/page-content");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl rounded bg-white p-6 shadow-sm">
      <Field
        label="Slug"
        name="slug"
        type="select"
        value={form.slug}
        onChange={(v) => setForm({ ...form, slug: v as Data["slug"] })}
        options={[
          { value: "home", label: "home" },
          { value: "our-story", label: "our-story" },
          { value: "robotics", label: "robotics" },
          { value: "media", label: "media" },
        ]}
      />
      <Field label="Title" name="title" required value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Field label="Subtitle" name="subtitle" value={form.subtitle || ""} onChange={(v) => setForm({ ...form, subtitle: v })} />
      <Field label="Description" name="description" type="textarea" value={form.description || ""} onChange={(v) => setForm({ ...form, description: v })} />
      <Field label="Hero image" name="heroImage" required value={form.heroImage} onChange={(v) => setForm({ ...form, heroImage: v })} />
      <Field
        label="Paragraphs (optional, separate with ---)"
        name="paragraphs"
        type="textarea"
        value={(form.paragraphs || []).join("\n---\n")}
        onChange={(v) =>
          setForm({
            ...form,
            paragraphs: v.split(/\n---\n/).map((p) => p.trim()),
          })
        }
      />
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="rounded bg-globo-teal px-4 py-2 font-semibold text-white disabled:opacity-60">
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
