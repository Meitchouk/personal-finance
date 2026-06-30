import { Transaction } from "@/lib/types";

export function transactionsToCSV(transactions: Transaction[]): string {
  const headers = [
    "Date",
    "Description",
    "Category",
    "Type",
    "Original Amount",
    "Original Currency",
    "Exchange Rate",
    "Amount NIO",
  ];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`,
    t.categories?.name ?? "Uncategorized",
    t.type,
    (t.original_amount ?? t.amount).toFixed(2),
    t.original_currency ?? "NIO",
    (t.exchange_rate ?? 1).toFixed(6),
    t.amount.toFixed(2),
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
