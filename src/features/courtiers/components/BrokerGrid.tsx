"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useFilterStore } from "@/lib/store";
import { Broker, computeOverallScore } from "@/lib/brokers";
import { BrokerCard } from "./BrokerCard";
import { Search, X, Share2, Check, LayoutGrid, LayoutList, ExternalLink } from "lucide-react";

export function BrokerGrid() {
  const {
    category, accountType, sortBy, maxDeposit,
    assetClass, level, fiscality, platform, hasDCA, hasFractions,
    setCategory, setAccountType, setSortBy, setAssetClass,
    setLevel, setFiscality, setPlatform, setHasDCA, setHasFractions,
  } = useFilterStore();
  const [search, setSearch] = useState("");
  const [allBrokers, setAllBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  // Auto-reset to cards when "all" is selected
  useEffect(() => {
    if (!category || category === "all") setViewMode("cards");
  }, [category]);
  const searchParams = useSearchParams();

  const buildShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const {
      category, accountType, sortBy, assetClass, level, fiscality, platform, hasDCA, hasFractions,
    } = useFilterStore.getState();
    const params = new URLSearchParams();
    if (category    !== "all")   params.set("category",     category);
    if (accountType !== "all")   params.set("accountType",  accountType);
    if (sortBy      !== "score") params.set("sortBy",       sortBy);
    if (assetClass  !== "all")   params.set("assetClass",   assetClass);
    if (level       !== "all")   params.set("level",        level);
    if (fiscality   !== "all")   params.set("fiscality",    fiscality);
    if (platform    !== "all")   params.set("platform",     platform);
    if (hasDCA)                  params.set("hasDCA",       "1");
    if (hasFractions)            params.set("hasFractions", "1");
    const qs = params.toString();
    return `${window.location.origin}/dashboard/courtiers${qs ? `?${qs}` : ""}`;
  }, []);

  const handleShare = () => {
    const url = buildShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Restaurer tous les filtres depuis les query params (liens partagés)
  useEffect(() => {
    const cat = searchParams.get("category");
    const acc = searchParams.get("accountType");
    const srt = searchParams.get("sortBy");
    const cls = searchParams.get("assetClass");
    const lvl = searchParams.get("level");
    const fsc = searchParams.get("fiscality");
    const plt = searchParams.get("platform");
    const dca = searchParams.get("hasDCA");
    const frx = searchParams.get("hasFractions");
    if (cat) setCategory(cat);
    if (acc) setAccountType(acc);
    if (srt) setSortBy(srt);
    if (cls) setAssetClass(cls);
    if (lvl) setLevel(lvl);
    if (fsc) setFiscality(fsc);
    if (plt) setPlatform(plt);
    if (dca === "1") setHasDCA(true);
    if (frx === "1") setHasFractions(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Try Supabase API first, fallback to static JSON
    fetch("/api/brokers")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllBrokers(data as Broker[]);
        } else {
          // Fallback to static import
          import("@/data/brokers.json").then((mod) => {
            setAllBrokers(mod.default as unknown as Broker[]);
          });
        }
        setLoading(false);
      })
      .catch(() => {
        import("@/data/brokers.json").then((mod) => {
          setAllBrokers(mod.default as unknown as Broker[]);
          setLoading(false);
        });
      });
  }, []);

  // Enrich brokers with auto-calculated scores where scores are 0
  const enrichedBrokers = useMemo(() => {
    try {
      const { calculateAutoScores } = require("@/lib/auto-score");
      return allBrokers.map(b => {
        if (b.score_overall > 0) return b;
        const auto = calculateAutoScores(b, allBrokers);
        return { ...b, ...auto };
      });
    } catch {
      return allBrokers;
    }
  }, [allBrokers]);

  const filtered = useMemo(() => {
    let list = [...enrichedBrokers];
    if (category && category !== "all") list = list.filter((b) => {
      // Check primary category OR multi-category array
      const cats: string[] = (b as any).categories || [];
      return b.category === category || cats.includes(category);
    });
    if (accountType && accountType !== "all") list = list.filter((b) => b.accounts?.includes(accountType));
    if (maxDeposit < 10000) list = list.filter((b) => b.deposit_minimum <= maxDeposit);

    // Filtres avancés — basés sur les champs du broker (on filtre souplement si le champ n'existe pas)
    if (assetClass !== "all") list = list.filter((b) => {
      const assets: string[] = (b as any).asset_classes || [];
      // Si pas de données, on exclut (filtre strict)
      return assets.includes(assetClass);
    });
    if (level !== "all") list = list.filter((b) => {
      const lvl: string = (b as any).level || "";
      return lvl === level;
    });
    if (fiscality === "france")   list = list.filter((b) => !(b as any).is_foreign);
    if (fiscality === "etranger") list = list.filter((b) => !!(b as any).is_foreign);
    if (fiscality === "ifu")      list = list.filter((b) => !!(b as any).provides_ifu);
    if (platform !== "all") list = list.filter((b) => {
      const platforms: string[] = (b as any).platforms || [];
      return platforms.includes(platform);
    });
    if (hasDCA)       list = list.filter((b) => !!(b as any).has_dca);
    if (hasFractions) list = list.filter((b) => !!(b as any).has_fractions);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((b) => b.name.toLowerCase().includes(q) || b.tagline?.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q));
    }
    // Trier — pour "score", "fees" et "trustpilot" le badge partenaire n'a aucun effet
    const partnerBoostActive = sortBy !== "score" && sortBy !== "fees" && sortBy !== "trustpilot";
    switch (sortBy) {
      case "fees":  list.sort((a, z) => z.score_fees - a.score_fees); break;
      case "trustpilot": list.sort((a, z) => z.trustpilot_score - a.trustpilot_score); break;
      default: list.sort((a, z) => computeOverallScore(z) - computeOverallScore(a));
    }
    // Partners flottent en tête seulement pour Trustpilot (pas score ni fees)
    if (partnerBoostActive) {
      list.sort((a, z) => {
        const aPartner = (a as any).is_partner ? 1 : 0;
        const zPartner = (z as any).is_partner ? 1 : 0;
        if (aPartner !== zPartner) return zPartner - aPartner;
        if (aPartner && zPartner) return ((a as any).partner_rank || 999) - ((z as any).partner_rank || 999);
        return 0;
      });
    }
    return list;
  }, [category, accountType, sortBy, maxDeposit, search, allBrokers, assetClass, level, fiscality, platform, hasDCA, hasFractions]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center h-32 text-muted-foreground text-sm">Chargement des courtiers...</div>;
  }

  return (
    <div className="flex-1 space-y-5">
      {/* Barre de recherche + bouton partage */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher un courtier ou banque..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-9 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={13} className="text-muted-foreground" />
            </button>
          )}
        </div>
        {/* Bouton partager la vue filtrée */}
        <button
          onClick={handleShare}
          title="Copier le lien de cette vue filtrée"
          className="shrink-0 flex items-center justify-center rounded-lg border border-border bg-background transition-all hover:border-primary/50"
          style={{
            width: 38, height: 38,
            color: copied ? "var(--positive, #22c55e)" : "var(--text-muted)",
            transition: "color 150ms, border-color 150ms",
          }}
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
        </button>
      </div>
      {/* Barre résultats + toggle vue — toggle visible seulement sur catégorie spécifique */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</p>
        <div style={{ display: "flex", gap: 3, padding: 3, borderRadius: 9, backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <button
              onClick={() => setViewMode("cards")}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                backgroundColor: viewMode === "cards" ? "var(--card)" : "transparent",
                color: viewMode === "cards" ? "var(--accent)" : "var(--text-faint)",
                boxShadow: viewMode === "cards" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                fontSize: 12, fontWeight: viewMode === "cards" ? 600 : 400,
                transition: "all 150ms",
              }}
            >
              <LayoutGrid size={13} />
              <span>Cartes</span>
            </button>
            <button
              onClick={() => { if (!category || category === "all") return; setViewMode("table"); }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", borderRadius: 6, border: "none",
                cursor: (!category || category === "all") ? "not-allowed" : "pointer",
                opacity: (!category || category === "all") ? 0.35 : 1,
                backgroundColor: viewMode === "table" ? "var(--card)" : "transparent",
                color: viewMode === "table" ? "var(--accent)" : "var(--text-faint)",
                boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                fontSize: 12, fontWeight: viewMode === "table" ? 600 : 400,
                transition: "all 150ms",
              }}
              title={(!category || category === "all") ? "Sélectionnez une catégorie pour activer la vue tableau" : "Vue tableau"}
            >
              <LayoutList size={13} />
              <span>Tableau</span>
            </button>
          </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl p-16 text-center border border-dashed border-border">
          <p className="font-semibold text-sm">Aucun résultat</p>
          <p className="text-xs text-muted-foreground mt-1">Modifiez les filtres pour afficher des courtiers</p>
        </div>
      ) : viewMode === "table" && category && category !== "all" ? (
        <BrokerTableView brokers={filtered} category={category} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((broker, i) => (
            <BrokerCard key={broker.id} broker={broker} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Définition des colonnes par catégorie ─────────────────────────────────
type TableCol = {
  key: string;
  label: string;
  getValue: (b: Broker) => string;
};

const TABLE_COLS: Record<string, TableCol[]> = {
  broker: [
    { key: "fr",      label: "Frais France",    getValue: (b) => {
      const t = (b.fees as any)?.FR?.[0];
      if (!t) return "—";
      return t.amount === 0 ? "Gratuit" : t.type === "flat" ? `${t.amount}€` : `${t.amount}%`;
    }},
    { key: "us",      label: "Frais USA",       getValue: (b) => {
      const t = (b.fees as any)?.US?.[0];
      if (!t) return "—";
      return t.amount === 0 ? "Gratuit" : t.type === "flat" ? `${t.amount}€` : `${t.amount}%`;
    }},
    { key: "eu",      label: "Frais Europe",    getValue: (b) => {
      const t = (b.fees as any)?.EU?.[0];
      if (!t) return "—";
      return t.amount === 0 ? "Gratuit" : t.type === "flat" ? `${t.amount}€` : `${t.amount}%`;
    }},
    { key: "custody", label: "Droits de garde", getValue: (b) => b.custody_fee === 0 ? "Gratuit" : `${b.custody_fee}€/an` },
    { key: "fx",      label: "Frais de change", getValue: (b) => b.currency_fee ? `${b.currency_fee}%` : "—" },
  ],
  neobanque: [
    { key: "abo",      label: "Abonnement",          getValue: (b) => {
      const f = b.fees as any;
      if (f?.standard?.montant === 0) return "Gratuit";
      if (f?.standard?.montant != null) return `${f.standard.montant}€/mois`;
      return "—";
    }},
    { key: "retrait",  label: "Frais de retrait",    getValue: (b) => b.withdrawal_fee === 0 ? "Gratuit" : b.withdrawal_fee ? `${b.withdrawal_fee}€` : "—" },
    { key: "etranger", label: "Frais à l'étranger",  getValue: (b) => b.currency_fee ? `${b.currency_fee}%` : "Gratuit" },
    { key: "plafond",  label: "Plafond retrait",     getValue: (b) => {
      const f = b.fees as any;
      if (f?.retrait_especes_standard?.montant) return `${f.retrait_especes_standard.montant}€/mois`;
      return "—";
    }},
    { key: "extra",    label: "Service additionnel", getValue: (b) => {
      if ((b as any).has_dca) return "DCA auto";
      if ((b as any).has_fractions) return "Fractions";
      return "—";
    }},
  ],
  bank: [
    { key: "annual",   label: "Frais annuel",        getValue: (b) => b.custody_fee === 0 ? "Gratuit" : `${b.custody_fee}€/an` },
    { key: "cb",       label: "Coût des CB",          getValue: (b) => {
      const f = b.fees as any;
      if (f?.carte?.montant != null) return `${f.carte.montant}€/an`;
      return "—";
    }},
    { key: "decouvert",label: "Frais découverts",    getValue: (b) => b.inactivity_fee ? `${b.inactivity_fee}€` : "—" },
    { key: "virement", label: "Frais de virement",   getValue: (b) => {
      const f = b.fees as any;
      if (f?.FR?.[0]?.amount === 0) return "Gratuit";
      return "—";
    }},
    { key: "cloture",  label: "Frais de clôture",    getValue: (b) => (b as any).account_closing_fee ? `${(b as any).account_closing_fee}€` : "Gratuit" },
  ],
  cfd: [
    { key: "spread",   label: "Spread & Commission", getValue: (b) => {
      const f = b.fees as any;
      if (f?.spread_forex?.montant != null) return `${f.spread_forex.montant} pip`;
      if (f?.spread_indices?.montant != null) return `${f.spread_indices.montant} pt`;
      return "—";
    }},
    { key: "overnight",label: "Swap overnight",      getValue: (b) => {
      const f = b.fees as any;
      if (f?.overnight?.montant != null) return `${f.overnight.montant}%/nuit`;
      return "—";
    }},
    { key: "fx",       label: "Frais de change",     getValue: (b) => b.currency_fee ? `${b.currency_fee}%` : "—" },
    { key: "retrait",  label: "Frais de retrait",    getValue: (b) => b.withdrawal_fee === 0 ? "Gratuit" : b.withdrawal_fee ? `${b.withdrawal_fee}€` : "—" },
    { key: "inact",    label: "Frais d'inactivité",  getValue: (b) => b.inactivity_fee === 0 ? "Aucun" : `${b.inactivity_fee}€/mois` },
  ],
  crypto: [
    { key: "spread",   label: "Spread & Commission", getValue: (b) => {
      const f = b.fees as any;
      if (f?.maker?.montant != null && f?.taker?.montant != null) return `${f.maker.montant}% / ${f.taker.montant}%`;
      if (f?.trading_spot?.montant != null) return `${f.trading_spot.montant}%`;
      if (f?.crypto_spread?.montant != null) return `~${f.crypto_spread.montant}%`;
      return "—";
    }},
    { key: "retrait",  label: "Frais de retrait",    getValue: (b) => {
      const f = b.fees as any;
      if (f?.retrait_fiat?.montant != null) return `${f.retrait_fiat.montant}€`;
      return b.withdrawal_fee === 0 ? "Gratuit" : b.withdrawal_fee ? `${b.withdrawal_fee}€` : "—";
    }},
    { key: "fx",       label: "Frais de change",     getValue: (b) => {
      const f = b.fees as any;
      if (f?.depot_carte?.montant != null) return `${f.depot_carte.montant}% carte`;
      return b.currency_fee ? `${b.currency_fee}%` : "—";
    }},
    { key: "overnight",label: "Frais overnight",     getValue: (b) => {
      const f = b.fees as any;
      if (f?.overnight?.montant != null) return `${f.overnight.montant}%`;
      return "—";
    }},
    { key: "inact",    label: "Frais d'inactivité",  getValue: (b) => b.inactivity_fee === 0 ? "Aucun" : `${b.inactivity_fee}€/mois` },
  ],
  insurance: [
    { key: "entree",   label: "Droit d'entrée",      getValue: (b) => {
      const f = b.fees as any;
      if (f?.entree?.montant != null) return `${f.entree.montant}%`;
      return "Gratuit";
    }},
    { key: "annual",   label: "Frais annuel",        getValue: (b) => b.custody_fee ? `${b.custody_fee}%/an` : "—" },
    { key: "arb",      label: "Frais d'arbitrage",   getValue: (b) => {
      const f = b.fees as any;
      if (f?.arbitrage?.montant != null) return `${f.arbitrage.montant}€`;
      return "Gratuit";
    }},
    { key: "sortie",   label: "Sortie anticipée",    getValue: (b) => {
      const f = b.fees as any;
      if (f?.sortie_anticipee?.montant != null) return `${f.sortie_anticipee.montant}%`;
      return "—";
    }},
    { key: "uc",       label: "Frais gestion UC",    getValue: (b) => {
      const f = b.fees as any;
      if (f?.gestion_uc?.montant != null) return `${f.gestion_uc.montant}%/an`;
      return "—";
    }},
  ],
};

// ── Composant vue tableau ─────────────────────────────────────────────────
function BrokerTableView({ brokers, category }: { brokers: Broker[]; category: string }) {
  const cols = TABLE_COLS[category] || TABLE_COLS.broker;

  return (
    <div style={{
      width: "100%",
      overflowX: "auto",
      overflowY: "visible",
      WebkitOverflowScrolling: "touch" as any,
      borderRadius: 14,
      border: "1px solid var(--border)",
      backgroundColor: "var(--card)",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
            <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
              Intermédiaire
            </th>
            {cols.map(col => (
              <th key={col.key} style={{ padding: "10px 12px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                {col.label}
              </th>
            ))}
            <th style={{ padding: "10px 12px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {brokers.map((broker, i) => (
            <tr
              key={broker.id}
              style={{
                borderBottom: i < brokers.length - 1 ? "1px solid var(--border-light, var(--border))" : "none",
                transition: "background 120ms",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--surface)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}
            >
              {/* Nom + logo */}
              <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                <a
                  href={`/dashboard/courtiers/${broker.slug}`}
                  style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "var(--text)" }}
                >
                  {(broker as any).logo_url ? (
                    <img src={(broker as any).logo_url} alt={broker.name} style={{ width: 24, height: 24, borderRadius: 6, objectFit: "contain", border: "1px solid var(--border)", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{broker.name[0]}</span>
                    </div>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{broker.name}</span>
                  {(broker as any).is_partner && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4, backgroundColor: "#dbeafe", color: "#2563eb", border: "1px solid #93c5fd" }}>P</span>
                  )}
                </a>
              </td>
              {/* Colonnes de frais */}
              {cols.map(col => {
                const val = col.getValue(broker);
                const isGratuit = val === "Gratuit" || val === "Aucun";
                return (
                  <td key={col.key} style={{ padding: "10px 12px", textAlign: "right", fontSize: 12, fontWeight: isGratuit ? 600 : 500, color: isGratuit ? "var(--positive, #22c55e)" : "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {val}
                  </td>
                );
              })}
              {/* Score */}
              <td style={{ padding: "10px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-sora)" }}>
                  {broker.score_overall?.toFixed(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}