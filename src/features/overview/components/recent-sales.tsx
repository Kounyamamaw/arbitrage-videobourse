import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

async function getTopBrokers() {
  try {
    const { data } = await supabase
      .from('brokers')
      .select('name, slug, tagline, score_overall, affiliate_url')
      .gt('score_overall', 0)
      .order('score_overall', { ascending: false })
      .limit(5);
    if (data && data.length > 0) return data;
  } catch { /* fallback */ }
  return [
    { name: 'Interactive Brokers', slug: 'interactive-brokers', tagline: 'PEA + CTO mondial', score_overall: 9.1, affiliate_url: null },
    { name: 'XTB', slug: 'xtb', tagline: '0% actions et ETF', score_overall: 8.8, affiliate_url: null },
    { name: 'Trade Republic', slug: 'trade-republic', tagline: '1€ par ordre', score_overall: 8.7, affiliate_url: null },
    { name: 'Bourse Direct', slug: 'bourse-direct', tagline: 'Frais les plus bas FR', score_overall: 8.5, affiliate_url: null },
    { name: 'Fortuneo', slug: 'fortuneo', tagline: 'Meilleur compromis', score_overall: 8.4, affiliate_url: null },
  ];
}

export async function RecentSales() {
  const brokers = await getTopBrokers();
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Top courtiers</CardTitle>
        <CardDescription>Les mieux notés — cliquer pour ouvrir un compte</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-5'>
          {brokers.map((broker) => (
            <a key={broker.slug} href={broker.affiliate_url || `/go/${broker.slug}`}
              target='_blank' rel='noopener noreferrer'
              className='flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60 group'>
              <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary group-hover:bg-primary/20 transition-colors'>
                {broker.name.slice(0, 2).toUpperCase()}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium leading-none truncate group-hover:text-primary transition-colors'>{broker.name}</p>
                <p className='text-xs text-muted-foreground mt-0.5 truncate'>{broker.tagline || '—'}</p>
              </div>
              <div className='font-semibold text-primary text-sm shrink-0'>{Number(broker.score_overall).toFixed(1)}/10</div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
