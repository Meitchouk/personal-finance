import type { TransactionType } from "@/lib/types";

/** Palette offered when creating/editing a category. */
export const CATEGORY_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#64748b", "#78716c", "#0f766e",
] as const;

export const DEFAULT_CATEGORY_COLOR = "#10b981";

/** Fixed brand colors for income/expense in charts (Recharts needs literal colors). */
export const INCOME_COLOR = "#10b981";
export const EXPENSE_COLOR = "#f43f5e";

/** Categorical palette fallback for charts. */
export const CHART_PALETTE = [
  "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899",
  "#06b6d4", "#ef4444", "#84cc16", "#f97316", "#6366f1",
];

export const RECURRENCE_OPTIONS = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
] as const;

export const TRANSACTION_TYPES: Record<
  TransactionType,
  { label: string; sign: string }
> = {
  income: { label: "Ingreso", sign: "+" },
  expense: { label: "Gasto", sign: "-" },
};

/** Default page size for transaction lists / exports. */
export const TRANSACTIONS_PAGE_SIZE = 50;
export const EXPORT_MAX_ROWS = 5000;

/** Number of months shown in trend reports. */
export const TREND_MONTHS = 6;
