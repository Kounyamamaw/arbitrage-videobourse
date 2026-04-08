import { AreaGraph } from '@/features/overview/components/area-graph';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// On définit une interface propre pour éviter le "typeof data[0]" qui fait planter le build
interface BrokerData {
  score_overall: any;
  score_fees: any;
  score_ux: any;
  score_reliability: any;
  score_envergure: any;
  score_support: any;
  trustpilot_score: any;
  fees: any;
  pros: any;
  cons: any;
}

async function getDataQuality() {
  try {
    const { data } = await supabase
      .from('brokers')
      .select('score_overall,score_fees,score_ux,score_reliability,score_envergure,score_support,trustpilot_score,fees,pros,cons');

    // On vérifie si data existe et n'est pas vide
    if (!data || data.length === 0) throw new Error('empty');

    const n = data.length;

    // Correction : on utilise l'interface BrokerData ici
    const pct = (fn: (b: BrokerData) => boolean) => 
      Math.round((data.filter(fn as any).length / n) * 100);

    return [
      { subject: 'Score global',    value: pct(b => Number(b.score_overall) > 0) },
      { subject: 'Score frais',     value: pct(b => Number(b.score_fees) > 0) },
      { subject: 'Interface',       value: pct(b => Number(b.score_ux) > 0) },
      { subject: 'Fiabilité',       value: pct(b => Number(b.score_reliability) > 0) },
      { subject: 'Envergure',       value: pct(b => Number(b.score_envergure) > 0) },
      { subject: 'Support',         value: pct(b => Number(b.score_support) > 0) },
      { subject: 'Trustpilot',      value: pct(b => Number(b.trustpilot_score) > 0) },
      { subject: 'Frais détaillés', value: pct(b => !!b.fees && Object.keys(b.fees as object).length > 0) },
      { subject: 'Pros/Cons',       value: pct(b => Array.isArray(b.pros) && (b.pros as unknown[]).length > 0) },
    ];
  } catch {
    // Données de secours si la DB est vide ou inaccessible
    return [
      { subject: 'Score global', value: 85 }, 
      { subject: 'Score frais', value: 70 },
      { subject: 'Interface', value: 75 }, 
      { subject: 'Fiabilité', value: 80 },
      { subject: 'Trustpilot', value: 60 }, 
      { subject: 'Frais détaillés', value: 55 },
      { subject: 'Pros/Cons', value: 65 },
    ];
  }
}

export default async function AreaStats() {
  const data = await getDataQuality();
  return <AreaGraph data={data} />;
}