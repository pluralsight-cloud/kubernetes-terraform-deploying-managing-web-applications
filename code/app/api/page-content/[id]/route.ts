import { makeCrudIdHandlers } from "@/lib/crud";
import { pageContentSchema } from "@/lib/schemas";

export const { GET, PUT, DELETE } = makeCrudIdHandlers(
  "pageContent",
  pageContentSchema,
);
