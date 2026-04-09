import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type ClickRow = {
  broker_id: string;
  broker_name: string;
  source: string;
  created_at: string;
};

type AggregatedBroker = {
  broker_id: string;
  broker_name: string;
  total: number;
  sources: Record<string, number>;
};

function aggregate(rows: ClickRow[]): AggregatedBroker[] {
  const counts: Record<string, AggregatedBroker> = {};
  for (const row of rows) {
    if (!counts[row.broker_id]) {
      counts[row.broker_id] = { broker_id: row.broker_id, broker_name: row.broker_name, total: 0, sources: {} };
    }
    counts[row.broker_id].total++;
    counts[row.broker_id].sources[row.source] = (counts[row.broker_id].sources[row.source] || 0) + 1;
  }
  return Object.values(counts).sort((a, b) => b.total - a.total);
}

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabaseAdmin
      .from('affiliate_clicks')
      .select('broker_id, broker_name, source, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({
        affiliate: { byBroker: [], total: 0, recent: [] },
        demo:      { byBroker: [], total: 0, recent: [] },
        tableExists: true,
      });
    }

    // Séparer clics affiliés (source ne commence pas par 'demo') et démo (commence par 'demo')
    const affiliateRows = data.filter((r) => !r.source.startsWith('demo'));
    const demoRows      = data.filter((r) =>  r.source.startsWith('demo'));

    return NextResponse.json({
      tableExists: true,
      affiliate: {
        byBroker: aggregate(affiliateRows),
        total:    affiliateRows.length,
        recent:   affiliateRows.slice(0, 20),
      },
      demo: {
        byBroker: aggregate(demoRows),
        total:    demoRows.length,
        recent:   demoRows.slice(0, 20),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      affiliate: { byBroker: [], total: 0, recent: [] },
      demo:      { byBroker: [], total: 0, recent: [] },
      tableError: msg,
    });
  }
}
