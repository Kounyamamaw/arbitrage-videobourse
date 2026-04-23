import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('brokers')
    .select('id, name, slug, category, website, affiliate_url, tagline, is_partner, demo_url, logo_url, created_at')
    .order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const broker = {
    id: body.slug || body.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
    slug: body.slug || body.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
    name: body.name,
    category: body.category || 'broker',
    website: body.website || '',
    affiliate_url: body.affiliate_url || '',
    tagline: body.tagline || '',
    demo_url: body.demo_url || null,
    is_partner: body.is_partner || false,
    partner_rank: body.is_partner ? 10 : 999,
    deposit_minimum: 0,
    accounts: [],
    score_overall: 0,
    score_fees: 0,
    score_reliability: 0,
    score_ux: 0,
    score_envergure: 0,
    score_support: 0,
    pros: [],
    cons: [],
    fees: {},
    best_for: [],
  };
  const { data, error } = await supabase.from('brokers').insert(broker).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await supabase.from('brokers').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}