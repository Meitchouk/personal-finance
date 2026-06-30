import { createClient } from "@/lib/supabase/server";
import { DEFAULT_EXCHANGE_RATES } from "@/lib/currency";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("source_currency, target_currency, rate")
    .eq("is_active", true)
    .order("source_currency", { ascending: true });

  if (error) {
    const isMissingTable =
      error.message.includes("exchange_rates") &&
      error.message.includes("schema cache");

    if (isMissingTable) {
      return NextResponse.json({
        data: DEFAULT_EXCHANGE_RATES,
        source: "fallback",
        warning: "Ejecuta supabase/20260630_add_transaction_currency.sql",
      });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, source: "database" });
}
