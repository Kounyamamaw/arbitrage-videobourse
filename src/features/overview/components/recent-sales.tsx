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
};

const TABS = [
  { key: "broker",    label: "Courtiers"  },
  { key: "bank",      label: "Banques"    },
  { key: "neobanque", label: "Néobanques" },
  { key: "insurance", label: "Assurances" },
  { key: "crypto",    label: "Crypto"     },
] as const;

const FALLBACK: BrokerRow[] = [
  { name: "Interactive Brokers", slug: "interactive-brokers", tagline: "PEA + CTO mondial",     score_overall: 8.9, score_fees: 9.5, score_reliability: 9.8, score_ux: 8.0, affiliate_url: null, category: "broker"    },
  { name: "XTB",                 slug: "xtb",                 tagline: "0% actions et ETF",     score_overall: 8.8, score_fees: 9.8, score_reliability: 8.5, score_ux: 8.5, affiliate_url: null, category: "broker"    },
  { name: "Trade Republic",      slug: "trade-republic",      tagline: "1€ par ordre",           score_overall: 8.4, score_fees: 8.5, score_reliability: 8.0, score_ux: 9.2, affiliate_url: null, category: "broker"    },
  { name: "BNP Paribas",         slug: "bnp-paribas",         tagline: "1ère banque européenne", score_overall: 6.0, score_fees: 4.0, score_reliability: 9.0, score_ux: 6.5, affiliate_url: null, category: "bank"      },
  { name: "BoursoBank",          slug: "boursobank",          tagline: "Néobanque n°1 France",   score_overall: 7.9, score_fees: 6.5, score_reliability: 9.0, score_ux: 8.5, affiliate_url: null, category: "neobanque" },
  { name: "Linxea",              slug: "linxea",              tagline: "AV sans frais d'entrée", score_overall: 9.0, score_fees: 9.3, score_reliability: 9.0, score_ux: 8.0, affiliate_url: null, category: "insurance" },
  { name: "Binance",             slug: "binance",             tagline: "Leader mondial crypto",  score_overall: 7.8, score_fees: 9.0, score_reliability: 7.0, score_ux: 8.0, affiliate_url: null, category: "crypto"    },
];

function scoreColor(v: number) {
  return v >= 7.5 ? "var(--positive)" : v >= 6 ? "var(--warning)" : "var(--negative)";
}

export function RecentSales() {
  const [allBrokers, setAllBrokers] = useState<BrokerRow[]>([]);
  const [activeTab, setActiveTab] = useState<string>("broker");

  useEffect(() => {
    fetch("/api/brokers")
      .then((r) => r.json())
      .then((data: BrokerRow[]) => {
        if (Array.isArray(data) && data.length > 0) setAllBrokers(data);
        else setAllBrokers(FALLBACK);
      })
      .catch(() => setAllBrokers(FALLBACK));
  }, []);

  const filtered = allBrokers
    .filter((b) => b.category === activeTab)
    .map((b) => ({ ...b, _display: computeOverallScore(b as any) }))
    .sort((a, z) => z._display - a._display)
    .slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Top intermédiaires</CardTitle>
        <CardDescription>Les mieux notés par catégorie</CardDescription>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
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
                href={`/go/${broker.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60 group"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary group-hover:bg-primary/20 transition-colors">
                  {broker.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate group-hover:text-primary transition-colors">
                    {broker.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{broker.tagline || "—"}</p>
                </div>
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
