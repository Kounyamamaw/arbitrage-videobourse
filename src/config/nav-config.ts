import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Vue d\'ensemble',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Intermédiaires',
    url: '#',
    icon: 'bank',
    isActive: true,
    items: [
      { title: 'Tous les acteurs', url: '/dashboard/courtiers', icon: 'product', shortcut: ['c', 'c'] },
      { title: 'Comparer', url: '/dashboard/comparer', icon: 'compare', shortcut: ['k', 'k'] }
    ]
  },
  {
    title: 'Actifs',
    url: '#',
    icon: 'chartBar',
    isActive: true,
    items: [
      { title: 'Vue globale', url: '/dashboard/par-actif', icon: 'chartPie' },
      { title: 'ETF',        url: '#',                    icon: 'chartLine', shortcut: ['e', 'e'] },
      { title: 'Actions',    url: '#',                    icon: 'bolt' },
      { title: 'Forex',      url: '#',                    icon: 'world' },
      { title: 'CFD',        url: '#',                    icon: 'chartBar' },
      { title: 'Dérivés',    url: '#',                    icon: 'currency', items: [
        { title: 'Options',  url: '#' },
        { title: 'Futures',  url: '#' },
      ]},
    ]
  },
  {
    title: 'Conseiller IA',
    url: '/dashboard/conseiller-ia',
    icon: 'sparkles',
    isActive: true,
    items: []
  },
  {
    title: 'Offres Exclusives',
    url: '/dashboard/offres',
    icon: 'gift',
    isActive: true,
    items: []
  },
];

export const adminItems: NavItem[] = [
  {
    title: 'Admin',
    url: '/dashboard/admin',
    icon: 'settings',
    isActive: true,
    items: [
      { title: 'Intermédiaires', url: '/dashboard/admin/partenaires', icon: 'product' },
      { title: 'Affiliations', url: '/dashboard/admin/affiliations', icon: 'billing' },
      { title: 'Contenu', url: '/dashboard/admin/contenu', icon: 'page' },
      { title: 'ETF', url: '/dashboard/admin/etfs', icon: 'chartLine' },
      { title: 'Actions', url: '/dashboard/admin/actions', icon: 'chartLine' },
      { title: 'Options', url: '/dashboard/admin/options', icon: 'currency' },
      { title: 'Futures', url: '/dashboard/admin/futures', icon: 'currency' },
      { title: 'CFD', url: '/dashboard/admin/cfds', icon: 'chartBar' },
      { title: 'Forex', url: '/dashboard/admin/forex', icon: 'world' },
      { title: 'Données', url: '/dashboard/admin/scraping', icon: 'notification' },
      { title: 'Waitlist', url: '/dashboard/admin/waitlist', icon: 'user' },
      { title: 'Trafic', url: '/dashboard/admin/traffic', icon: 'chartLine' },
      { title: 'Offres', url: '/dashboard/admin/offres', icon: 'gift' },
    ]
  }
];
