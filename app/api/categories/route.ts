import { createClient } from "@/lib/supabase/server";
import { buildCategoryPayload } from "@/lib/category-payload";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (data.length > 0) return NextResponse.json({ data });

  const { data: seeded, error: seedError } = await supabase
    .from("categories")
    .insert(DEFAULT_CATEGORIES.map((category) => ({ ...category, user_id: user.id })))
    .select("*")
    .order("name");

  if (seedError) {
    return NextResponse.json({ error: seedError.message }, { status: 500 });
  }

  return NextResponse.json({ data: seeded ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const payload = buildCategoryPayload(body);
  if (!payload.name) {
    return NextResponse.json({ error: "Escribe un nombre" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
