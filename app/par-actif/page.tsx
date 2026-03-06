"use client";

import { useState } from "react";
import brokersData from "@/data/brokers.json";
import { BrokerCard } from "@/components/brokers/BrokerCard";
import { Broker } from "@/lib/brokers";
import { TrendingUp, BarChart2, Shield, Globe, Layers, Home, Info } from "lucide-react";

type AssetType = {
  id:            string;
  label:         string;
  sublabel:      string;
  icon:          React.ElementType;
  accounts:      string[];
  categories:    string[];
  tip:           string;
};

const ASSET_TYPES: AssetType[] = [
  {
    id:         "etf",
    label:      "ETF",
    sublabel:   "Fonds indiciels",
    icon:       BarChart2,
    accounts:   ["PEA", "CTO"],
    categories: ["broker", "bank"],
    tip:        "Privilégiez le PEA pour les ETF éligibles — l'exonération fiscale après 5 ans est un avantage décisif.",
  },
  {
    id:         "actions",
    label:      "Actions",
    sublabel:   "Marchés actions",
    icon:       TrendingUp,
    accounts:   ["PEA", "CTO"],
    categories: ["broker", "bank"],
    tip:        "Vérifiez les frais de change pour les actions US — ils varient de 0% à 1,50% selon le courtier.",
  },
  {
    id:         "obligations",
    label:      "Obligations",
    sublabel:   "Marché obligataire",
    icon:       Layers,
    accounts:   ["CTO", "AV"],
    categories: ["broker", "insurance"],
    tip:        "Les obligations sont plus accessibles en assurance-vie, sans frais de garde ni imposition annuelle.",
  },
  {
    id:         "assurance-vie",
    label:      "Assurance-vie",
    sublabel:   "Contrats AV & PER",
    icon:       Shield,
    accounts:   ["AV", "PER"],
    categories: ["insurance", "bank"],
    tip:        "Exigez 0% de frais d'entrée. Les contrats en ligne comme Linxea ou Yomoni n'en prélèvent aucun.",
  },
  {
    id:         "crypto",
    label:      "Crypto-actifs",
    sublabel:   "Bitcoin, ETH, altcoins",
    icon:       Globe,
    accounts:   ["CTO"],
    categories: ["crypto", "broker"],
    tip:        "Privilégiez les plateformes enregistrées PSAN auprès de l'AMF. La réglementation MiCA est en vigueur.",
  },
  {
    id:         "scpi",
    label:      "SCPI",
    sublabel:   "Immobilier pierre-papier",
    icon:       Home,
    accounts:   ["AV", "CTO"],
    categories: ["insurance", "broker"],
    tip:        "L'accès aux SCPI via assurance-vie évite les frais d'entrée élevés (souvent 8-10% en direct).",
  },
];

export default function ParActifPage() {
  const [selected, setSelected] = useState<string>("etf");
  const asset = ASSET_TYPES.find((a) => a.id === selected)!;

  const brokers = (brokersData as Broker[])
    .filter(
      (b) =>
        asset.categories.includes(b.category) &&
        b.accounts.some((acc) => asset.accounts.includes(acc))
    )
    .sort((a, z) => z.score_overall - a.score_overall);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* Header */}
        <div>
          <h1
            className="font-display font-semibold text-2xl"
            style={{ color: "var(--text)" }}
          >
            Par type d'actif
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
            Sélectionnez le type d'actif pour voir les meilleures enveloppes et courtiers adaptés.
          </p>
        </div>

        {/* Asset selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {ASSET_TYPES.map(({ id, label, sublabel, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className="flex flex-col items-start gap-2 rounded-xl p-4 transition-all text-left"
              style={{
                backgroundColor: selected === id ? "var(--text)" : "var(--card)",
                border: `1px solid ${selected === id ? "var(--text)" : "var(--border)"}`,
                cursor: "pointer",
              }}
            >
              <Icon
                size={16}
                style={{ color: selected === id ? "var(--bg)" : "var(--text-muted)" }}
              />
              <div>
                <p
                  className="font-display font-semibold text-sm"
                  style={{ color: selected === id ? "var(--bg)" : "var(--text)" }}
                >
                  {label}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: selected === id ? "rgba(255,255,255,0.55)" : "var(--text-faint)" }}
                >
                  {sublabel}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Tip */}
        <div
          className="flex items-start gap-3 rounded-xl p-4"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <Info size={13} style={{ color: "var(--text-faint)", flexShrink: 0, marginTop: "1px" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {asset.tip}
          </p>
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
              {brokers.length} courtier{brokers.length !== 1 ? "s" : ""} recommandé{brokers.length !== 1 ? "s" : ""} pour les {asset.label}
            </p>
            <div className="flex gap-1.5">
              {asset.accounts.map((acc) => (
                <span key={acc} className="tag">{acc}</span>
              ))}
            </div>
          </div>

          {brokers.length === 0 ? (
            <div
              className="rounded-xl p-12 text-center"
              style={{
                border: "1px dashed var(--border)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Aucun acteur dans notre base ne correspond à ce profil.
                <br />
                Lancez une analyse depuis l'espace admin pour enrichir les données.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brokers.map((broker, i) => (
                <BrokerCard key={broker.id} broker={broker} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
