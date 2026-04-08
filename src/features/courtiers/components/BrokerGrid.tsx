"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFilterStore } from "@/lib/store";
import { Broker } from "@/lib/brokers";
import { BrokerCard } from "./BrokerCard";
import { Search, X } from "lucide-react";

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
  const searchParams = useSearchParams();

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
    if (category && category !== "all") list = list.filter((b) => b.category === category);
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
    switch (sortBy) {
      case "fees": list.sort((a, z) => z.score_fees - a.score_fees); break;
      case "trustpilot": list.sort((a, z) => z.trustpilot_score - a.trustpilot_score); break;
      case "name": list.sort((a, z) => a.name.localeCompare(z.name)); break;
      default: list.sort((a, z) => z.score_overall - a.score_overall);
    }
    // Partners always float to top
    list.sort((a, z) => {
      const aPartner = (a as any).is_partner ? 1 : 0;
      const zPartner = (z as any).is_partner ? 1 : 0;
      if (aPartner !== zPartner) return zPartner - aPartner;
      if (aPartner && zPartner) return ((a as any).partner_rank || 999) - ((z as any).partner_rank || 999);
      return 0;
    });
    return list;
  }, [category, accountType, sortBy, maxDeposit, search, allBrokers, assetClass, level, fiscality, platform, hasDCA, hasFractions]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center h-32 text-muted-foreground text-sm">Chargement des courtiers...</div>;
  }

  return (
    <div className="flex-1 space-y-5">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</p>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-xl p-16 text-center border border-dashed border-border">
          <p className="font-semibold text-sm">Aucun résultat</p>
          <p className="text-xs text-muted-foreground mt-1">Modifiez les filtres pour afficher des courtiers</p>
        </div>
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
