import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET — offres publiques (is_active=true) ou toutes pour l'admin (?admin=1)
export async function GET(req: NextRequest) {
  const isAdmin = new URL(req.url).searchParams.get('admin') === '1';

  let query = supabaseAdmin
    .from('exclusive_offers')
    .select('*')
    .order('sort_order', { ascending: true });

  if (!isAdmin) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — créer une offre (admin)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from('exclusive_offers')
    .insert({
      broker_slug:     body.broker_slug,
      broker_name:     body.broker_name,
      broker_logo:     body.broker_logo || null,
      broker_category: body.broker_category || null,
      title:           body.title,
      description:     body.description,
      cta_label:       body.cta_label || "Voir l'offre",
      cta_url:         body.cta_url,
      badge:           body.badge || null,
      is_active:       body.is_active ?? true,
      cta_enabled:     body.cta_enabled ?? true,
      expires_at:      body.expires_at || null,
      sort_order:      body.sort_order ?? 999,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
