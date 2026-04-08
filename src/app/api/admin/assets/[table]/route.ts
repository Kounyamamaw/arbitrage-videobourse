import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const ALLOWED = ['actions', 'options', 'futures', 'cfds', 'forex'];

// Correction : On définit params comme une Promise
export async function GET(
  _req: NextRequest, 
  { params }: { params: Promise<{ table: string }> }
) {
  // On utilise await pour récupérer la valeur de table
  const { table } = await params;

  if (!ALLOWED.includes(table)) {
    return NextResponse.json({ error: 'Table non autorisée' }, { status: 400 });
  }

  const { data, error } = await supabase.from(table).select('*').order('name');
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// Correction identique pour POST
export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ table: string }> }
) {
  // On utilise await ici aussi
  const { table } = await params;

  if (!ALLOWED.includes(table)) {
    return NextResponse.json({ error: 'Table non autorisée' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { data, error } = await supabase.from(table).insert(body).select().single();
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Format JSON invalide' }, { status: 400 });
  }
}