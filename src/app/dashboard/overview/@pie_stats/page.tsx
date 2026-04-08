import { PieGraph } from '@/features/overview/components/pie-graph';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const CAT_LABELS: Record<string, string> = {
  broker: 'Courtiers', bank: 'Banques', neobanque: 'Néobanques',
  insurance: 'Assurances', crypto: 'Crypto', cfd: 'CFD', scpi: 'SCPI',
};

async function getCategoryData() {
  try {
    const { data } = await supabase.from('brokers').select('category');
    if (!data || data.length === 0) throw new Error('empty');
    const counts: Record<string, number> = {};
    data.forEach(b => { counts[b.category] = (counts[b.category] || 0) + 1; });
    return Object.entries(counts).map(([cat, count]) => ({ category: CAT_LABELS[cat] || cat, count }));
  } catch {
    return [
      { category: 'Courtiers', count: 6 }, { category: 'Néobanques', count: 2 },
      { category: 'Banques', count: 2 }, { category: 'Crypto', count: 2 }, { category: 'CFD', count: 1 },
    ];
  }
}

export default async function PieStats() {
  const data = await getCategoryData();
  return <PieGraph data={data} />;
}
