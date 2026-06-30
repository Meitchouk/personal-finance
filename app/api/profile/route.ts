import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return NextResponse.json({ data });
}

const ALLOWED_FIELDS = ["display_name", "currency", "google_sheet_id", "google_sheet_name"] as const;

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const patch: Record<string, unknown> = { id: user.id };
  for (const field of ALLOWED_FIELDS) {
    if (field in body) patch[field] = body[field];
  }
  if (patch.currency && patch.currency !== "NIO" && patch.currency !== "USD") {
    return NextResponse.json({ error: "Moneda inválida" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(patch)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
