import { format } from "date-fns";
import { es } from "date-fns/locale";

export type CurrencyCode = "NIO" | "USD";

export const CURRENCIES: Record<
  CurrencyCode,
  { code: CurrencyCode; label: string; symbol: string; locale: string }
> = {
  NIO: { code: "NIO", label: "Córdoba (C$)", symbol: "C$", locale: "es-NI" },
  USD: { code: "USD", label: "Dólar (US$)", symbol: "$", locale: "en-US" },
};

export const DEFAULT_CURRENCY: CurrencyCode = "NIO";

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === "NIO" || value === "USD";
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = DEFAULT_CURRENCY
): string {
  const c = CURRENCIES[currency] ?? CURRENCIES[DEFAULT_CURRENCY];
  return new Intl.NumberFormat(c.locale, {
    style: "currency",
    currency: c.code,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** "dd MMM yyyy" — e.g. "30 jun 2026" */
export function formatDate(date: string): string {
  return format(new Date(date + "T00:00:00"), "dd MMM yyyy", { locale: es });
}

/** "Junio 2026" capitalized — used for monthly sheet tabs and labels. */
export function formatMonthYear(date: Date = new Date()): string {
  const s = format(date, "MMMM yyyy", { locale: es });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
