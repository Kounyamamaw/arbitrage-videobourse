import PageContainer from '@/components/layout/page-container';
import { ConseillerIAClient } from '@/features/conseiller-ia/components/ConseillerIAClient';

import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Conseiller IA financier gratuit — Questions bourse, courtiers, ETF | Arbitrage',
  description: 'Posez vos questions financières à notre IA spécialisée : frais de courtier, choix d\'ETF, stratégie DCA, fiscalité PEA. Réponses sourées sur données vérifiées.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://videobourse.fr/comparatif/dashboard/conseiller-ia' },
};

export default function ConseillerIAPage() {
  return (
    <PageContainer>
      <ConseillerIAClient />
    </PageContainer>
  );
}