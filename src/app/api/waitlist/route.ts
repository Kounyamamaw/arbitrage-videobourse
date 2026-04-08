import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  // Check if already subscribed
  const { data: existing } = await supabase
    .from("waitlist")
    .select("email")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (existing) {
    return NextResponse.json({ error: "Vous êtes déjà inscrit !" }, { status: 409 });
  }

  const { error } = await supabase.from("waitlist").insert({
    email: email.toLowerCase().trim(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
