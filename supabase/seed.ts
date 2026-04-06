// Run this once to seed Supabase from JSON files:
// npx tsx supabase/seed.ts

import { createClient } from '@supabase/supabase-js';
import brokers from '../src/data/brokers.json';
import etfs from '../src/data/etfs.json';
import issuers from '../src/data/issuers.json';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function seed() {
  console.log('Seeding brokers...');
  for (const b of brokers as Record<string, unknown>[]) {
    const { error } = await supabase.from('brokers').upsert({
      id: b.id,
      slug: b.slug,
      name: b.name,
      category: b.category,
      website: b.website || null,
      logo: b.logo,
      logo_color: (b as Record<string, unknown>).logoColor,
      tagline: b.tagline,
      deposit_minimum: b.deposit_minimum,
      accounts: b.accounts,
      founded: b.founded,
      country: b.country,
      regulation: b.regulation,
      trustpilot_score: b.trustpilot_score,
      trustpilot_count: b.trustpilot_count,
      affiliate_url: b.affiliate_url,
      score_overall: b.score_overall,
      score_fees: b.score_fees,
      score_reliability: b.score_reliability,
      score_ux: b.score_ux,
      pros: b.pros,
      cons: b.cons,
      fees: b.fees,
      custody_fee: b.custody_fee || 0,
      custody_fee_details: b.custody_fee_details,
      inactivity_fee: b.inactivity_fee || 0,
      inactivity_fee_details: b.inactivity_fee_details,
      currency_fee: b.currency_fee || 0,
      currency_fee_details: b.currency_fee_details,
      withdrawal_fee: b.withdrawal_fee || 0,
      deposit_fee: b.deposit_fee || 0,
      dividend_fee: b.dividend_fee,
      ost_fee: b.ost_fee,
      account_opening_fee: b.account_opening_fee || 0,
      account_closing_fee: b.account_closing_fee || 0,
      transfer_out_fee: b.transfer_out_fee,
      order_types: b.order_types || [],
      markets_available: b.markets_available || [],
      etf_count: b.etf_count || 0,
      welcome_offer: b.welcome_offer,
      pea_max_deposit: b.pea_max_deposit,
      best_for: b.best_for || [],
    });
    if (error) console.error(`  Error ${b.name}:`, error.message);
    else console.log(`  ✓ ${b.name}`);
  }

  console.log('Seeding ETFs...');
  for (const e of etfs as Record<string, unknown>[]) {
    const { error } = await supabase.from('etfs').upsert({
      isin: e.isin,
      ticker: e.ticker,
      name: e.name,
      issuer: e.issuer,
      index_name: e.index,
      index_slug: e.index_slug,
      ter: e.ter,
      aum_bn: e.aum_bn,
      replication: e.replication,
      hedged: e.hedged,
      currency: e.currency,
      pea_eligible: e.pea_eligible,
      domicile: e.domicile,
      dividend: e.dividend,
      inception_year: e.inception_year,
      description: e.description,
      available_at: e.available_at,
    });
    if (error) console.error(`  Error ${e.ticker}:`, error.message);
    else console.log(`  ✓ ${e.ticker}`);
  }

  console.log('Seeding issuers...');
  for (const i of issuers as Record<string, unknown>[]) {
    const { error } = await supabase.from('issuers').upsert({
      id: i.id,
      name: i.name,
      country: i.country,
      aum_total_bn: i.aum_total_bn,
      founded: i.founded,
      logo_domain: i.logo_domain,
      description: i.description,
      strengths: i.strengths,
      etf_count: i.etf_count,
      known_for: i.known_for,
    });
    if (error) console.error(`  Error ${i.name}:`, error.message);
    else console.log(`  ✓ ${i.name}`);
  }

  console.log('Done!');
}

seed();
