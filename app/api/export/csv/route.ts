import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { transactionsToCSV } from "@/lib/utils/csv-export";
import { Transaction } from "@/lib/types";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date_from = searchParams.get("date_from");
  const date_to = searchParams.get("date_to");

  let query = supabase
    .from("transactions")
    .select("*, categories(*)")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (date_from) query = query.gte("date", date_from);
  if (date_to) query = query.lte("date", date_to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const csv = transactionsToCSV((data as Transaction[]) ?? []);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transacciones.csv"`,
    },
  });
}
