import { makeCrudHandlers } from "@/lib/crud";
import { pageContentSchema } from "@/lib/schemas";

export const { GET, POST } = makeCrudHandlers("pageContent", pageContentSchema);
