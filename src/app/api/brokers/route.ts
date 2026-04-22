import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// GET — list all brokers (with optional filters)
// is_visible: seuls les courtiers visibles sont renvoyés (côté public)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category    = searchParams.get('category');
  const accountType = searchParams.get('accountType');
  const isKbar      = searchParams.get('kbar') === '1'; // kbar inclut les brokers cachés

  let query = supabase
    .from('brokers')
    .select('*')
    .order('score_overall', { ascending: false });

  // Filtre visibilité — désactivé pour la kbar (recherche globale)
  if (!isKbar) {
    query = query.eq('is_visible', true);
  }

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  if (accountType && accountType !== 'all') {
    query = query.contains('accounts', [accountType]);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — create a new broker
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase.from('brokers').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}