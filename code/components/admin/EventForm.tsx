"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/admin/Field";

type Data = {
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  active: boolean;
};

export default function EventForm({
  initial,
  id,
}: {
  initial?: Data;
  id?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Data>(
    initial || {
      title: "FUTURE",
      subtitle: "CONFERENCE",
      description: "",
      ctaLabel: "SIGN UP TODAY",
      active: true,
    },
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(id ? `/api/events/${id}` : "/api/events", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Save failed");
      return;
    }
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl rounded bg-white p-6 shadow-sm">
      <Field label="Title" name="title" required value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <Field label="Subtitle" name="subtitle" required value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} />
      <Field label="Description" name="description" type="textarea" required value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
      <Field label="CTA label" name="ctaLabel" required value={form.ctaLabel} onChange={(v) => setForm({ ...form, ctaLabel: v })} />
      <Field
        label="Active"
        name="active"
        type="checkbox"
        value={form.active}
        onChange={(v) => setForm({ ...form, active: v === "true" })}
      />
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="rounded bg-globo-teal px-4 py-2 font-semibold text-white disabled:opacity-60">
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
