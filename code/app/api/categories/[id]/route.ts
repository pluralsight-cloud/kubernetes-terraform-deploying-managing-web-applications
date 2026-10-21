import { makeCrudIdHandlers } from "@/lib/crud";
import { categorySchema } from "@/lib/schemas";

export const { GET, PUT, DELETE } = makeCrudIdHandlers(
  "categories",
  categorySchema,
);
