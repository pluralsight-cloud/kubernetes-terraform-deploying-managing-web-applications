import { makeCrudIdHandlers } from "@/lib/crud";
import { productSchema } from "@/lib/schemas";

export const { GET, PUT, DELETE } = makeCrudIdHandlers(
  "products",
  productSchema,
);
