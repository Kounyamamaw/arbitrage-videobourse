"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeOverallScore } from "@/lib/brokers";

type BrokerRow = {
  name: string;
  slug: string;
  tagline: string;
  score_overall: number;
  score_fees: number;
  score_reliability: number;
  score_ux: number;
  score_envergure?: number;
  score_support?: number;
  affiliate_url: string | null;
  category: string;
  categories?: string[];
  logo_url?: string;
  is_partner?: boolean;
  partner_rank?: number;
};

const TABS = [
  { key: "broker",    label: "Courtiers"  },
  { key: "bank",      label: "Banques"    },
  { key: "neobanque", label: "Néobanques" },
  { key: "insurance", label: "Assurances" },
  { key: "crypto",    label: "Crypto"     },
] as const;

function scoreColor(v: number) {
  if (v >= 8.0) return "var(--positive)";
  if (v >= 6.7) {
    const t = (v - 6.7) / 1.2;
    return `hsl(${Math.round(30 + t * 12)},${Math.round(90 - t * 5)}%,${Math.round(48 + t * 4)}%)`;
  }
  const t = v / 6.7;
  return `hsl(${Math.round(4 + t * 11)},${Math.round(80 - t * 10)}%,${Math.round(46 + t * 4)}%)`;
}

export function RecentSales() {
  const [allBrokers, setAllBrokers] = useState<BrokerRow[]>([]);
  const [activeTab, setActiveTab] = useState<string>("broker");

  useEffect(() => {
    fetch("/api/brokers")
      .then((r) => r.json())
      .then((data: BrokerRow[]) => {
        if (Array.isArray(data) && data.length > 0) setAllBrokers(data);
      })
      .catch(() => {});
  }, []);

  const filtered = allBrokers
    // Même logique que BrokerGrid : catégorie principale OU dans le tableau categories
    .filter((b) => b.category === activeTab || (b.categories || []).includes(activeTab))
    .map((b) => ({ ...b, _display: computeOverallScore(b as any) }))
    // Tri : partenaires d'abord (par partner_rank), puis par score décroissant
    .sort((a, z) => {
      const aP = a.is_partner ? 1 : 0;
      const zP = z.is_partner ? 1 : 0;
      if (aP !== zP) return zP - aP;
      if (aP && zP) return (a.partner_rank ?? 999) - (z.partner_rank ?? 999);
      return z._display - a._display;
    })
    .slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Top intermédiaires</CardTitle>
        <CardDescription>Les mieux notés par catégorie</CardDescription>
        <div className="flex gap-1 pt-2 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                activeTab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mt-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Aucun acteur dans cette catégorie</p>
          ) : (
            filtered.map((broker) => (
              <a
                key={broker.slug}
                href={`/comparatif/dashboard/courtiers/${broker.slug}`}

                className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60 group"
              >
                {/* Logo */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 overflow-hidden group-hover:bg-primary/20 transition-colors">
                  {broker.logo_url && !broker.logo_url.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={broker.logo_url}
                      alt={broker.name}
                      className="size-7 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <span className="text-xs font-bold text-primary">{broker.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-medium leading-none truncate group-hover:text-primary transition-colors">
                      {broker.name}
                    </p>
                    {broker.is_partner && (
                      <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                        Partenaire
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{broker.tagline || "—"}</p>
                </div>
                {/* Score */}
                <div className="font-semibold text-sm shrink-0" style={{ color: scoreColor(broker._display) }}>
                  {broker._display.toFixed(1)}/10
                </div>
              </a>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}