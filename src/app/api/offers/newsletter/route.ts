import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// GET — liste des inscrits (admin)
export async function GET() {
  const { data, error } = await supabase
    .from('offers_newsletter')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data);
}

// POST — inscription newsletter
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  const clean = email.toLowerCase().trim();

  // Déjà inscrit ?
  const { data: existing } = await supabase
    .from('offers_newsletter')
    .select('email')
    .eq('email', clean)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Vous êtes déjà inscrit !' }, { status: 409 });
  }

  const { error } = await supabase
    .from('offers_newsletter')
    .insert({ email: clean });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE — supprimer un inscrit
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await supabase
    .from('offers_newsletter')
    .delete()
    .eq('id', Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}