import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("brokers")
    .select("slug, name, website, pricing_url")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { slug, pricing_url } = await req.json();
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  const { error } = await supabase.from("brokers").update({ pricing_url }).eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
