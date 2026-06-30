import { Transaction } from "@/lib/types";

export function transactionsToCSV(transactions: Transaction[]): string {
  const headers = ["Date", "Description", "Category", "Type", "Amount"];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`,
    t.categories?.name ?? "Uncategorized",
    t.type,
    t.amount.toFixed(2),
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
