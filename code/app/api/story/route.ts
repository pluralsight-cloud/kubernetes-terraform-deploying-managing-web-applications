import { makeCrudHandlers } from "@/lib/crud";
import { storySchema } from "@/lib/schemas";

export const { GET, POST } = makeCrudHandlers("storySections", storySchema);
