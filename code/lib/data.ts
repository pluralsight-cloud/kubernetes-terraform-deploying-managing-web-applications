import { getCollection } from "@/lib/mongodb";
import type {
  Category,
  EventDoc,
  MediaItem,
  PageContent,
  Product,
  Registration,
  StorySection,
  User,
} from "@/models/types";

function serialize<T extends { _id?: unknown }>(doc: T) {
  return {
    ...doc,
    _id: doc._id ? String(doc._id) : undefined,
  };
}

export async function getPageContent(slug: PageContent["slug"]) {
  const col = await getCollection<PageContent>("pageContent");
  const doc = await col.findOne({ slug });
  return doc ? serialize(doc) : null;
}

export async function getProducts(type?: Product["type"]) {
  const col = await getCollection<Product>("products");
  const filter = type ? { type } : {};
  const docs = await col.find(filter).sort({ sortOrder: 1 }).toArray();
  return docs.map(serialize);
}

export async function getCategories() {
  const col = await getCollection<Category>("categories");
  const docs = await col.find({}).sort({ sortOrder: 1 }).toArray();
  return docs.map(serialize);
}

export async function getMediaItems() {
  const col = await getCollection<MediaItem>("mediaItems");
  const docs = await col.find({}).sort({ sortOrder: 1 }).toArray();
  return docs.map(serialize);
}

export async function getStorySections() {
  const col = await getCollection<StorySection>("storySections");
  const docs = await col.find({}).sort({ sortOrder: 1 }).toArray();
  return docs.map(serialize);
}

export async function getActiveEvent() {
  const col = await getCollection<EventDoc>("events");
  const doc = await col.findOne({ active: true });
  return doc ? serialize(doc) : null;
}

export async function getEvents() {
  const col = await getCollection<EventDoc>("events");
  const docs = await col.find({}).toArray();
  return docs.map(serialize);
}

export async function getRegistrations() {
  const col = await getCollection<Registration>("registrations");
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map((d) => ({
    ...serialize(d),
    createdAt:
      d.createdAt instanceof Date
        ? d.createdAt.toISOString()
        : String(d.createdAt),
  }));
}

export async function getUserByEmail(email: string) {
  const col = await getCollection<User>("users");
  return col.findOne({ email: email.toLowerCase() });
}
