import { ETFPageClient } from '@/features/etf/components/ETFPageClient';

import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Comparateur ETF — TER, éligibilité PEA, tracking différence | Arbitrage by VideoBourse',
  description: 'Comparez les meilleurs ETF : TER, tracking différence, éligibilité PEA/assurance-vie. Trouvez le combo courtier × ETF optimal pour maximiser votre rendement net.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://videobourse.fr/comparatif/dashboard/etf' },
};

export default function ETFPage() {
  return <ETFPageClient />;
}