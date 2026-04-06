import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const CHECKED_FIELDS = [
  'name', 'category', 'tagline', 'affiliate_url', 'website',
  'score_overall', 'score_fees', 'score_reliability', 'score_ux', 'score_envergure', 'score_support',
  'fees', 'accounts', 'regulation', 'pros', 'cons',
  'custody_fee', 'currency_fee', 'best_for', 'markets_available',
  'trustpilot_score', 'founded', 'deposit_minimum'
];

export async function GET() {
  if (!supabase) return NextResponse.json([]);

  const { data } = await supabase.from('brokers').select('*').order('name');
  if (!data) return NextResponse.json([]);

  const statuses = data.map((b: Record<string, unknown>) => {
    let filled = 0;
    for (const field of CHECKED_FIELDS) {
      const val = b[field];
      if (val === null || val === undefined || val === '' || val === 0 ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === 'object' && !Array.isArray(val) && Object.keys(val as object).length === 0)) {
        continue;
      }
      filled++;
    }
    return {
      id: b.id, name: b.name, category: b.category,
      score_overall: b.score_overall,
      has_fees: b.fees && Object.keys(b.fees as object).length > 0,
      has_scores: (b.score_overall as number) > 0,
      has_accounts: Array.isArray(b.accounts) && (b.accounts as string[]).length > 0,
      has_affiliate: !!b.affiliate_url,
      has_pros: Array.isArray(b.pros) && (b.pros as string[]).length > 0,
      fields_filled: filled,
      fields_total: CHECKED_FIELDS.length,
      updated_at: b.updated_at,
    };
  });

  return NextResponse.json(statuses);
}
