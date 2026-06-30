import { createClient } from "@/lib/supabase/server";
import { buildTransactionPayload } from "@/lib/transactions-payload";
import { NextResponse } from "next/server";

async function createTx(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: { amount: number; account_id?: string; category_id?: string; date: string; description: string; currency?: string }
) {
  try {
    const payload = await buildTransactionPayload(supabase, {
      original_amount: body.amount,
      original_currency: body.currency ?? "NIO",
      type: "expense",
      description: body.description,
      category_id: body.category_id || null,
      account_id: body.account_id || null,
      date: body.date,
      is_recurring: false,
      recurrence_rule: null,
    });
    await supabase.from("transactions").insert({ ...payload, user_id: userId });
  } catch {}
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const now = new Date().toISOString();
  const date = body.date ?? now.slice(0, 10);

  // ── settle: mark ALL unpaid items as paid ──────────────────────────────────
  if (body.action === "settle") {
    const { data: items } = await supabase
      .from("debt_items").select("id, amount, description").eq("debt_id", id).eq("is_paid", false);
    const unpaid = items ?? [];
    if (!unpaid.length) return NextResponse.json({ error: "No hay items pendientes" }, { status: 400 });

    const total = unpaid.reduce((s, i) => s + Number(i.amount), 0);

    await supabase.from("debt_items").update({ is_paid: true, paid_at: now })
      .in("id", unpaid.map((i) => i.id));

    const { data: debt } = await supabase.from("debts").select("creditor_name").eq("id", id).single();
    await createTx(supabase, user.id, {
      amount: total, account_id: body.account_id, category_id: body.category_id,
      date, description: body.description ?? `Pago a ${debt?.creditor_name ?? "deuda"}`,
      currency: body.currency,
    });

    return NextResponse.json({ ok: true, total });
  }

  // ── settle_items: mark SPECIFIC items as paid ──────────────────────────────
  if (body.action === "settle_items") {
    const itemIds: string[] = body.item_ids ?? [];
    if (!itemIds.length) return NextResponse.json({ error: "Selecciona al menos un artículo" }, { status: 400 });

    const { data: items } = await supabase
      .from("debt_items").select("id, amount").in("id", itemIds);
    const found = items ?? [];
    const total = found.reduce((s, i) => s + Number(i.amount), 0);

    await supabase.from("debt_items").update({ is_paid: true, paid_at: now }).in("id", itemIds);

    const { data: debt } = await supabase.from("debts").select("creditor_name").eq("id", id).single();
    await createTx(supabase, user.id, {
      amount: total, account_id: body.account_id, category_id: body.category_id,
      date, description: body.description ?? `Pago parcial a ${debt?.creditor_name ?? "deuda"}`,
      currency: body.currency,
    });

    return NextResponse.json({ ok: true, total });
  }

  // ── settle_partial: abono — mark all paid, create "Restante a pagar" item ──
  if (body.action === "settle_partial") {
    const paidAmount = Number(body.paid_amount);
    if (!paidAmount || paidAmount <= 0) return NextResponse.json({ error: "Monto inválido" }, { status: 400 });

    const { data: items } = await supabase
      .from("debt_items").select("id, amount").eq("debt_id", id).eq("is_paid", false);
    const unpaid = items ?? [];
    if (!unpaid.length) return NextResponse.json({ error: "No hay items pendientes" }, { status: 400 });

    const total = unpaid.reduce((s, i) => s + Number(i.amount), 0);
    const remainder = Math.round((total - paidAmount) * 100) / 100;

    await supabase.from("debt_items").update({ is_paid: true, paid_at: now })
      .in("id", unpaid.map((i) => i.id));

    if (remainder > 0.01) {
      await supabase.from("debt_items").insert({
        debt_id: id, description: "Restante a pagar",
        amount: remainder, item_date: date, is_paid: false,
      });
    }

    const { data: debt } = await supabase.from("debts").select("creditor_name").eq("id", id).single();
    await createTx(supabase, user.id, {
      amount: paidAmount, account_id: body.account_id, category_id: body.category_id,
      date, description: body.description ?? `Abono a ${debt?.creditor_name ?? "deuda"}`,
      currency: body.currency,
    });

    return NextResponse.json({ ok: true, total: paidAmount, remainder });
  }

  // ── regular metadata update ───────────────────────────────────────────────
  const allowed: Record<string, unknown> = {};
  if (typeof body.creditor_name === "string" && body.creditor_name.trim())
    allowed.creditor_name = body.creditor_name.trim();
  if ("notes" in body) allowed.notes = body.notes?.trim() || null;
  if ("account_id" in body) allowed.account_id = body.account_id || null;
  if ("is_saved" in body) allowed.is_saved = !!body.is_saved;

  const { data, error } = await supabase
    .from("debts").update(allowed).eq("id", id).eq("user_id", user.id)
    .select("*, accounts(*), debt_items(*), debt_products(*)").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("debts").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
