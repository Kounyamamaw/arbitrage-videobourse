import { BarGraph } from '@/features/overview/components/bar-graph';
import { supabase } from '@/lib/supabase';

async function getBrokerScores() {
  try {
    const { data } = await supabase.from('brokers').select('name, score_overall, score_fees')
      .gt('score_overall', 0).order('score_overall', { ascending: false }).limit(8);
    if (!data || data.length === 0) throw new Error('empty');
    return data.map(b => ({
      name: b.name.replace('Interactive Brokers','IBKR').replace('Bourse Direct','B.Direct').replace('Trade Republic','Trade Rep.').substring(0,10),
      score: Number(b.score_overall), frais: Number(b.score_fees),
    }));
  } catch {
    return [
      { name: 'IBKR', score: 9.1, frais: 8.5 }, { name: 'XTB', score: 8.8, frais: 9.2 },
      { name: 'B.Direct', score: 8.5, frais: 8.8 }, { name: 'Trade Rep.', score: 8.7, frais: 9.0 },
    ];
  }
}
export default async function BarStats() {
  const data = await getBrokerScores();
  return <BarGraph data={data} />;
}
