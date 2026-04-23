"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useFilterStore } from "@/lib/store";
import { Broker, computeOverallScore } from "@/lib/brokers";
import { BrokerCard } from "./BrokerCard";
import { Search, X, Share2, Check, LayoutGrid, LayoutList } from "lucide-react";

export function BrokerGrid() {
  const {
    category, accountType, sortBy, maxDeposit,
    assetClass, level, fiscality, platform, hasDCA, hasFractions, hasDemo,
    setCategory, setAccountType, setSortBy, setAssetClass,
    setLevel, setFiscality, setPlatform, setHasDCA, setHasFractions, setHasDemo,
  } = useFilterStore();
  const [search, setSearch] = useState("");
  const [allBrokers, setAllBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  useEffect(() => { if (!category || category === "all") setViewMode("cards"); }, [category]);
  const searchParams = useSearchParams();

  const buildShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const {
      category, accountType, sortBy, assetClass, level, fiscality, platform, hasDCA, hasFractions, hasDemo,
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
    if (hasDemo)                 params.set("hasDemo",      "1");
    // Inclure la vue tableau dans l'URL partagée (seulement si activée)
    if (viewMode === "table")    params.set("view",         "table");
    const qs = params.toString();
    return `${window.location.origin}/comparatif/dashboard/courtiers${qs ? `?${qs}` : ""}`;
  }, [viewMode]);

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
    const dem = searchParams.get("hasDemo");
    const viw = searchParams.get("view");
    if (cat) setCategory(cat);
    if (acc) setAccountType(acc);
    if (srt) setSortBy(srt);
    if (cls) setAssetClass(cls);
    if (lvl) setLevel(lvl);
    if (fsc) setFiscality(fsc);
    if (plt) setPlatform(plt);
    if (dca === "1") setHasDCA(true);
    if (frx === "1") setHasFractions(true);
    if (dem === "1") setHasDemo(true);
    if (viw === "table" && cat && cat !== "all") setViewMode("table");
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

  // Utiliser le score Supabase s'il est défini (même à 0), sinon calculer
  const enrichedBrokers = useMemo(() => {
    try {
      const { calculateAutoScores } = require("@/lib/auto-score");
      return allBrokers.map(b => {
        if (b.score_overall != null) return b; // score Supabase défini → on le respecte
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
    if (accountType && accountType !== "all") {
      if (accountType === "cfd") {
        // CFD FOREX = filtre par catégorie, pas par enveloppe comptable
        list = list.filter((b) => {
          const cats: string[] = (b as any).categories || [];
          return b.category === "cfd" || cats.includes("cfd");
        });
      } else {
        list = list.filter((b) => b.accounts?.includes(accountType));
      }
    }
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
    if (hasDemo)      list = list.filter((b) => !!(b as any).demo_url);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((b) => b.name.toLowerCase().includes(q) || b.tagline?.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q));
    }
    // Trier — pour "score" et "fees" le badge partenaire n'a aucun effet
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
  }, [category, accountType, sortBy, maxDeposit, search, allBrokers, assetClass, level, fiscality, platform, hasDCA, hasFractions, hasDemo]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center h-32 text-muted-foreground text-sm">Chargement des courtiers...</div>;
  }

  return (
    <div className="flex-1 min-w-0 overflow-hidden space-y-5">
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
      {/* Compteur résultats + toggle vue pleine largeur */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</p>
        {(!category || category === "all") ? null : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <button
            onClick={() => setViewMode("cards")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 16px", borderRadius: 10, cursor: "pointer",
              border: `2px solid ${viewMode === "cards" ? "var(--accent)" : "var(--border)"}`,
              backgroundColor: viewMode === "cards" ? "var(--accent)" : "var(--surface)",
              color: viewMode === "cards" ? "#fff" : "var(--text-muted)",
              fontSize: 13, fontWeight: 600, transition: "all 150ms",
            }}
          >
            <LayoutGrid size={15} />
            <span>Vue cartes</span>
          </button>
          <button
            onClick={() => { if (!category || category === "all") return; setViewMode("table"); }}
            title={(!category || category === "all") ? "Sélectionnez une catégorie pour activer le tableau comparatif" : "Tableau comparatif"}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 16px", borderRadius: 10,
              cursor: (!category || category === "all") ? "not-allowed" : "pointer",
              opacity: (!category || category === "all") ? 0.45 : 1,
              border: `2px solid ${viewMode === "table" ? "var(--accent)" : "var(--border)"}`,
              backgroundColor: viewMode === "table" ? "var(--accent)" : "var(--surface)",
              color: viewMode === "table" ? "#fff" : "var(--text-muted)",
              fontSize: 13, fontWeight: 600, transition: "all 150ms",
            }}
          >
            <LayoutList size={15} />
            <span>Tableau comparatif</span>
          </button>
        </div>}
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

// ── TABLE_COLS ─────────────────────────────────────────────────────────────
type TableCol = { key: string; label: string; getValue: (b: Broker) => string; };

const TABLE_COLS: Record<string, TableCol[]> = {
  broker: [
    { key:"fr",      label:"Frais France",    getValue:(b) => { const t=(b.fees as any)?.FR?.[0]; if(!t) return"—"; return t.amount===0?"Gratuit":t.type==="flat"?`${t.amount}€`:`${t.amount}%`; }},
    { key:"us",      label:"Frais USA",       getValue:(b) => { const t=(b.fees as any)?.US?.[0]; if(!t) return"—"; return t.amount===0?"Gratuit":t.type==="flat"?`${t.amount}€`:`${t.amount}%`; }},
    { key:"eu",      label:"Frais Europe",    getValue:(b) => { const t=(b.fees as any)?.EU?.[0]; if(!t) return"—"; return t.amount===0?"Gratuit":t.type==="flat"?`${t.amount}€`:`${t.amount}%`; }},
    { key:"custody", label:"Droits garde",    getValue:(b) => { if(b.custody_fee===0) return"Gratuit"; const u=(b as any).custody_fee_details==="%"?"%/an":"€/an"; return`${b.custody_fee}${u}`; } },
    { key:"fx",      label:"Frais change",    getValue:(b) => b.currency_fee?`${b.currency_fee}%`:"—" },
  ],
  neobanque: [
    { key:"abo",     label:"Abonnement",      getValue:(b) => { const f=b.fees as any; if(f?.standard?.montant===0) return"Gratuit"; if(f?.standard?.montant!=null) return`${f.standard.montant}€/mois`; return"—"; }},
    { key:"retrait", label:"Retrait",         getValue:(b) => b.withdrawal_fee===0?"Gratuit":b.withdrawal_fee?`${b.withdrawal_fee}€`:"—" },
    { key:"etranger",label:"Étranger",        getValue:(b) => b.currency_fee?`${b.currency_fee}%`:"Gratuit" },
    { key:"plafond", label:"Plafond retrait", getValue:(b) => { const f=b.fees as any; if(f?.retrait_especes_standard?.montant) return`${f.retrait_especes_standard.montant}€/mois`; return"—"; }},
    { key:"extra",   label:"Service add.",    getValue:(b) => { const extras=[]; if((b as any).has_dca) extras.push("DCA"); if((b as any).has_fractions) extras.push("Fractions"); return extras.length?extras.join(", "):"—"; } },
  ],
  bank: [
    { key:"annual",   label:"Frais annuel",  getValue:(b) => { const fees=(b.fees||{}) as any; const tc=fees.tenue_compte; if(tc?.montant!=null) return tc.montant===0?"Gratuit":`${tc.montant}€/an`; if(b.custody_fee===0) return"Gratuit"; const u=(b as any).custody_fee_details==="%"?"%/an":"€/an"; return`${b.custody_fee}${u}`; } },
    { key:"cb",       label:"Coût CB",       getValue:(b) => { const f=b.fees as any; if(f?.carte?.montant!=null) return`${f.carte.montant}€/an`; return"—"; }},
    { key:"decouvert",label:"Découverts",    getValue:(b) => { const f=b.fees as any; if(f?.decouvert_taux?.montant!=null) return`${f.decouvert_taux.montant}% TEG`; return"—"; } },
    { key:"virement_int", label:"Virement Int.", getValue:(b) => { const f=b.fees as any; const vi=f?.virement_int; if(vi?.montant!=null) return vi.montant===0?"Gratuit":`${vi.montant}€`; if(f?.virement?.montant===0) return"Gratuit"; if(f?.virement?.montant!=null) return`${f.virement.montant}€`; return"Gratuit"; } },
    { key:"cloture",  label:"Clôture",       getValue:(b) => (b as any).account_closing_fee?`${(b as any).account_closing_fee}€`:"Gratuit" },
  ],
  cfd: [
    { key:"spread",   label:"Spread",        getValue:(b) => { const f=b.fees as any; if(f?.spread_forex?.montant!=null) return`${f.spread_forex.montant} pip`; if(f?.spread_indices?.montant!=null) return`${f.spread_indices.montant} pt`; return"—"; }},
    { key:"overnight",label:"Overnight",     getValue:(b) => { const f=b.fees as any; if(f?.overnight?.montant!=null) return`${f.overnight.montant}%`; return"—"; }},
    { key:"fx",       label:"Frais change",  getValue:(b) => b.currency_fee?`${b.currency_fee}%`:"—" },
    { key:"retrait",  label:"Retrait",       getValue:(b) => b.withdrawal_fee===0?"Gratuit":b.withdrawal_fee?`${b.withdrawal_fee}€`:"—" },
    { key:"inact",    label:"Inactivité",    getValue:(b) => b.inactivity_fee===0?"Aucun":`${b.inactivity_fee}€/mois` },
  ],
  crypto: [
    { key:"spread",   label:"Maker/Taker",   getValue:(b) => { const f=b.fees as any; if(f?.maker?.montant!=null&&f?.taker?.montant!=null) return`${f.maker.montant}%/${f.taker.montant}%`; if(f?.trading_spot?.montant!=null) return`${f.trading_spot.montant}%`; if(f?.crypto_spread?.montant!=null) return`~${f.crypto_spread.montant}%`; return"—"; }},
    { key:"retrait",  label:"Retrait",       getValue:(b) => { const f=b.fees as any; if(f?.retrait_fiat?.montant!=null) return`${f.retrait_fiat.montant}€`; return b.withdrawal_fee===0?"Gratuit":b.withdrawal_fee?`${b.withdrawal_fee}€`:"—"; }},
    { key:"fx",       label:"Frais change",  getValue:(b) => { const f=b.fees as any; if(f?.depot_carte?.montant!=null) return`${f.depot_carte.montant}%`; return b.currency_fee?`${b.currency_fee}%`:"—"; }},
    { key:"overnight",label:"Overnight",     getValue:(b) => { const f=b.fees as any; if(f?.overnight?.montant!=null) return`${f.overnight.montant}%`; return"—"; }},
    { key:"inact",    label:"Inactivité",    getValue:(b) => b.inactivity_fee===0?"Aucun":`${b.inactivity_fee}€/mois` },
  ],
  insurance: [
    { key:"entree",   label:"Droit entrée",  getValue:(b) => { const f=b.fees as any; if(f?.entree?.montant!=null) return`${f.entree.montant}%`; return"Gratuit"; }},
    { key:"annual",   label:"Frais annuel",  getValue:(b) => { if(!b.custody_fee) return"—"; const u=(b as any).custody_fee_details==="%"?"%/an":"€/an"; return`${b.custody_fee}${u}`; } },
    { key:"arb",      label:"Arbitrage",     getValue:(b) => { const f=b.fees as any; if(f?.arbitrage?.montant!=null) return`${f.arbitrage.montant}€`; return"Gratuit"; }},
    { key:"sortie",   label:"Sortie antic.", getValue:(b) => { const f=b.fees as any; if(f?.sortie_anticipee?.montant!=null) return`${f.sortie_anticipee.montant}%`; return"—"; }},
    { key:"uc",       label:"Gestion UC",    getValue:(b) => { const f=b.fees as any; if(f?.gestion_uc?.montant!=null) return`${f.gestion_uc.montant}%/an`; return"—"; }},
  ],
};

// ── BrokerTableView ────────────────────────────────────────────────────────
function BrokerTableView({ brokers, category }: { brokers: Broker[]; category: string }) {
  const cols = TABLE_COLS[category] || TABLE_COLS.broker;
  const [sortCol, setSortCol] = useState<string>("score");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: string) => {
    if (sortCol === key) setSortAsc(p => !p);
    else { setSortCol(key); setSortAsc(false); }
  };

  const sorted = [...brokers].sort((a, z) => {
    let av: number, zv: number;
    if (sortCol === "score") {
      av = a.score_overall ?? 0; zv = z.score_overall ?? 0;
    } else {
      const col = cols.find(c => c.key === sortCol);
      if (!col) { av = a.score_overall ?? 0; zv = z.score_overall ?? 0; }
      else {
        const parseVal = (s: string) => {
          if (s === "Gratuit" || s === "Aucun") return 0;
          if (s === "—") return sortAsc ? Infinity : -Infinity;
          const n = parseFloat(s.replace(",", ".").replace(/[^\d.]/g, ""));
          return isNaN(n) ? 0 : n;
        };
        av = parseVal(col.getValue(a as Broker)); zv = parseVal(col.getValue(z as Broker));
      }
    }
    return sortAsc ? av - zv : zv - av;
  });

  const SortIcon = ({ key }: { key: string }) => (
    <span style={{ marginLeft: 4, opacity: sortCol === key ? 1 : 0.3, fontSize: 10 }}>
      {sortCol === key ? (sortAsc ? "▲" : "▼") : "▼"}
    </span>
  );

  return (
    <div className="broker-table-scroll" style={{ borderRadius: 14, border: "1px solid var(--border)", backgroundColor: "var(--card)" }}>
      <table>
        <thead>
          <tr style={{ borderBottom:"1px solid var(--border)", backgroundColor:"var(--surface)" }}>
            <th style={{ padding:"10px 10px", textAlign:"center", fontSize:11, fontWeight:700, color:"var(--text-faint)", textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap", width:32 }}>#</th>
            {/* Score en 1ère position */}
            <th onClick={() => handleSort("score")}
              style={{ padding:"10px 10px", textAlign:"right", fontSize:11, fontWeight:700, color: sortCol === "score" ? "var(--accent)" : "var(--text-faint)", textTransform:"uppercase", letterSpacing:"0.05em", cursor:"pointer", userSelect:"none", whiteSpace:"nowrap" }}>
              Score<SortIcon key="score" />
            </th>
            <th style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"var(--text-faint)", textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>Intermédiaire</th>
            {cols.map(col => (
              <th key={col.key} onClick={() => handleSort(col.key)}
                style={{ padding:"10px 10px", textAlign:"right", fontSize:11, fontWeight:700, color: sortCol === col.key ? "var(--accent)" : "var(--text-faint)", textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap", cursor:"pointer", userSelect:"none" }}>
                {col.label}<SortIcon key={col.key} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((broker, i) => (
            <tr key={broker.id}
              style={{
                borderBottom: i < brokers.length-1 ? "1px solid var(--border-light,var(--border))" : "none",
                transition:"background 120ms",
                backgroundColor: i % 2 === 1 ? "rgba(59,130,246,0.06)" : "transparent",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(59,130,246,0.13)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 1 ? "rgba(59,130,246,0.06)" : "transparent")}
            >
              <td style={{ padding:"10px 10px", textAlign:"center", whiteSpace:"nowrap", width:32 }}>
                <span style={{ fontSize:12, fontWeight:700, color: i === 0 ? "#F59E0B" : i === 1 ? "#9CA3AF" : i === 2 ? "#CD7F32" : "var(--text-faint)" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
              </td>
              {/* Score en 1ère position */}
              <td style={{ padding:"10px 10px", textAlign:"right", whiteSpace:"nowrap" }}>
                <span style={{ fontSize:12, fontWeight:700, color:"var(--accent)" }}>{broker.score_overall?.toFixed(1)}</span>
              </td>
              <td style={{ padding:"10px 14px", whiteSpace:"nowrap" }}>
                <a href={`/comparatif/dashboard/courtiers/${broker.slug}`} style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none", color:"var(--text)" }}>
                  {(broker as any).logo_url
                    ? <img src={(broker as any).logo_url} alt={broker.name} style={{ width:22, height:22, borderRadius:5, objectFit:"contain", border:"1px solid var(--border)", flexShrink:0 }} />
                    : <div style={{ width:22, height:22, borderRadius:5, backgroundColor:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><span style={{ fontSize:9, fontWeight:700, color:"#fff" }}>{broker.name[0]}</span></div>
                  }
                  <span style={{ fontSize:13, fontWeight:600 }}>{broker.name}</span>
                  {(broker as any).is_partner && <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:4, backgroundColor:"#dbeafe", color:"#2563eb", border:"1px solid #93c5fd" }}>P</span>}
                </a>
              </td>
              {cols.map(col => {
                const val = col.getValue(broker);
                const ok = val==="Gratuit"||val==="Aucun";
                return <td key={col.key} style={{ padding:"10px 10px", textAlign:"right", fontSize:12, fontWeight: ok?600:500, color: ok?"var(--positive,#22c55e)":val==="—"?"var(--text-faint)":"var(--text-muted)", whiteSpace:"nowrap" }}>{val}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}