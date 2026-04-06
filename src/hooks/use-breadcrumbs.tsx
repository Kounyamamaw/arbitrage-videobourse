'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Accueil', link: '/' }, { title: 'Tableau de bord', link: '/dashboard' }],
  '/dashboard/overview': [
    { title: 'Accueil', link: '/' },
    { title: 'Tableau de bord', link: '/dashboard/overview' },
    { title: 'Vue d\'ensemble', link: '/dashboard/overview' }
  ],
  '/dashboard/courtiers': [
    { title: 'Accueil', link: '/' },
    { title: 'Tableau de bord', link: '/dashboard/overview' },
    { title: 'Courtiers', link: '/dashboard/courtiers' }
  ],
  '/dashboard/comparer': [
    { title: 'Accueil', link: '/' },
    { title: 'Tableau de bord', link: '/dashboard/overview' },
    { title: 'Comparer', link: '/dashboard/comparer' }
  ],
  '/dashboard/comparer/resultats': [
    { title: 'Accueil', link: '/' },
    { title: 'Comparer', link: '/dashboard/comparer' },
    { title: 'Résultats', link: '/dashboard/comparer/resultats' }
  ],
  '/dashboard/etf': [
    { title: 'Accueil', link: '/' },
    { title: 'Tableau de bord', link: '/dashboard/overview' },
    { title: 'ETF', link: '/dashboard/etf' }
  ],
  '/dashboard/par-actif': [
    { title: 'Accueil', link: '/' },
    { title: 'Tableau de bord', link: '/dashboard/overview' },
    { title: 'Par Actif', link: '/dashboard/par-actif' }
  ],
  '/dashboard/conseiller-ia': [
    { title: 'Accueil', link: '/' },
    { title: 'Tableau de bord', link: '/dashboard/overview' },
    { title: 'Conseiller IA', link: '/dashboard/conseiller-ia' }
  ],
  '/dashboard/admin': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' }
  ],
  '/dashboard/admin/scraping': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'Données', link: '/dashboard/admin/scraping' }
  ],
  '/dashboard/admin/affiliations': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'Affiliations', link: '/dashboard/admin/affiliations' }
  ],
  '/dashboard/admin/partenaires': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'Intermédiaires', link: '/dashboard/admin/partenaires' }
  ],
  '/dashboard/admin/contenu': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'Contenu', link: '/dashboard/admin/contenu' }
  ],
  '/dashboard/admin/etfs': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'ETF', link: '/dashboard/admin/etfs' }
  ],
  '/dashboard/admin/actions': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'Actions', link: '/dashboard/admin/actions' }
  ],
  '/dashboard/admin/options': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'Options', link: '/dashboard/admin/options' }
  ],
  '/dashboard/admin/futures': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'Futures', link: '/dashboard/admin/futures' }
  ],
  '/dashboard/admin/cfds': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'CFD', link: '/dashboard/admin/cfds' }
  ],
  '/dashboard/admin/forex': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'Forex', link: '/dashboard/admin/forex' }
  ],
  '/dashboard/admin/waitlist': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'Waitlist', link: '/dashboard/admin/waitlist' }
  ],
  '/dashboard/admin/traffic': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'Trafic', link: '/dashboard/admin/traffic' }
  ],
  '/dashboard/admin/donnees': [
    { title: 'Accueil', link: '/' },
    { title: 'Admin', link: '/dashboard/admin' },
    { title: 'État des données', link: '/dashboard/admin/donnees' }
  ],
};

// Dynamic slug mapping
const slugLabels: Record<string, string> = {
  courtiers: 'Courtiers',
  admin: 'Admin',
  etf: 'ETF',
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  return useMemo(() => {
    // Check exact route
    if (routeMapping[pathname]) return routeMapping[pathname];

    // Dynamic courtier slug pages
    const courtierMatch = pathname.match(/^\/dashboard\/courtiers\/(.+)$/);
    if (courtierMatch) {
      const raw = courtierMatch[1];
      // Decode URI then build readable name: hyphens → spaces, capitalize each word
      let label: string;
      try { label = decodeURIComponent(raw); } catch { label = raw; }
      label = label.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      // Special cases with accents / dots
      const knownNames: Record<string, string> = {
        'cr dit agricole': 'Crédit Agricole',
        'cr dit mutuel': 'Crédit Mutuel',
        'capital com': 'Capital.com',
        'soci t g n rale': 'Société Générale',
        'cmc markets': 'CMC Markets',
        'wh selfinvest': 'WH SelfInvest',
        'trade republic': 'Trade Republic',
        'la banque postale': 'La Banque Postale',
        'caisse d epargne': 'Caisse d\'Epargne',
        'hello bank': 'Hello bank!',
        'interactive brokers': 'Interactive Brokers',
      };
      const key = label.toLowerCase();
      if (knownNames[key]) label = knownNames[key];
      return [
        { title: 'Accueil', link: '/' },
        { title: 'Courtiers', link: '/dashboard/courtiers' },
        { title: label, link: pathname }
      ];
    }

    // Fallback
    return [{ title: 'Accueil', link: '/' }, { title: 'Tableau de bord', link: '/dashboard/overview' }];
  }, [pathname]);
}
