import { makeCrudHandlers } from "@/lib/crud";
import { mediaSchema } from "@/lib/schemas";

export const { GET, POST } = makeCrudHandlers("mediaItems", mediaSchema);
