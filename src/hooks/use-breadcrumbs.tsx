'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Accueil', link: '/comparatif' }, { title: 'Tableau de bord', link: '/comparatif/dashboard/overview' }],
  '/dashboard/overview': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Tableau de bord', link: '/comparatif/dashboard/overview' },
    { title: 'Vue d\'ensemble', link: '/comparatif/dashboard/overview' }
  ],
  '/dashboard/courtiers': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Tableau de bord', link: '/comparatif/dashboard/overview' },
    { title: 'Intermédiaires', link: '/comparatif/dashboard/courtiers' }
  ],
  '/dashboard/comparer': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Tableau de bord', link: '/comparatif/dashboard/overview' },
    { title: 'Comparer', link: '/comparatif/dashboard/comparer' }
  ],
  '/dashboard/comparer/resultats': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Comparer', link: '/comparatif/dashboard/comparer' },
    { title: 'Résultats', link: '/comparatif/dashboard/comparer/resultats' }
  ],
  '/dashboard/etf': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Tableau de bord', link: '/comparatif/dashboard/overview' },
    { title: 'ETF', link: '/comparatif/dashboard/etf' }
  ],
  '/dashboard/par-actif': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Tableau de bord', link: '/comparatif/dashboard/overview' },
    { title: 'Par Actif', link: '/comparatif/dashboard/par-actif' }
  ],
  '/dashboard/conseiller-ia': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Tableau de bord', link: '/comparatif/dashboard/overview' },
    { title: 'Conseiller IA', link: '/comparatif/dashboard/conseiller-ia' }
  ],
  '/dashboard/admin': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' }
  ],
  '/dashboard/admin/scraping': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'Données', link: '/comparatif/dashboard/admin/scraping' }
  ],
  '/dashboard/admin/affiliations': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'Affiliations', link: '/comparatif/dashboard/admin/affiliations' }
  ],
  '/dashboard/admin/partenaires': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'Intermédiaires', link: '/comparatif/dashboard/admin/partenaires' }
  ],
  '/dashboard/admin/contenu': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'Contenu', link: '/comparatif/dashboard/admin/contenu' }
  ],
  '/dashboard/admin/etfs': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'ETF', link: '/comparatif/dashboard/admin/etfs' }
  ],
  '/dashboard/admin/actions': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'Actions', link: '/comparatif/dashboard/admin/actions' }
  ],
  '/dashboard/admin/options': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'Options', link: '/comparatif/dashboard/admin/options' }
  ],
  '/dashboard/admin/futures': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'Futures', link: '/comparatif/dashboard/admin/futures' }
  ],
  '/dashboard/admin/cfds': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'CFD', link: '/comparatif/dashboard/admin/cfds' }
  ],
  '/dashboard/admin/forex': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'Forex', link: '/comparatif/dashboard/admin/forex' }
  ],
  '/dashboard/admin/waitlist': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'Waitlist', link: '/comparatif/dashboard/admin/waitlist' }
  ],
  '/dashboard/admin/traffic': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'Trafic', link: '/comparatif/dashboard/admin/traffic' }
  ],
  '/dashboard/admin/donnees': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'État des données', link: '/comparatif/dashboard/admin/donnees' }
  ],
  '/dashboard/offres': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Tableau de bord', link: '/comparatif/dashboard/overview' },
    { title: 'Offres Exclusives', link: '/comparatif/dashboard/offres' }
  ],
  '/dashboard/admin/offres': [
    { title: 'Accueil', link: '/comparatif' },
    { title: 'Admin', link: '/comparatif/dashboard/admin' },
    { title: 'Offres', link: '/comparatif/dashboard/admin/offres' }
  ],
};

// Dynamic slug mapping
const slugLabels: Record<string, string> = {
  courtiers: 'Intermédiaires',
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
        { title: 'Accueil', link: '/comparatif' },
        { title: 'Intermédiaires', link: '/comparatif/dashboard/courtiers' },
        { title: label, link: pathname }
      ];
    }

    // Fallback
    return [{ title: 'Accueil', link: '/comparatif' }, { title: 'Tableau de bord', link: '/comparatif/dashboard/overview' }];
  }, [pathname]);
}