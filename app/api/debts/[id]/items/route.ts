import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: debt_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify debt belongs to user
  const { data: debt } = await supabase
    .from("debts").select("id").eq("id", debt_id).eq("user_id", user.id).single();
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const description = (body.description as string)?.trim();
  const amount = parseFloat(body.amount);
  if (!description) return NextResponse.json({ error: "Descripción requerida" }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Monto inválido" }, { status: 400 });

  const quantity = Math.max(1, Math.round(Number(body.quantity) || 1));

  const { data, error } = await supabase
    .from("debt_items")
    .insert({
      debt_id,
      description,
      amount: Math.round(amount * quantity * 100) / 100,
      quantity,
      item_date: body.item_date ?? new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
