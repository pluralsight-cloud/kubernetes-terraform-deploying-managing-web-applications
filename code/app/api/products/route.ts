import { makeCrudHandlers } from "@/lib/crud";
import { productSchema } from "@/lib/schemas";

export const { GET, POST } = makeCrudHandlers("products", productSchema);
