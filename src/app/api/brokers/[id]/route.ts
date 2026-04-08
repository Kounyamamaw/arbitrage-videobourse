import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Colonnes autorisées pour le PATCH — correspondant exactement au schéma réel
const ALLOWED_PATCH_COLUMNS = new Set([
  'name', 'slug', 'category', 'categories', 'website', 'affiliate_url',
  'tagline', 'demo_url', 'is_partner', 'partner_rank',
  // logo_url intentionnellement EXCLU ici — géré séparément via upload
  'score_overall', 'score_fees', 'score_reliability', 'score_ux',
  'score_envergure', 'score_support',
  'founded', 'deposit_minimum', 'trustpilot_score', 'trustpilot_count',
  'custody_fee', 'inactivity_fee', 'currency_fee',
  'welcome_offer', 'pros', 'cons', 'best_for', 'accounts', 'regulation',
  'level', 'is_foreign', 'provides_ifu', 'has_dca', 'has_fractions',
  'asset_classes', 'platforms', 'markets_available',
  'withdrawal_fee', 'deposit_fee', 'dividend_fee', 'ost_fee',
  'account_opening_fee', 'account_closing_fee', 'transfer_out_fee',
  'order_types', 'etf_count', 'pea_max_deposit',
]);

// GET single broker — cherche par slug en priorité, fallback id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Essai par slug d'abord
  let { data, error } = await supabase
    .from('brokers')
    .select('*')
    .eq('slug', id)
    .single();

  // Si pas trouvé par slug, essai par id (uuid)
  if (error || !data) {
    const res2 = await supabase
      .from('brokers')
      .select('*')
      .eq('id', id)
      .single();
    data = res2.data;
    error = res2.error;
  }

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

// PATCH — met à jour un broker, filtre les colonnes inconnues et le logo base64
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  // Filtrer : garder seulement les colonnes connues
  // ET exclure logo_url si c'est une data URL base64 (trop volumineuse)
  const cleanBody: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_PATCH_COLUMNS.has(key)) continue;
    // Ignorer logo_url base64 dans le PATCH — l'upload se fait séparément
    if (key === 'logo_url' && typeof value === 'string' && value.startsWith('data:')) continue;
    cleanBody[key] = value;
  }

  if (Object.keys(cleanBody).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  // Essai par slug
  const { data, error } = await supabase
    .from('brokers')
    .update(cleanBody)
    .eq('slug', id)
    .select()
    .single();

  if (error || !data) {
    // Fallback par id
    const { data: d2, error: e2 } = await supabase
      .from('brokers')
      .update(cleanBody)
      .eq('id', id)
      .select()
      .single();
    if (e2 || !d2) {
      return NextResponse.json({ error: e2?.message ?? 'Update failed' }, { status: 500 });
    }
    return NextResponse.json(d2);
  }

  return NextResponse.json(data);
}

// DELETE — supprime un broker par id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabase.from('brokers').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
