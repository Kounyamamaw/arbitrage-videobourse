import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('site_content').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Return as key-value object
  const content: Record<string, string> = {};
  for (const row of data || []) {
    content[row.key] = row.value;
  }
  return NextResponse.json(content);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json(); // { key: "hero_title", value: "New title" }
  const { error } = await supabase.from('site_content').upsert({
    key: body.key,
    value: body.value,
    description: body.description,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
