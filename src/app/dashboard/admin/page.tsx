"use client";

import PageContainer from '@/components/layout/page-container';
import Link from 'next/link';
import { IconDatabase, IconLink, IconUsers, IconChartBar, IconClipboardCheck, IconMail, IconCurrencyDollar, IconChartLine, IconBuildingBank, IconChartAreaLine, IconGift } from '@tabler/icons-react';

const adminPages = [
  { title: 'Intermédiaires', desc: 'Ajouter, modifier ou supprimer des intermédiaires', href: '/dashboard/admin/partenaires', icon: IconUsers, color: 'text-blue-500 bg-blue-500/10' },
  { title: 'Affiliations', desc: 'Gérer les liens d\'affiliation', href: '/dashboard/admin/affiliations', icon: IconLink, color: 'text-emerald-500 bg-emerald-500/10' },
  { title: 'Données', desc: 'Enrichir les données — scraping + saisie assistée IA', href: '/dashboard/admin/scraping', icon: IconDatabase, color: 'text-rose-500 bg-rose-500/10' },
  { title: 'État des données', desc: 'Complétude des fiches courtiers', href: '/dashboard/admin/donnees', icon: IconClipboardCheck, color: 'text-teal-500 bg-teal-500/10' },
  { title: 'Waitlist', desc: 'Consulter et exporter les inscrits', href: '/dashboard/admin/waitlist', icon: IconMail, color: 'text-cyan-500 bg-cyan-500/10' },
  { title: 'Trafic', desc: 'Visiteurs, pages vues, audience', href: '/dashboard/admin/traffic', icon: IconChartAreaLine, color: 'text-violet-500 bg-violet-500/10' },
  { title: 'Offres', desc: 'Gérer les offres exclusives affichées sur le site', href: '/dashboard/admin/offres', icon: IconGift, color: 'text-orange-500 bg-orange-500/10' },
];

const assetPages = [
  { title: 'ETF', desc: 'Gérer les ETF référencés', href: '/dashboard/admin/etfs', icon: IconChartBar, color: 'text-violet-500 bg-violet-500/10' },
  { title: 'Actions', desc: 'Gérer les actions listées', href: '/dashboard/admin/actions', icon: IconChartLine, color: 'text-blue-500 bg-blue-500/10' },
  { title: 'Options', desc: 'Gérer les options disponibles', href: '/dashboard/admin/options', icon: IconCurrencyDollar, color: 'text-green-500 bg-green-500/10' },
  { title: 'Futures', desc: 'Gérer les contrats futures', href: '/dashboard/admin/futures', icon: IconCurrencyDollar, color: 'text-orange-500 bg-orange-500/10' },
  { title: 'CFD', desc: 'Gérer les CFD référencés', href: '/dashboard/admin/cfds', icon: IconChartLine, color: 'text-red-500 bg-red-500/10' },
  { title: 'Forex', desc: 'Gérer les paires Forex', href: '/dashboard/admin/forex', icon: IconBuildingBank, color: 'text-indigo-500 bg-indigo-500/10' },
];

export default function AdminPage() {
  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Administration</h2>
          <p className="text-muted-foreground mt-1">Gérez l&apos;ensemble de votre application.</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Général</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminPages.map(({ title, desc, href, icon: Icon, color }) => (
              <Link key={href} href={href}
                className="group flex flex-col gap-4 rounded-xl border border-border p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <div className={`flex size-11 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Classes d&apos;actifs</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assetPages.map(({ title, desc, href, icon: Icon, color }) => (
              <Link key={href} href={href}
                className="group flex flex-col gap-4 rounded-xl border border-border p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <div className={`flex size-11 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

