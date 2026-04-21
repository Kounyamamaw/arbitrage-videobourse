"use client";

import React, { useState, useMemo, useEffect } from "react";
import issuersData  from "@/data/issuers.json";
import { ETF, Issuer, computeTotalCost, INDEX_LABELS } from "@/lib/etfs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  TrendingUp, Shield, RefreshCw, Globe, Zap, Award,
  Check, X, Info, ArrowUpRight, BarChart2, Search,
  ChevronDown, Star,
} from "lucide-react";

const ALL_ISSUERS  = issuersData as Issuer[];

type BrokerLight = {
  slug: string; name: string; fees: Record<string, { min: number; max: number | null; type: string; amount: number }[]>; currency_fee: number; accounts: string[]; score_overall: number;
};

// ── Logo helpers ──────────────────────────────────────────────────────────────
const ISSUER_DOMAINS: Record<string, string> = {
  amundi:   "amundi.com",
  ishares:  "ishares.com",
  vanguard: "vanguard.com",
  invesco:  "invesco.com",
  lyxor:    "lyxor.com",
  vaneck:   "vaneck.com",
};
const BROKER_DOMAINS: Record<string, string> = {
  "bourse-direct":       "boursedirect.fr",
  "fortuneo":            "fortuneo.fr",
  "xtb":                 "xtb.com",
  "trade-republic":      "traderepublic.com",
  "interactive-brokers": "interactivebrokers.com",
  "saxo-banque":         "home.saxo",
  "degiro":              "degiro.fr",
  "boursobank":          "boursobank.com",
  "etoro":               "etoro.com",
  "linxea":              "linxea.com",
};

function Logo({ domain, name, size = 28 }: { domain?: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const initials = name.slice(0, 2).toUpperCase();
  if (!domain || err) {
    return (
      <div style={{ width: size, height: size, borderRadius: 7, backgroundColor: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: size * 0.32, fontWeight: 700, color: "var(--accent-text)" }}>{initials}</span>
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 7, backgroundColor: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://logo.clearbit.com/${domain}`} alt={name} width={size * 0.65} height={size * 0.65} onError={() => setErr(true)} style={{ objectFit: "contain" }} />
    </div>
  );
}

// ── Index navigation ──────────────────────────────────────────────────────────
const INDICES = [
  { slug: "all",         label: "Tous les ETF",   icon: BarChart2 },
  { slug: "msci-world",  label: "MSCI World",     icon: Globe },
  { slug: "sp500",       label: "S&P 500",        icon: TrendingUp },
  { slug: "nasdaq100",   label: "Nasdaq 100",     icon: Zap },
  { slug: "ftse-all-world", label: "FTSE All-World", icon: Globe },
  { slug: "msci-em",     label: "Émergents",      icon: TrendingUp },
  { slug: "msci-europe", label: "Europe",         icon: Globe },
  { slug: "euro-bonds",  label: "Obligations",    icon: Shield },
  { slug: "gold",        label: "Or",             icon: Award },
];

// ── Cost bar chart tooltip ────────────────────────────────────────────────────
function CostTooltip({ active, payload }: { active?: boolean; payload?: { payload: { broker: string; total: number; ter: number; brokerage: number; fx: number; isBest: boolean } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", fontSize: 12, minWidth: 180 }}>
      <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{d.broker}</p>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: "var(--text-faint)" }}>TER</span><span style={{ color: "var(--text-muted)" }}>{d.ter.toFixed(2)}€</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: "var(--text-faint)" }}>Courtage</span><span style={{ color: "var(--text-muted)" }}>{d.brokerage.toFixed(2)}€</span></div>
      {d.fx > 0 && <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: "var(--text-faint)" }}>Change</span><span style={{ color: "var(--text-muted)" }}>{d.fx.toFixed(2)}€</span></div>}
      <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, color: "var(--text)" }}>Total/an</span>
        <span style={{ fontWeight: 700, color: d.isBest ? "var(--accent)" : "var(--text)" }}>{d.total.toFixed(2)}€</span>
      </div>
    </div>
  );
}

