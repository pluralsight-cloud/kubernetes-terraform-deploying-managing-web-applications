import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { ZodType } from "zod";
import { getCollection } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/api-auth";

function serializeDoc<T extends { _id?: ObjectId }>(doc: T) {
  return { ...doc, _id: String(doc._id) };
}

export function makeCrudHandlers<T extends Record<string, unknown>>(
  collectionName: string,
  schema: ZodType<T>,
) {
  async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    const col = await getCollection(collectionName);
    const docs = await col.find({}).toArray();
    return NextResponse.json(docs.map((d) => serializeDoc(d as { _id: ObjectId })));
  }

  async function POST(request: Request) {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const col = await getCollection(collectionName);
    const result = await col.insertOne(parsed.data);
    return NextResponse.json(
      { _id: String(result.insertedId), ...parsed.data },
      { status: 201 },
    );
  }

  return { GET, POST };
}

export function makeCrudIdHandlers<T extends Record<string, unknown>>(
  collectionName: string,
  schema: ZodType<T>,
) {
  async function GET(
    _request: Request,
    context: { params: Promise<{ id: string }> },
  ) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const col = await getCollection(collectionName);
    const doc = await col.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(serializeDoc(doc as { _id: ObjectId }));
  }

  async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> },
  ) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const col = await getCollection(collectionName);
    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: parsed.data },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(serializeDoc(result as { _id: ObjectId }));
  }

  async function DELETE(
    _request: Request,
    context: { params: Promise<{ id: string }> },
  ) {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const col = await getCollection(collectionName);
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  return { GET, PUT, DELETE };
}
