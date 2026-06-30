import type { CurrencyCode } from "@/lib/format";

export type TransactionType = "income" | "expense";

export type AccountType = "bank" | "card" | "cash" | "digital" | "other";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  currency: CurrencyCode;
  google_sheet_id: string | null;
  google_sheet_name: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  account_id: string | null;
  amount: number;
  original_amount: number;
  original_currency: CurrencyCode;
  exchange_rate: number;
  type: TransactionType;
  description: string;
  date: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  parent_recurring_id: string | null;
  created_at: string;
  categories?: Category | null;
  accounts?: Account | null;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  monthly_limit: number;
  created_at: string;
  categories?: Category | null;
}

export interface BudgetWithSpent extends Budget {
  spent: number;
}

export interface MonthlySummary {
  income: number;
  expenses: number;
  net: number;
}

export interface CategorySpending {
  category: Category;
  total: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export interface TransactionTemplate {
  id: string;
  user_id: string;
  description: string;
  type: TransactionType;
  original_amount: number;
  original_currency: CurrencyCode;
  category_id: string | null;
  account_id: string | null;
  created_at: string;
  categories?: Category | null;
  accounts?: Account | null;
}

export interface TransactionFilters {
  search?: string;
  category_id?: string;
  type?: TransactionType | "all";
  date_from?: string;
  date_to?: string;
}
