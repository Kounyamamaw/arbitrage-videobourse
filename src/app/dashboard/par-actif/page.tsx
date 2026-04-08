"use client";

import PageContainer from '@/components/layout/page-container';
import brokersData from '@/data/brokers.json';
import { Broker, computeOverallScore, scoreTailwind } from '@/lib/brokers';
import { useState } from 'react';
import Link from 'next/link';
import { IconTrendingUp, IconShield, IconCurrencyBitcoin, IconHome, IconBolt, IconBuildingBank, IconChartBar, IconDiamond } from '@tabler/icons-react';

const ALL_BROKERS = brokersData as unknown as Broker[];

const ASSET_TYPES = [
  { slug: "etf",        label: "ETF / Trackers",      icon: IconChartBar,        category: "broker",    accounts: ["PEA", "CTO"] },
  { slug: "actions-fr", label: "Actions françaises",   icon: IconTrendingUp,      category: "broker",    accounts: ["PEA", "CTO"] },
  { slug: "actions-us", label: "Actions US",           icon: IconTrendingUp,      category: "broker",    accounts: ["CTO"] },
  { slug: "obligations",label: "Obligations",          icon: IconShield,          category: "broker",    accounts: ["CTO", "AV"] },
  { slug: "av",         label: "Assurance-vie",        icon: IconBuildingBank,    category: "insurance", accounts: ["AV"] },
  { slug: "crypto",     label: "Crypto-actifs",        icon: IconCurrencyBitcoin, category: "crypto",    accounts: [] },
  { slug: "scpi",       label: "SCPI / Immobilier",    icon: IconHome,            category: "scpi",      accounts: [] },
  { slug: "cfd",        label: "CFD / Produits dérivés", icon: IconBolt,          category: "cfd",       accounts: [] },
];

export default function ParActifPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const asset = ASSET_TYPES.find(a => a.slug === selected);

  const filtered = asset ? ALL_BROKERS.filter(b => {
    if (asset.category && b.category !== asset.category && asset.category !== "broker") return false;
    if (asset.accounts.length > 0) return asset.accounts.some(acc => b.accounts.includes(acc));
    return b.category === asset.category;
  }).sort((a, z) => z.score_overall - a.score_overall) : [];

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Par type d&apos;actif</h2>
        <p className="text-muted-foreground">Sélectionnez un actif pour voir les courtiers les plus adaptés.</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {ASSET_TYPES.map(({ slug, label, icon: Icon }) => (
            <button key={slug} onClick={() => setSelected(selected === slug ? null : slug)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
                selected === slug ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40'
              }`}>
              <Icon className={`size-5 ${selected === slug ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${selected === slug ? 'text-primary' : 'text-foreground'}`}>{label}</span>
            </button>
          ))}
        </div>

        {asset && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{filtered.length} courtier{filtered.length > 1 ? 's' : ''} pour {asset.label}</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((b, i) => (
                  <Link key={b.id} href={`/dashboard/courtiers/${b.slug}`}
                  className="flex items-center gap-4 rounded-xl border border-border p-4 transition-all hover:border-primary/40 hover:shadow-sm">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{b.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.tagline}</p>
                  </div>
                  <span className={`text-lg font-bold ${scoreTailwind(computeOverallScore(b))}`}>
                    {computeOverallScore(b).toFixed(1)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
