import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Total des 30 derniers jours, groupé par broker
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('affiliate_clicks')
      .select('broker_id, broker_name, source, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    // Si erreur Supabase (table inexistante, RLS, etc.) → on le signale explicitement
    if (error) {
      console.error('affiliate_clicks fetch error:', error);
      return NextResponse.json({ byBroker: [], total: 0, recent: [], tableError: error.message });
    }
    if (!data || data.length === 0) return NextResponse.json({ byBroker: [], total: 0, recent: [], tableExists: true });

    // Agréger par broker
    const counts: Record<string, { broker_id: string; broker_name: string; total: number; sources: Record<string, number> }> = {};
    for (const row of data) {
      if (!counts[row.broker_id]) {
        counts[row.broker_id] = { broker_id: row.broker_id, broker_name: row.broker_name, total: 0, sources: {} };
      }
      counts[row.broker_id].total++;
      counts[row.broker_id].sources[row.source] = (counts[row.broker_id].sources[row.source] || 0) + 1;
    }

    const byBroker = Object.values(counts).sort((a, b) => b.total - a.total);

    return NextResponse.json({
      byBroker,
      total: data.length,
      tableExists: true,
      recent: data.slice(0, 20), // 20 derniers clics pour le feed
    });
  } catch {
    return NextResponse.json({ byBroker: [], total: 0, recent: [], tableError: 'unknown' });
  }
}
