import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: debt_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: debt } = await supabase
    .from("debts").select("id").eq("id", debt_id).eq("user_id", user.id).single();
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const name = (body.name as string)?.trim();
  const unit_price = parseFloat(body.unit_price);
  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  if (!Number.isFinite(unit_price) || unit_price <= 0) return NextResponse.json({ error: "Precio inválido" }, { status: 400 });

  const { data, error } = await supabase
    .from("debt_products")
    .insert({ debt_id, name, unit_price, unit: body.unit?.trim() || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