// ── ETF Card ──────────────────────────────────────────────────────────────────
function ETFCard({
  etf, selectedBroker, orderAmount, ordersPerMonth, onSelect, isSelected, brokers,
}: {
  etf: ETF;
  selectedBroker: string;
  orderAmount: number;
  ordersPerMonth: number;
  onSelect: (isin: string) => void;
  isSelected: boolean;
  brokers: BrokerLight[];
}) {
  const issuer = ALL_ISSUERS.find((i) => i.id === etf.issuer);

  const costBreakdown = useMemo(() => {
    if (!selectedBroker) return null;
    return computeTotalCost(etf, selectedBroker, brokers, orderAmount, ordersPerMonth);
  }, [etf, selectedBroker, orderAmount, ordersPerMonth, brokers]);

  // Cost for all brokers that carry this ETF
  const allCosts = useMemo(() =>
    etf.available_at.map((slug) => {
      const broker = brokers.find((b) => b.slug === slug);
      const cost   = computeTotalCost(etf, slug, brokers, orderAmount, ordersPerMonth);
      return { slug, name: broker?.name || slug, ...cost };
    }).filter((c) => c.total !== undefined).sort((a, z) => (a.total ?? 999) - (z.total ?? 999)),
  [etf, orderAmount, ordersPerMonth, brokers]);

  const bestCombo = allCosts[0];

  return (
    <div
      onClick={() => onSelect(etf.isin)}
      style={{
        borderRadius: 14,
        backgroundColor: "var(--card)",
        border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
        padding: "18px 20px",
        cursor: "pointer",
        transition: "all 200ms ease",
        boxShadow: isSelected ? "0 0 0 3px rgba(10,155,130,0.1)" : "var(--shadow-xs)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        <Logo domain={issuer ? ISSUER_DOMAINS[issuer.id] : undefined} name={issuer?.name || etf.issuer} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-sora)" }}>{etf.ticker}</span>
            {etf.pea_eligible && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5, color: "var(--accent-text)", backgroundColor: "var(--accent-light)", border: "1px solid var(--accent-mid)" }}>PEA</span>
            )}
            {etf.hedged && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5, color: "var(--warning)", backgroundColor: "var(--warning-bg)" }}>Hedgé</span>
            )}
            <span className="tag" style={{ fontSize: 10 }}>{etf.replication === "physical" ? "Physique" : "Synthétique"}</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{etf.name}</p>
        </div>
        {/* TER badge */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-sora)", color: etf.ter <= 0.15 ? "var(--positive)" : etf.ter <= 0.30 ? "var(--warning)" : "var(--negative)" }}>
            {etf.ter}%
          </span>
          <p style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 1 }}>TER/an</p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {[
          { label: "Encours",    value: `${etf.aum_bn}Md€` },
          { label: "Dividende",  value: etf.dividend === "accumulating" ? "Capitalisant" : etf.dividend === "distributing" ? "Distribuant" : "—" },
          { label: "Devise",     value: etf.currency },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: "8px 10px", borderRadius: 8, backgroundColor: "var(--bg)", border: "1px solid var(--border-light)" }}>
            <p style={{ fontSize: 10, color: "var(--text-faint)" }}>{label}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Best combo */}
      {bestCombo && (
        <div style={{
          borderRadius: 9, padding: "10px 12px",
          backgroundColor: "var(--accent-light)",
          border: "1px solid var(--accent-mid)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: costBreakdown ? 10 : 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Star size={12} fill="var(--accent)" color="var(--accent)" />
            <span style={{ fontSize: 11, color: "var(--accent-text)", fontWeight: 600 }}>Combo optimal</span>
            <a href={`/comparatif/go/${bestCombo.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--accent-text)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: "2px" }}>{bestCombo.name}</a>
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-sora)" }}>
            {bestCombo.total?.toFixed(0)}€/an
          </span>
        </div>
      )}

      {/* Selected broker cost */}
      {costBreakdown && selectedBroker && (
        <div style={{
          borderRadius: 9, padding: "10px 12px",
          backgroundColor: "var(--bg)",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Coût avec {brokers.find(b => b.slug === selectedBroker)?.name}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-sora)" }}>
            {costBreakdown.total.toFixed(0)}€/an
          </span>
        </div>
      )}
    </div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function ETFDetail({ etf, orderAmount, ordersPerMonth, brokers }: { etf: ETF; orderAmount: number; ordersPerMonth: number; brokers: BrokerLight[] }) {
  const issuer = ALL_ISSUERS.find((i) => i.id === etf.issuer);

  const chartData = useMemo(() => {
    const costs = etf.available_at.map((slug) => {
      const broker = brokers.find((b) => b.slug === slug);
      const cost   = computeTotalCost(etf, slug, brokers, orderAmount, ordersPerMonth);
      return {
        broker:    broker?.name.replace("Interactive Brokers", "IBKR") || slug,
        total:     cost?.total ?? 0,
        ter:       cost?.ter ?? 0,
        brokerage: cost?.brokerage ?? 0,
        fx:        cost?.fx ?? 0,
        isBest:    false,
      };
    }).sort((a, z) => a.total - z.total);

    if (costs.length) costs[0].isBest = true;
    return costs;
  }, [etf, orderAmount, ordersPerMonth]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ETF info header */}
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
          <Logo domain={issuer ? ISSUER_DOMAINS[issuer.id] : undefined} name={issuer?.name || etf.issuer} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{etf.ticker}</h2>
              <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{etf.isin}</span>
              {etf.pea_eligible && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, color: "var(--accent-text)", backgroundColor: "var(--accent-light)" }}>PEA éligible</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{etf.name}</p>
            {/* Lien KID/DICI via JustETF */}
            <a
              href={`https://www.justetf.com/fr/etf-profile.html?isin=${etf.isin}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 11, color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}
            >
              <ArrowUpRight size={11} />
              Fiche JustETF &amp; documents KID
            </a>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-sora)", color: etf.ter <= 0.15 ? "var(--positive)" : etf.ter <= 0.30 ? "var(--warning)" : "var(--negative)" }}>
              {etf.ter}%
            </span>
            <p style={{ fontSize: 10, color: "var(--text-faint)" }}>TER annuel</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{etf.description}</p>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-2 mt-3.5">
          {[
            { label: "Indice suivi",    value: etf.index },
            { label: "Encours",         value: `${etf.aum_bn} Md€` },
            { label: "Réplication",     value: etf.replication === "physical" ? "Physique" : "Synthétique" },
            { label: "Dividendes",      value: etf.dividend === "accumulating" ? "Capitalisant" : etf.dividend === "distributing" ? "Distribuant" : "—" },
            { label: "Devise ETF",      value: etf.currency },
            { label: "Domicile",        value: etf.domicile === "IE" ? "Irlande" : "Luxembourg" },
            { label: "Couverture change", value: etf.hedged ? "Oui (EUR)" : "Non" },
            { label: "Création",        value: `${etf.inception_year}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: "10px 12px", borderRadius: 9, backgroundColor: "var(--bg)", border: "1px solid var(--border-light)" }}>
              <p style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 3 }}>{label}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cost comparison chart */}
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            Coût total réel par courtier
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-faint)" }}>
            TER + frais de courtage + frais de change annualisés — {orderAmount}€ × {ordersPerMonth}/mois
          </p>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 40, top: 4, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="var(--border-light)" />
            <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
            <YAxis type="category" dataKey="broker" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={72} />
            <Tooltip content={<CostTooltip />} cursor={{ fill: "var(--border-light)" }} />
            <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={14} label={{ position: "right", fontSize: 10, fill: "var(--text-faint)", formatter: (v: number) => `${v.toFixed(0)}€` }}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.isBest ? "#4F7BE8" : "#B0B0B0"} fillOpacity={entry.isBest ? 1 : 0.5} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Best combo callout */}
        {chartData[0] && (
          <div style={{
            marginTop: 14, padding: "12px 16px", borderRadius: 10,
            background: "linear-gradient(135deg, #4F7BE8 0%, #2E5BBF 100%)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 2 }}>Combo optimal pour ce fonds</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {etf.ticker} chez {chartData[0].broker}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "var(--font-sora)", lineHeight: 1 }}>
                {chartData[0].total.toFixed(0)}€
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>/ an</p>
            </div>
          </div>
        )}
      </div>

      {/* Issuer info */}
      {issuer && (
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
            <Logo domain={ISSUER_DOMAINS[issuer.id]} name={issuer.name} size={36} />
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{issuer.name}</h3>
              <p style={{ fontSize: 11, color: "var(--text-faint)" }}>{issuer.etf_count} ETF · {issuer.aum_total_bn.toLocaleString("fr-FR")} Md€ d'encours</p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>{issuer.description}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {issuer.strengths.map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Check size={11} color="var(--positive)" />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ETFPageClient() {
  const [allEtfs, setAllEtfs]           = useState<ETF[]>([]);
  const [allBrokers, setAllBrokers]     = useState<BrokerLight[]>([]);
  const [loadingData, setLoadingData]   = useState(true);
  const [activeIndex, setActiveIndex]   = useState("all");
  const [search, setSearch]             = useState("");
  const [filterPEA, setFilterPEA]       = useState(false);
  const [selectedBroker, setSelectedBroker] = useState("");
  const [orderAmount, setOrderAmount]   = useState(300);
  const [ordersPerMonth, setOrdersPerMonth] = useState(1);
  const [selectedETF, setSelectedETF]   = useState<string | null>(null);

  // Charger ETFs et courtiers depuis Supabase via API
  useEffect(() => {
    Promise.all([
      fetch("/api/etfs").then(r => r.json()).catch(() => []),
      fetch("/api/brokers").then(r => r.json()).catch(() => []),
    ]).then(([etfs, brokers]) => {
      setAllEtfs(Array.isArray(etfs) ? etfs : []);
      setAllBrokers(Array.isArray(brokers) ? brokers : []);
      setLoadingData(false);
    });
  }, []);
  const [sortBy, setSortBy]             = useState<"ter" | "aum" | "total_cost">("ter");

  const filtered = useMemo(() => {
    let list = [...allEtfs];
    if (activeIndex !== "all") list = list.filter((e) => e.index_slug === activeIndex);
    if (filterPEA) list = list.filter((e) => e.pea_eligible);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) =>
        e.ticker.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.issuer.toLowerCase().includes(q) ||
        e.index.toLowerCase().includes(q)
      );
    }
    list.sort((a, z) => {
      if (sortBy === "ter")  return a.ter - z.ter;
      if (sortBy === "aum")  return z.aum_bn - a.aum_bn;
      if (sortBy === "total_cost" && selectedBroker) {
        const ca = computeTotalCost(a, selectedBroker, allBrokers, orderAmount, ordersPerMonth)?.total ?? 999;
        const cz = computeTotalCost(z, selectedBroker, allBrokers, orderAmount, ordersPerMonth)?.total ?? 999;
        return ca - cz;
      }
      return a.ter - z.ter;
    });
    return list;
  }, [activeIndex, filterPEA, search, sortBy, selectedBroker, orderAmount, ordersPerMonth, allEtfs, allBrokers]);

  const detailETF = selectedETF ? allEtfs.find((e) => e.isin === selectedETF) : null;

  if (loadingData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 13, color: "var(--text-faint)" }}>Chargement des ETF…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh", width: "100%", maxWidth: "100%", overflow: "hidden" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(180deg, var(--accent-light) 0%, var(--bg) 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "32px 16px 24px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 12 }}>
            Trouvez le meilleur ETF au<br />
            <span style={{ color: "var(--accent)" }}>coût total réel</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 0 }}>
            TER + frais de courtage + frais de change calculés ensemble. Le seul comparateur qui agrège les deux couches.
          </p>
        </div>
      </div>

      {/* ── Contenu principal ── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 pb-16">

        {/* Index selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none">
          {INDICES.map(({ slug, label, icon: Icon }) => {
            const active = activeIndex === slug;
            return (
              <button key={slug} onClick={() => setActiveIndex(slug)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 100, whiteSpace: "nowrap",
                fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer",
                backgroundColor: active ? "var(--accent)" : "var(--surface)",
                color: active ? "#fff" : "var(--text-muted)",
                border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                transition: "all 150ms ease",
                flexShrink: 0,
              }}>
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Controls row */}
        <div style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "16px 20px",
          display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
          marginBottom: 20,
        }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
            <input type="text" placeholder="MSCI World, CW8, Amundi..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
          </div>

          {/* PEA filter */}
          <button onClick={() => setFilterPEA(!filterPEA)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: 9, cursor: "pointer",
            fontSize: 13, fontWeight: 500,
            backgroundColor: filterPEA ? "var(--accent-light)" : "transparent",
            color: filterPEA ? "var(--accent-text)" : "var(--text-muted)",
            border: `1.5px solid ${filterPEA ? "var(--accent)" : "var(--border)"}`,
            transition: "all 150ms ease",
          }}>
            {filterPEA ? <Check size={13} /> : <Shield size={13} />}
            PEA uniquement
          </button>

          {/* Broker selector */}
          <div style={{ position: "relative" }}>
            <select
              value={selectedBroker}
              onChange={(e) => setSelectedBroker(e.target.value)}
              style={{ paddingRight: 32, minWidth: 180, appearance: "none", WebkitAppearance: "none" }}
            >
              <option value="">Courtier (optionnel)</option>
              {allBrokers.map((b) => (
                <option key={b.slug} value={b.slug}>{b.name}</option>
              ))}
            </select>
            <ChevronDown size={13} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }} />
          </div>

          {/* Sort */}
          <div style={{ position: "relative" }}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} style={{ paddingRight: 32, minWidth: 160, appearance: "none", WebkitAppearance: "none" }}>
              <option value="ter">Trier : TER</option>
              <option value="aum">Trier : Encours</option>
              {selectedBroker && <option value="total_cost">Trier : Coût total</option>}
            </select>
            <ChevronDown size={13} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Simulation params */}
        <div style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14, padding: "16px 20px",
          marginBottom: 24,
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Info size={13} color="var(--accent)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Simulation :</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Montant/ordre</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-sora)", minWidth: 52 }}>{orderAmount}€</span>
            <input type="range" min={50} max={2000} step={50} value={orderAmount} onChange={(e) => setOrderAmount(Number(e.target.value))} className="w-16 sm:w-24" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Ordres/mois</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-sora)", minWidth: 16 }}>{ordersPerMonth}</span>
            <input type="range" min={1} max={12} step={1} value={ordersPerMonth} onChange={(e) => setOrdersPerMonth(Number(e.target.value))} className="w-14 sm:w-20" />
          </div>
          <span className="text-xs text-muted-foreground ml-auto hidden sm:block">
            Volume annuel : {(orderAmount * ordersPerMonth * 12).toLocaleString("fr-FR")}€
          </span>
        </div>

        {/* Main layout: grid + detail panel */}
        <div className={`grid gap-5 items-start ${detailETF ? "lg:grid-cols-[1fr_400px]" : ""}`}>

          {/* ETF Grid */}
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: "var(--text-faint)" }}>
                {filtered.length} ETF{filtered.length !== 1 ? "s" : ""}
                {activeIndex !== "all" ? ` · ${INDEX_LABELS[activeIndex]}` : ""}
              </p>
              {selectedETF && (
                <button onClick={() => setSelectedETF(null)} className="btn-ghost" style={{ fontSize: 12 }}>
                  <X size={12} /> Fermer le détail
                </button>
              )}
            </div>
            <div className={`grid gap-3 ${detailETF ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
              {filtered.map((etf) => (
                <React.Fragment key={etf.isin}>
                  <ETFCard
                    etf={etf}
                    selectedBroker={selectedBroker}
                    orderAmount={orderAmount}
                    ordersPerMonth={ordersPerMonth}
                    onSelect={(isin) => setSelectedETF(selectedETF === isin ? null : isin)}
                    isSelected={selectedETF === etf.isin}
                    brokers={allBrokers}
                  />
                  {/* Mobile uniquement : fiche détail s'ouvre en ligne sous la carte */}
                  {selectedETF === etf.isin && detailETF && (
                    <div className="lg:hidden" style={{ padding: "4px 0" }}>
                      <ETFDetail etf={detailETF} orderAmount={orderAmount} ordersPerMonth={ordersPerMonth} brokers={allBrokers} />
                    </div>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <div style={{ gridColumn: "1/-1", padding: "48px", textAlign: "center", borderRadius: 14, border: "1px dashed var(--border)" }}>
                  <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Aucun ETF ne correspond à ces critères</p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop uniquement : panneau latéral sticky */}
          {detailETF && (
            <div className="hidden lg:block" style={{ position: "sticky", top: 80, maxHeight: "calc(100vh - 100px)", overflowY: "auto", paddingRight: 4 }}>
              <ETFDetail etf={detailETF} orderAmount={orderAmount} ordersPerMonth={ordersPerMonth} brokers={allBrokers} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}