import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const ALLOWED = ['actions', 'options', 'futures', 'cfds', 'forex'];

// Correction : params est maintenant une Promise dans Next.js 16
export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  // On doit utiliser 'await' pour extraire les valeurs
  const { table, id } = await params;

  if (!ALLOWED.includes(table)) {
    return NextResponse.json({ error: 'Table non autorisée' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from(table)
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

// Correction identique pour DELETE
export async function DELETE(
  _req: NextRequest, 
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  // On doit aussi utiliser 'await' ici
  const { table, id } = await params;

  if (!ALLOWED.includes(table)) {
    return NextResponse.json({ error: 'Table non autorisée' }, { status: 400 });
  }

  const { error } = await supabase.from(table).delete().eq('id', id);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}