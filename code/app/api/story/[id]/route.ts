import { makeCrudIdHandlers } from "@/lib/crud";
import { storySchema } from "@/lib/schemas";

export const { GET, PUT, DELETE } = makeCrudIdHandlers(
  "storySections",
  storySchema,
);
