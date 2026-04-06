import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import brokersData from '@/data/brokers.json';
import { Broker, rankBrokers, estimateAnnualFees } from '@/lib/brokers';
import { BrokerCard } from '@/features/courtiers/components/BrokerCard';
import Link from 'next/link';
import { IconChevronLeft } from '@tabler/icons-react';

const brokers = brokersData as unknown as Broker[];

function ResultsContent({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const accountType = searchParams.accountType || 'PEA';
  const market = searchParams.market || 'FR';
  const orderAmount = Number(searchParams.orderAmount) || 300;
  const ordersPerMonth = Number(searchParams.ordersPerMonth) || 4;

  const ranked = rankBrokers(brokers, {
    accountType, profile: searchParams.profile || '',
    market, orderAmount, ordersPerMonth, depositMin: 10000
  });

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-6">
        <Link href="/dashboard/comparer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <IconChevronLeft className="size-4" /> Modifier la configuration
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">
          Résultats — {accountType} · {market} · {orderAmount}€/ordre
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ranked.map((broker, i) => (
            <BrokerCard
              key={broker.id} broker={broker} rank={i + 1}
              showFeeEstimate orderAmount={orderAmount}
              ordersPerMonth={ordersPerMonth} market={market}
            />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

export default async function ResultsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <Suspense fallback={
      <PageContainer><div className="flex h-64 items-center justify-center text-muted-foreground">Calcul en cours…</div></PageContainer>
    }>
      <ResultsContent searchParams={sp} />
    </Suspense>
  );
}
