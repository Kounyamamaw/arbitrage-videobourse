import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("scrape_logs")
    .select("*")
    .order("scraped_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data);
}
