import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from "@/lib/format";

export const BASE_CURRENCY: CurrencyCode = DEFAULT_CURRENCY;

export interface ExchangeRate {
  source_currency: CurrencyCode;
  target_currency: CurrencyCode;
  rate: number;
}

export const DEFAULT_EXCHANGE_RATES: ExchangeRate[] = [
  { source_currency: "NIO", target_currency: "NIO", rate: 1 },
  { source_currency: "USD", target_currency: "USD", rate: 1 },
  { source_currency: "NIO", target_currency: "USD", rate: 0.027 },
  { source_currency: "USD", target_currency: "NIO", rate: 36.81 },
];

export function parseCurrency(value: unknown): CurrencyCode {
  return isCurrencyCode(value) ? value : BASE_CURRENCY;
}

export function parsePositiveAmount(value: unknown): number | null {
  const amount =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

export function roundMoney(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
