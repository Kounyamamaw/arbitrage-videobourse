import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from '@/components/ui/card';
import { IconTrendingUp } from '@tabler/icons-react';
import React from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';

async function getStats() {
  try {
    const { count: brokerCount } = await supabase
      .from('brokers')
      .select('*', { count: 'exact', head: true });
    return { brokerCount: brokerCount ?? 12 };
  } catch {
    return { brokerCount: 12 };
  }
}

export default async function OverViewLayout({ sales, pie_stats, bar_stats, area_stats }: {
  sales: React.ReactNode; pie_stats: React.ReactNode; bar_stats: React.ReactNode; area_stats: React.ReactNode;
}) {
  const { brokerCount } = await getStats();
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center gap-3'>
          <h2 className='text-2xl font-bold tracking-tight'>Arbitrage — Vue d&apos;ensemble</h2>
          <span className='rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'>Bêta</span>
        </div>

        {/* 3 cartes — ETF supprimée temporairement */}
        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-3'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Intermédiaires analysés</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>{brokerCount}</CardTitle>
              <CardAction><Badge variant='outline'><IconTrendingUp />Mis à jour</Badge></CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>Courtiers, banques, néobanques, crypto <IconTrendingUp className='size-4' /></div>
              <div className='text-muted-foreground'>Données enrichies en continu</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Audience VideoBourse</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>90 000+</CardTitle>
              <CardAction><Badge variant='outline'><IconTrendingUp />Qualifiée</Badge></CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>Investisseurs particuliers et pro <IconTrendingUp className='size-4' /></div>
              <div className='text-muted-foreground'>18 ans de légitimité</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Indépendance</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>100%</CardTitle>
              <CardAction><Badge variant='outline'><IconTrendingUp />Toujours</Badge></CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>Zéro conflit d&apos;intérêt <IconTrendingUp className='size-4' /></div>
              <div className='text-muted-foreground'>Données objectives</div>
            </CardFooter>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3 flex flex-col'>{sales}</div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
