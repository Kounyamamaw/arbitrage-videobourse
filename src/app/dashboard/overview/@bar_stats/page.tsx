import { BarGraph } from '@/features/overview/components/bar-graph';
import { supabaseAdmin as supabase } from '@/lib/supabase';

async function getBrokerScores() {
  try {
    const { data } = await supabase.from('brokers')
      .select('name, slug, score_overall, score_fees')
      .gt('score_overall', 0)
      .order('score_overall', { ascending: false })
      .limit(8);
    if (!data || data.length === 0) throw new Error('empty');
    return data.map(b => ({
      // Nom affiché court mais slug complet pour la redirection
      name: b.name
        .replace('Interactive Brokers', 'IBKR')
        .replace('Bourse Direct', 'B.Direct')
        .replace('Trade Republic', 'Trade Rep.')
        .replace('Saxo Banque', 'Saxo')
        .replace('Pepperstone', 'Pepper.')
        .substring(0, 10),
      slug: b.slug,
      score: Number(b.score_overall),
      frais: Number(b.score_fees),
    }));
  } catch {
    return [
      { name: 'IBKR',       slug: 'interactive-brokers', score: 9.1, frais: 8.5 },
      { name: 'XTB',        slug: 'xtb',                 score: 8.8, frais: 9.2 },
      { name: 'B.Direct',   slug: 'bourse-direct',       score: 8.5, frais: 8.8 },
      { name: 'Trade Rep.', slug: 'trade-republic',      score: 8.7, frais: 9.0 },
    ];
  }
}

export default async function BarStats() {
  const data = await getBrokerScores();
  return <BarGraph data={data} />;
}
