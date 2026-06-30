import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export function getCurrentMonthRange() {
  const now = new Date();
  return {
    from: format(startOfMonth(now), "yyyy-MM-dd"),
    to: format(endOfMonth(now), "yyyy-MM-dd"),
  };
}

export function getLastNMonths(n: number) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = subMonths(now, n - 1 - i);
    return {
      label: format(d, "MMM yyyy"),
      from: format(startOfMonth(d), "yyyy-MM-dd"),
      to: format(endOfMonth(d), "yyyy-MM-dd"),
    };
  });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

export function formatDate(date: string) {
  return format(new Date(date + "T00:00:00"), "dd MMM yyyy");
}
