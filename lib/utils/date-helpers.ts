import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export interface DateRange {
  from: string;
  to: string;
}

export function getCurrentMonthRange(): DateRange {
  const now = new Date();
  return {
    from: format(startOfMonth(now), "yyyy-MM-dd"),
    to: format(endOfMonth(now), "yyyy-MM-dd"),
  };
}

export interface MonthBucket extends DateRange {
  /** Short month label, e.g. "jun" */
  short: string;
}

export function getLastNMonths(n: number): MonthBucket[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = subMonths(now, n - 1 - i);
    return {
      short: format(d, "MMM"),
      from: format(startOfMonth(d), "yyyy-MM-dd"),
      to: format(endOfMonth(d), "yyyy-MM-dd"),
    };
  });
}
