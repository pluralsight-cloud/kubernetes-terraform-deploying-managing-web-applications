import { makeCrudIdHandlers } from "@/lib/crud";
import { eventSchema } from "@/lib/schemas";

export const { GET, PUT, DELETE } = makeCrudIdHandlers("events", eventSchema);
