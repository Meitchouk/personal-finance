import type { TransactionType } from "@/lib/types";

export function buildCategoryPayload(body: Record<string, unknown>) {
  const type = body.type === "income" ? "income" : "expense";

  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    icon: typeof body.icon === "string" ? body.icon : "other",
    color: typeof body.color === "string" ? body.color : "#10b981",
    type: type as TransactionType,
  };
}
