'use client';
import { navItems } from '@/config/nav-config';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';

// Static ETF data for search (loaded once)
const ETF_SEARCH = [
  { ticker: 'CW8', name: 'Amundi MSCI World', isin: 'LU1681043599' },
  { ticker: 'IWDA', name: 'iShares Core MSCI World', isin: 'IE00B4L5Y983' },
  { ticker: 'VWCE', name: 'Vanguard FTSE All-World', isin: 'IE00BK5BQT80' },
  { ticker: 'PE500', name: 'Amundi S&P 500', isin: 'FR0011871128' },
  { ticker: 'CSPX', name: 'iShares Core S&P 500', isin: 'IE00B5BMR087' },
  { ticker: 'PANX', name: 'Amundi Nasdaq-100', isin: 'LU1681038599' },
  { ticker: 'EQQQ', name: 'Invesco Nasdaq-100', isin: 'IE00BFZXGZ54' },
  { ticker: 'PAEEM', name: 'Amundi MSCI Emerging Markets', isin: 'LU1681045370' },
  { ticker: 'VGEU', name: 'Vanguard FTSE Dev. Europe', isin: 'IE00BKX55S42' },
  { ticker: 'AGGH', name: 'iShares Global Aggregate Bond', isin: 'IE00BDBRDM35' },
];

const BROKER_SEARCH = [
  { slug: 'bourse-direct', name: 'Bourse Direct' },
  { slug: 'fortuneo', name: 'Fortuneo' },
  { slug: 'xtb', name: 'XTB' },
  { slug: 'trade-republic', name: 'Trade Republic' },
  { slug: 'interactive-brokers', name: 'Interactive Brokers' },
  { slug: 'saxo-banque', name: 'Saxo Banque' },
  { slug: 'degiro', name: 'Degiro' },
  { slug: 'boursobank', name: 'BoursoBank' },
  { slug: 'etoro', name: 'eToro' },
  { slug: 'ig', name: 'IG' },
  { slug: 'wh-selfinvest', name: 'WH SelfInvest' },
  { slug: 'linxea', name: 'Linxea' },
];

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const actions = useMemo(() => {
    const navigateTo = (url: string) => router.push(url);

    // Nav actions — exclude admin and coming soon items
    const navActions = navItems.flatMap((navItem) => {
      const baseAction =
        navItem.url !== '#'
          ? {
              id: `nav-${navItem.title.toLowerCase()}`,
              name: navItem.title,
              shortcut: navItem.shortcut,
              keywords: navItem.title.toLowerCase(),
              section: 'Navigation',
              subtitle: navItem.title,
              perform: () => navigateTo(navItem.url)
            }
          : null;

      const childActions =
        navItem.items
          ?.filter((child) => child.url !== '#') // Skip "coming soon"
          .map((childItem) => ({
            id: `nav-${childItem.title.toLowerCase()}`,
            name: childItem.title,
            shortcut: childItem.shortcut,
            keywords: childItem.title.toLowerCase(),
            section: navItem.title,
            subtitle: childItem.title,
            perform: () => navigateTo(childItem.url)
          })) ?? [];

      return baseAction ? [baseAction, ...childActions] : childActions;
    });

    // ETF search actions
    const etfActions = ETF_SEARCH.map((etf) => ({
      id: `etf-${etf.ticker}`,
      name: `${etf.ticker} — ${etf.name}`,
      keywords: `${etf.ticker} ${etf.name} ${etf.isin} etf`.toLowerCase(),
      section: 'ETF',
      subtitle: etf.isin,
      perform: () => navigateTo(`/dashboard/etf?selected=${etf.isin}`)
    }));

    // Broker search actions
    const brokerActions = BROKER_SEARCH.map((broker) => ({
      id: `broker-${broker.slug}`,
      name: broker.name,
      keywords: `${broker.name} ${broker.slug} courtier broker`.toLowerCase(),
      section: 'Courtiers',
      subtitle: `Voir la fiche ${broker.name}`,
      perform: () => navigateTo(`/dashboard/courtiers/${broker.slug}`)
    }));

    return [...navActions, ...etfActions, ...brokerActions];
  }, [router]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}

const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-background/80 fixed inset-0 z-99999 p-0! backdrop-blur-sm'>
          <KBarAnimator className='bg-card text-card-foreground relative mt-64! w-full max-w-[600px] -translate-y-12! overflow-hidden rounded-lg border shadow-lg'>
            <div className='bg-card border-border sticky top-0 z-10 border-b'>
              <KBarSearch
                className='bg-card w-full border-none px-6 py-4 text-lg outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden'
                defaultPlaceholder='Rechercher un courtier, ETF, outil...'
              />
            </div>
            <div className='max-h-[400px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
