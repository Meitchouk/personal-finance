import { createClient } from "@/lib/supabase/server";
import { buildTransactionPayload } from "@/lib/transactions-payload";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const category_id = searchParams.get("category_id");
  const date_from = searchParams.get("date_from");
  const date_to = searchParams.get("date_to");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  let query = supabase
    .from("transactions")
    .select("*, categories(*), accounts(*)", { count: "exact" })
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type && type !== "all") query = query.eq("type", type);
  if (category_id) query = query.eq("category_id", category_id);
  if (date_from) query = query.gte("date", date_from);
  if (date_to) query = query.lte("date", date_to);
  if (search) query = query.ilike("description", `%${search}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  let payload;
  try {
    payload = await buildTransactionPayload(supabase, body);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Datos inválidos" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({ ...payload, user_id: user.id })
    .select("*, categories(*), accounts(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
