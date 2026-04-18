import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Champs connus de la table brokers (ceux que PostgREST expose)
const SCALAR_COLS = new Set([
  'name','slug','category','website','affiliate_url','tagline',
  'demo_url','is_partner','partner_rank','logo_url',
  'score_overall','score_fees','score_reliability','score_ux',
  'score_envergure','score_support',
  'founded','deposit_minimum','trustpilot_score','trustpilot_count',
  'custody_fee','custody_fee_details','inactivity_fee','inactivity_fee_details','currency_fee','currency_fee_details',
  'welcome_offer','level','is_foreign','provides_ifu','has_dca','has_fractions',
  'withdrawal_fee','deposit_fee','dividend_fee','ost_fee',
  'account_opening_fee','account_closing_fee','transfer_out_fee','etf_count','pea_max_deposit',
  'is_visible',   // ← ajouté
]);
const ARRAY_COLS = new Set([
  'categories','pros','cons','best_for','accounts','regulation',
  'asset_classes','platforms','markets_available','order_types',
]);
const JSON_COLS = new Set(['fees']);

// GET — par slug puis par id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let { data, error } = await supabase.from('brokers').select('*').eq('slug', id).single();
  if (!data) {
    const r2 = await supabase.from('brokers').select('*').eq('id', id).single();
    data = r2.data; error = r2.error;
  }
  if (!data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH — filtre strict + pas de base64
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (k === 'logo_url' && typeof v === 'string' && v.startsWith('data:')) continue;
    if (SCALAR_COLS.has(k)) { clean[k] = v; continue; }
    if (ARRAY_COLS.has(k)) { clean[k] = Array.isArray(v) ? v : []; continue; }
    if (JSON_COLS.has(k)) { clean[k] = v; continue; }
  }

  if (Object.keys(clean).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  let { data, error } = await sb.from('brokers').update(clean).eq('slug', id).select().single();
  if (!data) {
    const r2 = await sb.from('brokers').update(clean).eq('id', id).select().single();
    data = r2.data; error = r2.error;
  }
  if (!data) return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabase.from('brokers').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}