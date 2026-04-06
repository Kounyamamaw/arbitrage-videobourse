import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "videobourse2025";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  
  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
}
