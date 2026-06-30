import type {
  Transaction,
  Category,
  CategorySpending,
  MonthlySummary,
  MonthlyTrend,
} from "@/lib/types";
import type { MonthBucket } from "@/lib/utils/date-helpers";

/** Income / expense / net totals for a set of transactions. */
export function summarize(transactions: Transaction[]): MonthlySummary {
  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, net: income - expenses };
}

/** Expense totals grouped by category, sorted desc, with percentage of total. */
export function spendingByCategory(transactions: Transaction[]): CategorySpending[] {
  const map = new Map<string, { category: Category; total: number }>();
  let total = 0;

  for (const t of transactions) {
    if (t.type !== "expense" || !t.categories || !t.category_id) continue;
    total += t.amount;
    const entry = map.get(t.category_id);
    if (entry) entry.total += t.amount;
    else map.set(t.category_id, { category: t.categories, total: t.amount });
  }

  return Array.from(map.values())
    .map((e) => ({
      ...e,
      percentage: total > 0 ? (e.total / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/** Income vs expenses per month bucket. */
export function monthlyTrend(
  transactions: Transaction[],
  buckets: MonthBucket[]
): MonthlyTrend[] {
  return buckets.map((b) => {
    const inRange = transactions.filter((t) => t.date >= b.from && t.date <= b.to);
    const { income, expenses } = summarize(inRange);
    return { month: b.short, income, expenses };
  });
}

/** Total expense amount spent per category id (for budget progress). */
export function expenseTotalsByCategory(
  transactions: { category_id: string | null; amount: number; type?: string }[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type && t.type !== "expense") continue;
    if (!t.category_id) continue;
    totals[t.category_id] = (totals[t.category_id] ?? 0) + t.amount;
  }
  return totals;
}
