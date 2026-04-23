"use client";

import { useState, useMemo } from "react";
import { Broker, computeOverallScore, scoreColor, scoreBg } from "@/lib/brokers";
import { FireDCACalculator } from "./FireDCACalculator";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell,
} from "recharts";
import {
  Check, X, Info, Star, Globe, Shield, TrendingUp,
  CreditCard, BarChart2, ArrowUpRight, Zap, Award,
} from "lucide-react";
const CAT_LABELS: Record<string, string> = {
  broker:    "Courtier",
  bank:      "Banque",
  neobanque: "Néobanque",
  insurance: "Assurance-vie",
  crypto:    "Crypto",
  cfd:       "CFD FX",
  scpi:      "SCPI",
};

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  broker:    { bg: "var(--tint-blue)",   color: "#2563EB" },
  bank:      { bg: "var(--tint-green)",  color: "var(--accent)" },
  neobanque: { bg: "var(--tint-green)",  color: "#059669" },
  insurance: { bg: "var(--tint-purple)", color: "#7C3AED" },
  crypto:    { bg: "var(--tint-amber)",  color: "#D97706" },
  cfd:       { bg: "var(--tint-rose)",   color: "#DB2777" },
  scpi:      { bg: "var(--tint-rose)",   color: "#DB2777" },
};

// ── Logo helpers (same multi-source as BrokerCard) ────────────────────────
const LOGO_DOMAINS: Record<string, string> = {
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
  "ig":                  "ig.com",
  "wh-selfinvest":       "whselfinvest.fr",
  "binance":             "binance.com",
  "kraken":              "kraken.com",
  "coinbase":            "coinbase.com",
  "bitpanda":            "bitpanda.com",
  "bitvavo":             "bitvavo.com",
  "revolut":             "revolut.com",
  "n26":                 "n26.com",
  "wise":                "wise.com",
  "swissquote":          "swissquote.com",
  "swissborg":           "swissborg.com",
  "okx":                 "okx.com",
  "pepperstone":         "pepperstone.com",
  "capital-com":         "capital.com",
  "cmc-markets":         "cmcmarkets.com",
  "bnp-paribas":         "bnpparibas.com",
  "hello-bank":          "hellobank.fr",
  "bforbank":            "bforbank.com",
  "monabanq":            "monabanq.com",
  "lydia":               "lydia.app",
  "qonto":               "qonto.com",
  "green-got":           "green-got.com",
  "helios":              "helios.do",
  "yomoni":              "yomoni.fr",
  "easybourse":          "easybourse.com",
};

