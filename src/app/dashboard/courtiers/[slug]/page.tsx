import PageContainer from '@/components/layout/page-container';
import { supabase } from '@/lib/supabase';
import { Broker } from '@/lib/brokers';
import { BrokerDetailClient } from '@/features/courtiers/components/BrokerDetailClient';
import { notFound } from 'next/navigation';

// Dynamic page — no generateStaticParams, fetches from Supabase at request time
export const dynamic = 'force-dynamic';

export default async function BrokerDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch this broker from Supabase
  let broker: Broker | null = null;
  let allBrokers: Broker[] = [];

  if (supabase) {
    const { data } = await supabase.from('brokers').select('*').eq('slug', slug).single();
    if (data) {
      broker = data as unknown as Broker;
    }
    const { data: all } = await supabase.from('brokers').select('*').order('score_overall', { ascending: false });
    if (all) {
      allBrokers = all as unknown as Broker[];
    }
  }

  // Fallback to static JSON if Supabase fails
  if (!broker) {
    try {
      const brokersData = (await import('@/data/brokers.json')).default;
      const all = brokersData as unknown as Broker[];
      broker = all.find((b) => b.slug === slug) || null;
      allBrokers = all;
    } catch {
      // noop
    }
  }

  if (!broker) notFound();

  return (
    <PageContainer scrollable>
      <BrokerDetailClient broker={broker} allBrokers={allBrokers} />
    </PageContainer>
  );
}
