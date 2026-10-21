import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { registrationSchema } from "@/lib/schemas";
import type { Registration } from "@/models/types";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const col = await getCollection<Registration>("registrations");
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(
    docs.map((d) => ({
      ...d,
      _id: String(d._id),
      createdAt:
        d.createdAt instanceof Date
          ? d.createdAt.toISOString()
          : d.createdAt,
    })),
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const col = await getCollection<Registration>("registrations");
  const doc = {
    ...parsed.data,
    createdAt: new Date(),
  };
  const result = await col.insertOne(doc);
  return NextResponse.json(
    { _id: String(result.insertedId), ...doc, createdAt: doc.createdAt.toISOString() },
    { status: 201 },
  );
}
