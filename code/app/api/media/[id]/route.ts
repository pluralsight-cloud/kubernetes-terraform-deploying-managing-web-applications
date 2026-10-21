import { makeCrudIdHandlers } from "@/lib/crud";
import { mediaSchema } from "@/lib/schemas";

export const { GET, PUT, DELETE } = makeCrudIdHandlers("mediaItems", mediaSchema);
