import PageContainer from '@/components/layout/page-container';
import { BrokerGrid } from '@/features/courtiers/components/BrokerGrid';
import { BrokerFilters } from '@/features/courtiers/components/BrokerFilters';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comparateur courtiers bourse, néobanques & brokers France 2025 | Arbitrage by VideoBourse',
  description: 'Comparez les meilleurs courtiers bourse, néobanques, brokers CFD Forex et plateformes crypto en France. Frais, commissions, avis Trustpilot et scores sur plus de 40 intermédiaires financiers.',
  keywords: [
    'comparateur courtier bourse france',
    'meilleur courtier bourse',
    'frais courtage comparatif',
    'comparateur broker cfd forex',
    'meilleure neobanque france',
    'comparateur plateforme crypto france',
    'frais interactive brokers',
    'frais fortuneo',
    'frais degiro',
    'frais trade republic',
    'comparateur assurance vie',
    'arbitrage videobourse',
  ],
  openGraph: {
    type: 'website',
    title: 'Comparateur courtiers bourse, néobanques & brokers France | Arbitrage by VideoBourse',
    description: 'Comparez les meilleurs courtiers bourse, néobanques, brokers CFD et plateformes crypto en France. Frais, scores et avis sur 40+ intermédiaires.',
    url: 'https://comparatif.videobourse.fr/dashboard/courtiers',
    images: [{ url: 'https://framerusercontent.com/images/cB9wgyzc0EYXTdSFxeCpMyXx7zg.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparateur courtiers bourse, néobanques & brokers France | Arbitrage by VideoBourse',
    description: 'Comparez 40+ courtiers, néobanques et brokers CFD en France.',
    images: ['https://framerusercontent.com/images/cB9wgyzc0EYXTdSFxeCpMyXx7zg.png'],
  },
  alternates: {
    canonical: 'https://comparatif.videobourse.fr/dashboard/courtiers',
  },
};

export default function CourtiersPage() {
  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Intermédiaires</h2>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row w-full overflow-hidden">
          <BrokerFilters />
          <BrokerGrid />
        </div>
      </div>
    </PageContainer>
  );
}