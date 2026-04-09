import PageContainer from '@/components/layout/page-container';
import { BrokerGrid } from '@/features/courtiers/components/BrokerGrid';
import { BrokerFilters } from '@/features/courtiers/components/BrokerFilters';

export const metadata = { title: 'Intermédiaires — ArbitrAge' };

export default function CourtiersPage() {
  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Intermédiaires</h2>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <BrokerFilters />
          <BrokerGrid />
        </div>
      </div>
    </PageContainer>
  );
}
