export type TransactionType = "income" | "expense";

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  parent_recurring_id: string | null;
  created_at: string;
  categories?: Category | null;
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
  percentage: number;
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

export interface TransactionFilters {
  search?: string;
  category_id?: string;
  type?: TransactionType | "all";
  date_from?: string;
  date_to?: string;
}
