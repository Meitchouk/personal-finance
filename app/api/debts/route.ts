import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("debts")
    .select("*, accounts(*), debt_items(*), debt_products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const creditor_name = (body.creditor_name as string)?.trim();
  if (!creditor_name) return NextResponse.json({ error: "Nombre de acreedor requerido" }, { status: 400 });

  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: user.id,
      creditor_name,
      notes: (body.notes as string)?.trim() || null,
      account_id: body.account_id || null,
    })
    .select("*, accounts(*), debt_items(*), debt_products(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
