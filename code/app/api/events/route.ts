import { makeCrudHandlers } from "@/lib/crud";
import { eventSchema } from "@/lib/schemas";

export const { GET, POST } = makeCrudHandlers("events", eventSchema);
