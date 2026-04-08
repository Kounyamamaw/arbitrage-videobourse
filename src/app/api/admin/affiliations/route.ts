import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('brokers')
    .select('id, name, category, affiliate_url')
    .order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { id, affiliate_url } = await req.json();
  if (!id || !affiliate_url) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }
  const { error } = await supabase.from('brokers').update({ affiliate_url }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
