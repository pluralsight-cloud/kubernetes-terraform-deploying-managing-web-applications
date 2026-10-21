"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Column = {
  key: string;
  label: string;
};

type Props = {
  columns: Column[];
  rows: Record<string, unknown>[];
  basePath: string;
  apiPath: string;
};

export default function CrudTable({ columns, rows, basePath, apiPath }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    setBusyId(id);
    const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
    else alert("Delete failed");
  }

  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-6 text-center text-gray-500"
              >
                No items yet.
              </td>
            </tr>
          )}
          {rows.map((row) => {
            const id = String(row._id);
            return (
              <tr key={id} className="border-t border-gray-100">
                {columns.map((col) => (
                  <td key={col.key} className="max-w-xs truncate px-4 py-3">
                    {String(row[col.key] ?? "")}
                  </td>
                ))}
                <td className="space-x-3 px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`${basePath}/${id}`}
                    className="text-globo-teal hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === id}
                    onClick={() => onDelete(id)}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
