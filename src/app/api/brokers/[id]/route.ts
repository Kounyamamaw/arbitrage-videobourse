import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// GET single broker
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase.from('brokers').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH — update broker by slug
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // id param contains the slug
  const body = await req.json();
  // Try by slug first (most common case from admin), fallback to id
  const { data, error } = await supabase.from('brokers').update(body).eq('slug', id).select().single();
  if (error) {
    // Fallback: try by id column
    const { data: d2, error: e2 } = await supabase.from('brokers').update(body).eq('id', id).select().single();
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    return NextResponse.json(d2);
  }
  return NextResponse.json(data);
}

// DELETE — remove broker
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabase.from('brokers').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
