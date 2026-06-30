import {
  BASE_CURRENCY,
  parseCurrency,
  parsePositiveAmount,
  roundMoney,
} from "@/lib/currency";

interface ExchangeRateQuery {
  eq(column: string, value: unknown): ExchangeRateQuery;
  single(): PromiseLike<{
    data: { rate: number | string } | null;
    error: { message: string } | null;
  }>;
}

interface ExchangeRateClient {
  from(table: string): {
    select(columns: string): ExchangeRateQuery;
  };
}

async function getExchangeRate(
  supabase: ExchangeRateClient,
  sourceCurrency: string
) {
  if (sourceCurrency === BASE_CURRENCY) return 1;

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("rate")
    .eq("source_currency", sourceCurrency)
    .eq("target_currency", BASE_CURRENCY)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    if (
      error?.message.includes("exchange_rates") &&
      error.message.includes("schema cache")
    ) {
      throw new Error("Falta ejecutar supabase/20260630_add_transaction_currency.sql");
    }

    throw new Error(`No hay tasa activa para ${sourceCurrency}->${BASE_CURRENCY}`);
  }

  return Number(data.rate);
}

export async function buildTransactionPayload(
  supabase: unknown,
  body: Record<string, unknown>
) {
  const originalAmount = parsePositiveAmount(body.original_amount ?? body.amount);
  if (!originalAmount) throw new Error("Ingresa un monto válido");

  const originalCurrency = parseCurrency(body.original_currency);
  const exchangeRate = await getExchangeRate(
    supabase as ExchangeRateClient,
    originalCurrency
  );

  return {
    amount: roundMoney(originalAmount * exchangeRate),
    original_amount: roundMoney(originalAmount),
    original_currency: originalCurrency,
    exchange_rate: exchangeRate,
    type: body.type,
    description: body.description,
    category_id: body.category_id || null,
    date: body.date,
    is_recurring: Boolean(body.is_recurring),
    recurrence_rule: body.is_recurring ? body.recurrence_rule : null,
  };
}