function BrokerLogo({ broker, size = 52 }: { broker: Broker; size?: number }) {
  const manualLogoUrl = (broker as any).logo_url;
  const domain = LOGO_DOMAINS[broker.slug];
  const initialSrc = manualLogoUrl || (domain ? `https://logo.clearbit.com/${domain}` : "");
  const [src, setSrc] = useState(initialSrc);
  const [attempt, setAttempt] = useState(0);

  if (!src || attempt >= 2) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 14, flexShrink: 0,
        backgroundColor: "var(--accent-light)",
        border: "1px solid var(--accent-mid)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 800, color: "var(--accent-text)", fontFamily: "var(--font-sora)" }}>
          {broker.name.slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 14, flexShrink: 0,
      backgroundColor: "var(--card)", border: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={broker.name} width={size * 0.65} height={size * 0.65}
        onError={() => {
          if (attempt === 0 && domain) { setSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`); setAttempt(1); }
          else { setSrc(""); setAttempt(2); }
        }}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

// ── Featured Icon (UntitledUI-inspired) ──────────────────────────────────
function FeaturedIcon({ icon: Icon, color = "brand", size = "md" }: {
  icon: React.ElementType;
  color?: "brand" | "success" | "warning" | "error" | "gray";
  size?: "sm" | "md" | "lg";
}) {
  const s = size === "sm" ? 32 : size === "lg" ? 52 : 40;
  const iconS = size === "sm" ? 14 : size === "lg" ? 22 : 18;
  const colors = {
    brand:   { bg: "var(--accent-light)", border: "var(--accent-mid)", icon: "var(--accent)" },
    success: { bg: "var(--positive-bg)",  border: "#A7F3D0",           icon: "var(--positive)" },
    warning: { bg: "var(--warning-bg)",   border: "#FDE68A",           icon: "var(--warning)" },
    error:   { bg: "var(--negative-bg)",  border: "#FECACA",           icon: "var(--negative)" },
    gray:    { bg: "var(--bg)",           border: "var(--border)",     icon: "var(--text-muted)" },
  }[color];
  return (
    <div style={{
      width: s, height: s, borderRadius: s * 0.3, flexShrink: 0,
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={iconS} color={colors.icon} />
    </div>
  );
}

// ── Score Badge ───────────────────────────────────────────────────────────
function ScoreBadge({ value }: { value: number }) {
  const color = scoreColor(value);
  const bg    = scoreBg(value);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 12px", borderRadius: 100,
      backgroundColor: bg, border: `1px solid ${color}22`,
    }}>
      <span style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "var(--font-sora)", lineHeight: 1 }}>
        {value.toFixed(1)}
      </span>
      <span style={{ fontSize: 12, color, fontWeight: 500 }}>/10</span>
    </div>
  );
}

// ── Radar Chart (UntitledUI-inspired) ────────────────────────────────────
function BrokerRadarChart({ broker }: { broker: Broker }) {
  const scoreEnvergure = (broker as any).score_envergure ?? 0;
  const scoreSupport   = (broker as any).score_support   ?? 0;

  const data = [
    { subject: "Frais",     value: broker.score_fees,        fullMark: 10 },
    { subject: "Fiabilité", value: broker.score_reliability, fullMark: 10 },
    { subject: "Interface", value: broker.score_ux,          fullMark: 10 },
    { subject: "Envergure", value: scoreEnvergure > 0 ? scoreEnvergure : Math.min((broker.accounts.length / 4) * 10 + 5, 10), fullMark: 10 },
    { subject: "Marchés",   value: Math.min((broker.markets_available?.length || 4) / 1.2, 10), fullMark: 10 },
    { subject: "Support",   value: scoreSupport > 0 ? scoreSupport : broker.score_reliability - 0.5, fullMark: 10 },
  ];

  return (
    <div style={{
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "20px",
      overflow: "hidden",
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <FeaturedIcon icon={BarChart2} color="brand" size="sm" />
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>Score détaillé</h2>
          <p style={{ fontSize: 12, color: "var(--text-faint)" }}>6 critères analysés</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: "var(--text-muted)", fontWeight: 500 }}
            tickLine={false}
          />
          <Radar
            dataKey="value"
            stroke="#4F7BE8"
            strokeWidth={2}
            fill="#4F7BE8"
            fillOpacity={0.15}
          />
          <Tooltip
            formatter={(v: number) => [`${v.toFixed(1)}/10`, "Score"]}
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontSize: 12,
              color: "var(--text)",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Fee comparison bar chart ──────────────────────────────────────────────
function FeeComparisonChart({ broker, allBrokers }: { broker: Broker; allBrokers: Broker[] }) {
  const cat = broker.category;

  // Estimation adaptée par catégorie — retourne null si pas de donnée
  const estimate = (b: Broker): number | null => {
    const fees = (b.fees || {}) as any;
    switch (b.category as string) {
      case "broker": {
        // Frais courtage annuels : 300€ × 4 ordres/mois × 12 sur marché FR
        const tiers = b.fees?.FR;
        if (!tiers?.length) return null;
        const tier = tiers.find((f) => f.min <= 300 && (f.max === null || f.max >= 300));
        if (!tier) return null;
        const perOrder = tier.type === "flat" ? tier.amount : (300 * tier.amount) / 100;
        return Math.round(perOrder * 4 * 12);
      }
      case "neobanque": {
        // Abonnement annuel (plan standard)
        const montant = fees.standard?.montant;
        if (montant == null) return null;
        return Math.round(montant * 12);
      }
      case "bank": {
        // Frais de tenue de compte annuels
        const tc = fees.tenue_compte?.montant;
        if (tc != null) return Math.round(tc);
        if (b.custody_fee != null && b.custody_fee >= 0) return Math.round(b.custody_fee);
        return null;
      }
      case "insurance": {
        // Frais gestion UC annuels sur 10 000€ (simulation)
        const uc = fees.gestion_uc?.montant;
        if (uc != null) return Math.round(10000 * uc / 100);
        if (b.custody_fee > 0) return Math.round(b.custody_fee);
        return null;
      }
      case "crypto": {
        // Frais maker annuels sur 1 000€/mois
        const maker = fees.maker?.montant ?? fees.trading_spot?.montant;
        if (maker != null) return Math.round(1000 * maker / 100 * 12);
        return null;
      }
      case "cfd": {
        // Spread forex annualisé indicatif (en pips × 10 000 positions/an)
        const spread = fees.spread_forex?.montant ?? fees.spread_indices?.montant;
        if (spread != null) return Math.round(spread * 10);
        return null;
      }
      default:
        return null;
    }
  };

  // Libellé de l'axe X selon catégorie
  const xLabel: Record<string, string> = {
    broker:    "Frais courtage/an · 300€ × 4 ordres/mois",
    neobanque: "Abonnement annuel",
    bank:      "Frais tenue de compte/an",
    insurance: "Frais gestion UC/an · base 10 000€",
    crypto:    "Frais trading/an · 1 000€/mois",
    cfd:       "Spread indicatif annualisé",
  };

  // Filtrer la même catégorie uniquement, exclure les valeurs nulles
  const data = allBrokers
    .filter((b) => b.category === cat)
    .map((b) => ({
      name: b.name.replace("Interactive Brokers", "IBKR").replace("Bourse Direct", "B. Direct"),
      value: estimate(b),
      isCurrent: b.slug === broker.slug,
    }))
    .filter((d) => d.value !== null && d.value !== undefined)
    .sort((a, z) => (a.value ?? 0) - (z.value ?? 0)) as { name: string; value: number; isCurrent: boolean }[];

  // Hauteur dynamique : min 160px, 32px par barre
  const chartHeight = Math.max(160, data.length * 32);

  // Largeur YAxis dynamique : basée sur la longueur max des noms
  const maxNameLen = Math.max(...data.map((d) => d.name.length), 8);
  const yWidth = Math.min(Math.max(maxNameLen * 6.5, 64), 140);

  if (data.length === 0) return null;

  return (
    <div style={{
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "20px",
      overflow: "hidden",
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <FeaturedIcon icon={CreditCard} color="brand" size="sm" />
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>Comparaison des frais</h2>
          <p style={{ fontSize: 12, color: "var(--text-faint)" }}>
            {xLabel[cat] ?? "Estimation annuelle"} — {CAT_LABELS[cat] ?? cat}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 32, top: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "var(--text-faint)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}€`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            width={yWidth}
          />
          <Tooltip
            formatter={(v: number) => [`${v}€`, "Estimation annuelle"]}
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontSize: 12,
              color: "var(--text)",
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isCurrent ? "#4F7BE8" : "rgba(59,130,246,0.18)"}
                fillOpacity={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Légende inline — nom de l'intermédiaire courant en bleu */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "#4F7BE8", flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
          {broker.name} — intermédiaire consulté
        </span>
      </div>
    </div>
  );
}

// ── Score breakdown row ────────────────────────────────────────────────────
function ScoreRow({ label, value, description }: { label: string; value: number; description: string }) {
  const color = scoreColor(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border-light)", minWidth: 0 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</p>
        <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{description}</p>
      </div>
      <div style={{ width: 80, minWidth: 80, height: 5, borderRadius: 3, backgroundColor: "var(--border)", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ width: `${value * 10}%`, height: "100%", borderRadius: 3, backgroundColor: color }} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color, fontFamily: "var(--font-sora)", width: 32, textAlign: "right", flexShrink: 0 }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

// ── Fee tier table ────────────────────────────────────────────────────────
function FeeTier({ tiers, market }: { tiers: { min: number; max: number | null; type: string; amount: number }[]; market: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)", marginBottom: 8 }}>
        {market === "FR" ? "France / Euronext" : market === "EU" ? "Europe" : "USA / NYSE & NASDAQ"}
      </p>
      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", width: "100%" }}>
        <table style={{ width: "100%", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th>Tranche</th>
              <th>Type</th>
              <th style={{ textAlign: "right" }}>Frais</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, i) => (
              <tr key={i}>
                <td style={{ fontSize: 12 }}>
                  {tier.min.toLocaleString("fr-FR")}€
                  {tier.max ? ` → ${tier.max.toLocaleString("fr-FR")}€` : " et +"}
                </td>
                <td><span className="tag" style={{ fontSize: 10 }}>{tier.type === "flat" ? "Fixe" : "% ordre"}</span></td>
                <td style={{ textAlign: "right", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                  {tier.type === "flat" ? `${tier.amount}€` : `${tier.amount}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main client component ─────────────────────────────────────────────────
export function BrokerDetailClient({ broker: rawBroker, allBrokers }: { broker: Broker; allBrokers: Broker[] }) {
  const [activeMarket, setActiveMarket] = useState<"FR" | "EU" | "US">("FR");

  // Disclaimer conditionnel par broker
  const isPepperstone = rawBroker.slug === 'pepperstone';
  const disclaimerFontSize = isPepperstone ? 13 : 12;
  const disclaimerColor = isPepperstone ? "var(--text)" : "var(--text-faint)";

  // Auto-calculate scores from real data
  const autoScores = useMemo(() => {
    const { calculateAutoScores } = require("@/lib/auto-score");
    return calculateAutoScores(rawBroker, allBrokers);
  }, [rawBroker, allBrokers]);

  // Merge auto-scores with broker (auto-scores override only if current score is 0)
  const broker = useMemo(() => {
    const merged = {
      ...rawBroker,
      score_fees:        rawBroker.score_fees        > 0 ? rawBroker.score_fees        : autoScores.score_fees,
      score_reliability: rawBroker.score_reliability > 0 ? rawBroker.score_reliability : autoScores.score_reliability,
      score_ux:          rawBroker.score_ux          > 0 ? rawBroker.score_ux          : autoScores.score_ux,
    };
    // score_overall recalculé systématiquement à partir des critères réels
    return { ...merged, score_overall: computeOverallScore(merged as Broker) };
  }, [rawBroker, autoScores]);

  // Uniquement les clés dont la valeur est un tableau de paliers (FR/EU/US)
  // Les clés metadata (spread_forex, overnight…) sont des objets/booléens — on les exclut
  const markets = (Object.entries(broker.fees || {}) as [string, unknown][])
    .filter(([, v]) => Array.isArray(v))
    .map(([k]) => k) as ("FR" | "EU" | "US")[];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 12px 48px", width: "100%", boxSizing: "border-box", overflowX: "hidden" }}>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        padding: "20px 16px",
        marginBottom: 24,
      }}>
        {/* Row 1: logo + name */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
          <BrokerLogo broker={broker} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)", wordBreak: "break-word", margin: "0 0 6px 0", lineHeight: 1.2 }}>
              {broker.name}
            </h1>
            {/* Regulation badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {broker.regulation?.map((r) => (
                <span key={r} style={{
                  padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 700,
                  color: "var(--accent-text)", backgroundColor: "var(--accent-light)",
                  border: "1px solid var(--accent-mid)",
                }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: score + trustpilot inline */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          <ScoreBadge value={broker.score_overall} />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={12}
                fill={s <= Math.round(broker.trustpilot_score) ? "#F59E0B" : "transparent"}
                color="#F59E0B"
              />
            ))}
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginLeft: 2 }}>
              {broker.trustpilot_score}/5
            </span>
            <span style={{ fontSize: 11, color: "var(--text-faint)", marginLeft: 1 }}>
              ({broker.trustpilot_count.toLocaleString("fr-FR")} avis)
            </span>
          </div>
          {(broker as any).is_partner && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 6, backgroundColor: "#dbeafe", border: "1px solid #93c5fd" }}>
              <Award size={11} color="#2563eb" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#2563eb" }}>Partenaire</span>
            </div>
          )}
        </div>

        {/* Row 2b: badges catégories */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {/* Catégorie principale — style coloré */}
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
            color:           CAT_COLORS[broker.category]?.color || "var(--accent)",
            backgroundColor: CAT_COLORS[broker.category]?.bg    || "var(--accent-light)",
            border: `1px solid ${CAT_COLORS[broker.category]?.color || "var(--accent)"}33`,
            display: "inline-flex", alignItems: "center", lineHeight: "1.4",
          }}>
            {CAT_LABELS[broker.category] || broker.category}
          </span>
          {/* Catégories supplémentaires */}
          {((broker as any).categories || [])
            .filter((c: string) => c !== broker.category)
            .map((c: string) => (
              <span key={c} style={{
                fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                color: CAT_COLORS[c]?.color || "var(--accent)",
                backgroundColor: CAT_COLORS[c]?.bg || "var(--accent-light)",
                border: `1px solid ${CAT_COLORS[c]?.color || "var(--accent)"}33`,
                lineHeight: "1.4",
              }}>
                {CAT_LABELS[c] || c}
              </span>
            ))
          }
        </div>

        {/* Row 3: tagline */}
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.55 }}>{broker.tagline}</p>

        {/* Row 4: account tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {broker.accounts.map((acc) => (
            <span key={acc} className="tag-accent" style={{ fontSize: 11 }}>{acc}</span>
          ))}
          {broker.deposit_minimum === 0 && (
            <span className="tag" style={{ fontSize: 11, color: "var(--positive)", backgroundColor: "var(--positive-bg)" }}>
              Dépôt 0€
            </span>
          )}
          {broker.founded && (
            <span className="tag" style={{ fontSize: 11 }}>Fondé en {broker.founded}</span>
          )}
        </div>

        {/* Row 5: CTA buttons — flex row, each takes equal space, stacks naturally */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href={`/comparatif/go/${broker.slug}`} target="_blank" rel="noopener noreferrer"
            className="btn-primary"
            style={{ flex: "1 1 140px", padding: "11px 16px", fontSize: 13, gap: 6, justifyContent: "center", textAlign: "center" }}>
            Ouvrir un compte
            <ArrowUpRight size={13} />
          </a>
          {(broker as any).demo_url && (
            <a href={`/comparatif/go/${broker.slug}/demo?src=demo-detail`} target="_blank" rel="noopener noreferrer"
              style={{ flex: "1 1 120px", padding: "11px 16px", fontSize: 13, gap: 6, borderRadius: 10, border: "1px solid var(--border)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontWeight: 600 }}>
              Compte démo
              <ArrowUpRight size={13} />
            </a>
          )}
        </div>

        {/* IBKR note */}
        {broker.slug === "interactive-brokers" && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, backgroundColor: "var(--accent-light)", border: "1px solid var(--accent-mid)", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: 12, color: "var(--accent-text)", lineHeight: 1.6, margin: 0 }}>
              <strong>Interface ProRealTime (PRT)</strong>{" "}disponible avec ce compte. Notre lien d&apos;affiliation crée un compte IBKR accessible via l&apos;app PRT — les frais et solutions restent ceux d&apos;Interactive Brokers, l&apos;interface est celle de ProRealTime.
            </p>
          </div>
        )}
      </div>
      {/* ── 4 stat cards (category-aware) ────────────────────────── */}
      <div style={{
        display: "grid",
        gap: 12,
        marginBottom: 24,
      }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {((() => {
          const cat = broker.category;
          const fees = (broker.fees || {}) as any;
          if (cat === "crypto") {
            return [
              { icon: TrendingUp, label: "Frais trading", value: fees.trading_spot?.montant != null ? `${fees.trading_spot.montant}%` : fees.maker?.montant != null ? `${fees.maker.montant}%` : "—", sub: "spot", color: "brand" as const },
              { icon: Zap,        label: "Maker / Taker", value: fees.maker?.montant != null && fees.taker?.montant != null ? `${fees.maker.montant}% / ${fees.taker.montant}%` : "—", sub: "par ordre", color: "gray" as const },
              { icon: CreditCard, label: "Dépôt carte", value: fees.depot_carte?.montant != null ? `${fees.depot_carte.montant}%` : "—", sub: "instantané", color: "warning" as const },
              { icon: Shield,     label: "Staking", value: fees.staking?.montant != null ? `${fees.staking.montant}%` : "—", sub: "commission", color: "success" as const },
            ];
          }
          if (cat === "cfd") {
            return [
              { icon: TrendingUp, label: "Spread indices", value: fees.spread_indices?.montant != null ? `${fees.spread_indices.montant} pts` : "—", sub: "variable", color: "brand" as const },
              { icon: Globe,      label: "Spread forex", value: fees.spread_forex?.montant != null ? `${fees.spread_forex.montant} pips` : "—", sub: "EUR/USD", color: "gray" as const },
              { icon: Zap,        label: "Frais overnight", value: fees.overnight?.montant != null ? `${fees.overnight.montant}%` : "—", sub: "par nuit", color: "warning" as const },
              { icon: Shield,     label: "Protection", value: fees.protection_solde_negatif ? "Oui" : "—", sub: "solde négatif", color: "success" as const },
            ];
          }
          if (cat === "insurance") {
            return [
              { icon: TrendingUp, label: "Frais gestion UC", value: fees.gestion_uc?.montant != null ? `${fees.gestion_uc.montant}%` : "—", sub: "annuel", color: "brand" as const },
              { icon: Shield,     label: "Fonds euro", value: fees.rendement_fonds_euro?.montant != null ? `${fees.rendement_fonds_euro.montant}%` : "—", sub: "rendement", color: "success" as const },
              { icon: CreditCard, label: "Frais entrée", value: fees.entree?.montant != null ? `${fees.entree.montant}%` : "—", sub: "versement", color: "gray" as const },
              { icon: Zap,        label: "Arbitrage", value: fees.arbitrage?.montant != null ? `${fees.arbitrage.montant}€` : "—", sub: "par opération", color: "warning" as const },
            ];
          }
          // Default: broker / bank
          return [
            { icon: TrendingUp, label: "Frais France",   value: fees?.FR?.[0] ? `${fees.FR[0].amount}€` : "—",     sub: "1er palier",      color: "brand" as const },
            { icon: Globe,      label: "Frais USA",      value: fees?.US?.[0] ? `${fees.US[0].amount}€` : "—",     sub: "par ordre",       color: "gray" as const },
            { icon: Shield,     label: "Droits de garde",value: broker.custody_fee === 0 ? "Gratuit" : `${broker.custody_fee}€`, sub: "annuel",          color: "success" as const },
            { icon: Zap,        label: "Frais change",   value: `${broker.currency_fee || 0}%`,                                  sub: "€ / devise",      color: "warning" as const },
          ];
        })()).map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "16px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 500 }}>{label}</p>
              <FeaturedIcon icon={Icon} color={color} size="sm" />
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-sora)", lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts row ──────────────────────────────────────────────── */}
      <div style={{ display: "grid", gap: 16, marginBottom: 24, minWidth: 0, overflow: "hidden" }} className="grid grid-cols-1 lg:grid-cols-2">
        <BrokerRadarChart broker={broker} />
        <FeeComparisonChart broker={broker} allBrokers={allBrokers} />
      </div>

      {/* ── Score breakdown + Pros/Cons ─────────────────────────────── */}
      <div style={{ display: "grid", gap: 16, marginBottom: 24, minWidth: 0, overflow: "hidden" }} className="grid grid-cols-1 lg:grid-cols-2">

        {/* Score breakdown */}
        <div style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <FeaturedIcon icon={Award} color="brand" size="sm" />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Scores détaillés</p>
              <p style={{ fontSize: 12, color: "var(--text-faint)" }}>Notre évaluation objective</p>
            </div>
          </div>
          <ScoreRow label="Frais & tarification" value={broker.score_fees}
            description="Courtage, change, garde, inactivité" />
          <ScoreRow label="Fiabilité & régulation" value={broker.score_reliability}
            description="Solidité, historique, supervision" />
          <ScoreRow label="Interface & expérience" value={broker.score_ux}
            description="Web, mobile, qualité des outils" />
          {((broker as any).score_envergure ?? 0) > 0 && (
            <ScoreRow label="Envergure" value={(broker as any).score_envergure}
              description="Taille, notoriété, ancienneté, encours clients, cotation" />
          )}
          {((broker as any).score_support ?? 0) > 0 && (
            <ScoreRow label="Support client" value={(broker as any).score_support}
              description="Disponibilité, réactivité, accompagnement, langue française" />
          )}
          <div style={{ paddingTop: 14, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Score global</span>
              <ScoreBadge value={broker.score_overall} />
            </div>
          </div>
        </div>

        {/* Pros & Cons */}
        <div style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Points forts & faibles</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {broker.pros.map((pro, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 100, backgroundColor: "var(--positive-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <Check size={11} color="var(--positive)" />
                </div>
                <span style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-muted)" }}>{pro}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {broker.cons.map((con, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 100, backgroundColor: "var(--negative-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <X size={11} color="var(--negative)" />
                </div>
                <span style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-muted)" }}>{con}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fee tables ──────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px", marginBottom: 24, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FeaturedIcon icon={CreditCard} color="brand" size="sm" />
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>Grille tarifaire officielle</h2>
              <p style={{ fontSize: 12, color: "var(--text-faint)" }}>Frais de courtage par marché</p>
            </div>
          </div>
          {/* Market selector */}
          <div style={{ display: "flex", gap: 6 }}>
            {markets.map((m) => (
              <button key={m} onClick={() => setActiveMarket(m)} style={{
                padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                backgroundColor: activeMarket === m ? "var(--accent)" : "var(--bg)",
                color: activeMarket === m ? "#fff" : "var(--text-muted)",
                border: `1.5px solid ${activeMarket === m ? "var(--accent)" : "var(--border)"}`,
                transition: "all 150ms ease",
              }}>
                {m === "FR" ? "France" : m === "EU" ? "Europe" : "USA"}
              </button>
            ))}
          </div>
        </div>

        {broker.fees?.[activeMarket] && (
          <FeeTier tiers={broker.fees[activeMarket]} market={activeMarket} />
        )}

        {/* Extra fees grid */}
        <div style={{ display: "grid",  gap: 10, marginTop: 20 }} className="grid grid-cols-1 sm:grid-cols-3">
          {[
            ...(broker.category === "crypto" ? [
              { label: "Retrait fiat", value: (broker.fees as any)?.retrait_fiat?.montant != null ? `${(broker.fees as any).retrait_fiat.montant}€` : "—", icon: Zap },
              { label: "Nb cryptos", value: (broker.fees as any)?.nb_cryptos ? String((broker.fees as any).nb_cryptos) : "—", icon: Globe },
              { label: "Dépôt minimum", value: broker.deposit_minimum === 0 ? "Aucun" : `${broker.deposit_minimum}€`, icon: Shield },
            ] : broker.category === "cfd" ? [
              { label: "Frais inactivité", value: broker.inactivity_fee === 0 ? "Aucun" : `${broker.inactivity_fee}€`, icon: Zap },
              { label: "Frais de change", value: `${broker.currency_fee || 0}%`, icon: Globe },
              { label: "Levier max", value: (broker.fees as any)?.levier_max ? `x${(broker.fees as any).levier_max}` : "—", icon: Shield },
            ] : [
              { label: "Droits de garde", value: broker.custody_fee === 0 ? "Gratuit" : `${broker.custody_fee}€/an`, icon: Shield },
              { label: "Frais d'inactivité", value: broker.inactivity_fee === 0 ? "Aucun" : `${broker.inactivity_fee}€`, icon: Zap },
              { label: "Frais de change", value: `${broker.currency_fee || 0}%`, icon: Globe },
            ]),
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{
              padding: "14px 16px",
              borderRadius: 10,
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <FeaturedIcon icon={Icon} color="gray" size="sm" />
              <div>
                <p style={{ fontSize: 11, color: "var(--text-faint)" }}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-sora)" }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Infos supplémentaires ────────────────────────────────────── */}
      <div style={{ display: "grid",  gap: 16 }} className="grid grid-cols-1 lg:grid-cols-2">

        {/* Markets */}
        {broker.markets_available && (
          <div style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <FeaturedIcon icon={Globe} color="brand" size="sm" />
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Marchés disponibles</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {broker.markets_available.map((m) => (
                <span key={m} className="tag" style={{ fontSize: 11 }}>{m}</span>
              ))}
            </div>
          </div>
        )}

        {/* Best for */}
        {broker.best_for && (
          <div style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <FeaturedIcon icon={Award} color="success" size="sm" />
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Idéal pour</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {broker.best_for.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--accent)", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Calculateur FIRE / DCA ──────────────────────────────────── */}
      <FireDCACalculator broker={broker} />

      {/* ── Disclaimer ──────────────────────────────────────────────── */}
      <div style={{
        marginTop: 24,
        padding: "14px 18px",
        borderRadius: 10,
        backgroundColor: "var(--bg)",
        border: "1px solid var(--border)",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}>
        <Info size={13} style={{ color: "var(--text-faint)", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: disclaimerFontSize, color: disclaimerColor, lineHeight: 1.6 }}>
          Données collectées depuis les pages tarifaires officielles de {rawBroker.name}.
          Certains frais peuvent varier selon les conditions de marché ou les offres commerciales en cours.
          Lien affilié — notre classement reste 100% indépendant.
          Dernière vérification : mars 2025.
        </p>
      </div>
    </div>
  );
}