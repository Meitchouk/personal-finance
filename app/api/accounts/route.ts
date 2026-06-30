import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = accounts ?? [];
  const creditIds = list.filter((a) => a.nature === "credit").map((a) => a.id);

  if (creditIds.length > 0) {
    const { data: txs } = await supabase
      .from("transactions")
      .select("account_id, amount")
      .in("account_id", creditIds)
      .eq("user_id", user.id)
      .eq("type", "expense");

    const balanceMap: Record<string, number> = {};
    for (const t of txs ?? []) {
      balanceMap[t.account_id] = (balanceMap[t.account_id] ?? 0) + Number(t.amount);
    }
    for (const a of list) {
      if (a.nature === "credit") {
        (a as Record<string, unknown>).credit_balance = balanceMap[a.id] ?? 0;
      }
    }
  }

  return NextResponse.json({ data: list });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = (body.name as string)?.trim();
  const type = body.type as string;
  const nature = body.nature as string;
  const color = (body.color as string) || "#64748b";

  if (!name) return NextResponse.json({ error: "Escribe un nombre" }, { status: 400 });
  if (!["bank", "card", "cash", "digital", "other"].includes(type))
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  if (!["debit", "credit"].includes(nature))
    return NextResponse.json({ error: "Naturaleza inválida" }, { status: 400 });

  const { data, error } = await supabase
    .from("accounts")
    .insert({ name, type, nature, color, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
