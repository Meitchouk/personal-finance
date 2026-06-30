import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const update: Record<string, unknown> = {};

  if (typeof body.is_paid === "boolean") {
    update.is_paid = body.is_paid;
    update.paid_at = body.is_paid ? new Date().toISOString() : null;
  }
  if (typeof body.description === "string" && body.description.trim())
    update.description = body.description.trim();

  const newQty = body.quantity !== undefined ? Math.max(1, Math.round(Number(body.quantity))) : undefined;
  const newUnitPrice = body.unit_price !== undefined ? parseFloat(body.unit_price) : undefined;
  const newAmount = body.amount !== undefined ? parseFloat(body.amount) : undefined;

  if (newQty !== undefined) update.quantity = newQty;
  if (newUnitPrice !== undefined && Number.isFinite(newUnitPrice) && newUnitPrice > 0) {
    const qty = newQty ?? 1;
    update.amount = Math.round(newUnitPrice * qty * 100) / 100;
  } else if (newAmount !== undefined && Number.isFinite(newAmount) && newAmount > 0) {
    update.amount = newAmount;
  }

  const { data, error } = await supabase
    .from("debt_items")
    .update(update)
    .eq("id", itemId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("debt_items").delete().eq("id", itemId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
