import { makeCrudHandlers } from "@/lib/crud";
import { categorySchema } from "@/lib/schemas";

export const { GET, POST } = makeCrudHandlers("categories", categorySchema);
