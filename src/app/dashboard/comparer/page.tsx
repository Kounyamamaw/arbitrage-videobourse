import PageContainer from '@/components/layout/page-container';
import { CompareWizard } from '@/features/comparer/components/CompareWizard';

import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Simulateur frais courtier & calcul FIRE/DCA — Arbitrage by VideoBourse',
  description: 'Calculez le coût réel de votre courtier sur 10, 20 ou 30 ans. Comparez l\'impact des frais sur votre capital FIRE et optimisez votre stratégie DCA.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://videobourse.fr/comparatif/dashboard/comparer' },
};

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