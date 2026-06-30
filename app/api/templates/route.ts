import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("transaction_templates")
    .select("*, categories(*), accounts(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { description, type, original_amount, original_currency, category_id, account_id } = body;

  if (!description?.trim()) return NextResponse.json({ error: "Descripción requerida" }, { status: 400 });
  if (!["income", "expense"].includes(type)) return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  const amount = parseFloat(original_amount);
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Monto inválido" }, { status: 400 });

  const { data, error } = await supabase
    .from("transaction_templates")
    .insert({
      user_id: user.id,
      description: description.trim(),
      type,
      original_amount: amount,
      original_currency: original_currency ?? "NIO",
      category_id: category_id || null,
      account_id: account_id || null,
    })
    .select("*, categories(*), accounts(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
