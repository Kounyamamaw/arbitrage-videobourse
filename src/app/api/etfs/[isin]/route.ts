import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ isin: string }> }
) {
  const { isin } = await params;
  const body = await req.json();
  const { data, error } = await supabase.from('etfs').update(body).eq('isin', isin).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ isin: string }> }
) {
  const { isin } = await params;
  const { error } = await supabase.from('etfs').delete().eq('isin', isin);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
