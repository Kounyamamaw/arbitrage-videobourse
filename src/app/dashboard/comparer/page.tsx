import PageContainer from '@/components/layout/page-container';
import { CompareWizard } from '@/features/comparer/components/CompareWizard';

export const metadata = { title: 'Comparer — ArbitrAge' };

export default function ComparerPage() {
  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Simulation personnalisée</h2>
        <CompareWizard />
      </div>
    </PageContainer>
  );
}
