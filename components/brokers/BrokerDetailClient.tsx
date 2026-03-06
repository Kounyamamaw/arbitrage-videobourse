"use client";

import { useState } from "react";
import { Broker } from "@/lib/brokers";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell,
} from "recharts";
import {
  Check, X, Info, Star, Globe, Shield, TrendingUp,
  CreditCard, BarChart2, ArrowUpRight, Zap, Award,
} from "lucide-react";

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
};

function BrokerLogo({ broker, size = 52 }: { broker: Broker; size?: number }) {
  const domain = LOGO_DOMAINS[broker.slug];
  const [src, setSrc] = useState(domain ? `https://logo.clearbit.com/${domain}` : "");
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
      backgroundColor: "#fff", border: "1px solid var(--border)",
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
  const color = value >= 8.5 ? "var(--positive)" : value >= 7 ? "var(--warning)" : "var(--negative)";
  const bg    = value >= 8.5 ? "var(--positive-bg)" : value >= 7 ? "var(--warning-bg)" : "var(--negative-bg)";
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
  const data = [
    { subject: "Frais",     value: broker.score_fees,        fullMark: 10 },
    { subject: "Fiabilité", value: broker.score_reliability, fullMark: 10 },
    { subject: "Interface", value: broker.score_ux,          fullMark: 10 },
    { subject: "Offre",     value: Math.min((broker.accounts.length / 4) * 10 + 5, 10), fullMark: 10 },
    { subject: "Marchés",   value: Math.min((broker.markets_available?.length || 4) / 1.2, 10), fullMark: 10 },
    { subject: "Support",   value: broker.score_reliability - 0.5, fullMark: 10 },
  ];

  return (
    <div style={{
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <FeaturedIcon icon={BarChart2} color="brand" size="sm" />
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Score détaillé</p>
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
            stroke="var(--accent)"
            strokeWidth={2}
            fill="var(--accent)"
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
  // Compute estimated annual fee for 300€ × 4 orders/month
  const estimate = (b: Broker) => {
    const fees = b.fees?.FR;
    if (!fees) return 0;
    const tier = fees.find((f) => f.min <= 300 && (f.max === null || f.max >= 300));
    if (!tier) return 0;
    const perOrder = tier.type === "flat" ? tier.amount : (300 * tier.amount) / 100;
    return Math.round(perOrder * 4 * 12);
  };

  const data = allBrokers
    .map((b) => ({ name: b.name.replace("Interactive Brokers", "IBKR"), value: estimate(b), isCurrent: b.slug === broker.slug }))
    .sort((a, z) => a.value - z.value);

  return (
    <div style={{
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <FeaturedIcon icon={CreditCard} color="brand" size="sm" />
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Comparaison des frais</p>
          <p style={{ fontSize: 12, color: "var(--text-faint)" }}>Coût annuel estimé — 300€ × 4 ordres/mois · France</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="var(--border-light)" />
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
            width={80}
          />
          <Tooltip
            formatter={(v: number) => [`${v}€/an`, "Frais estimés"]}
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
                fill={entry.isCurrent ? "var(--accent)" : "var(--border)"}
                fillOpacity={entry.isCurrent ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8, textAlign: "center" }}>
        La barre teal = {broker.name}
      </p>
    </div>
  );
}

// ── Score breakdown row ────────────────────────────────────────────────────
function ScoreRow({ label, value, description }: { label: string; value: number; description: string }) {
  const color = value >= 8.5 ? "var(--positive)" : value >= 7 ? "var(--warning)" : "var(--negative)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</p>
        <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{description}</p>
      </div>
      <div style={{ width: 100, height: 5, borderRadius: 3, backgroundColor: "var(--border)", overflow: "hidden", flexShrink: 0 }}>
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
      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
        <table>
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
export function BrokerDetailClient({ broker, allBrokers }: { broker: Broker; allBrokers: Broker[] }) {
  const [activeMarket, setActiveMarket] = useState<"FR" | "EU" | "US">("FR");

  const markets = Object.keys(broker.fees || {}) as ("FR" | "EU" | "US")[];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px" }}>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        padding: "28px 32px",
        marginBottom: 24,
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flex: 1 }}>
          <BrokerLogo broker={broker} size={60} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>
                {broker.name}
              </h1>
              {broker.regulation?.map((r) => (
                <span key={r} style={{
                  padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                  color: "var(--accent-text)", backgroundColor: "var(--accent-light)",
                  border: "1px solid var(--accent-mid)",
                }}>
                  {r}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>{broker.tagline}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
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
          </div>
        </div>

        {/* Right: score + trustpilot */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <ScoreBadge value={broker.score_overall} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={13}
                fill={s <= Math.round(broker.trustpilot_score) ? "#F59E0B" : "transparent"}
                color="#F59E0B"
              />
            ))}
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginLeft: 2 }}>
              {broker.trustpilot_score}/5
            </span>
            <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
              ({broker.trustpilot_count.toLocaleString("fr-FR")} avis)
            </span>
          </div>
          <a href={broker.affiliate_url} target="_blank" rel="noopener noreferrer"
            className="btn-primary" style={{ padding: "10px 22px", fontSize: 13, gap: 7 }}>
            Ouvrir un compte
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>

      {/* ── 4 stat cards (UntitledUI-style) ────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 24,
      }} className="grid-cols-2 lg:grid-cols-4">
        {[
          { icon: TrendingUp, label: "Frais France",   value: broker.fees?.FR?.[0] ? `${broker.fees.FR[0].amount}€` : "—",     sub: "1er palier",      color: "brand" as const },
          { icon: Globe,      label: "Frais USA",      value: broker.fees?.US?.[0] ? `${broker.fees.US[0].amount}€` : "—",     sub: "par ordre",       color: "gray" as const },
          { icon: Shield,     label: "Droits de garde",value: broker.custody_fee === 0 ? "Gratuit" : `${broker.custody_fee}€`, sub: "annuel",          color: "success" as const },
          { icon: Zap,        label: "Frais change",   value: `${broker.currency_fee || 0}%`,                                  sub: "€ / devise",      color: "warning" as const },
        ].map(({ icon: Icon, label, value, sub, color }) => (
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16, marginBottom: 24 }} className="grid-cols-1 lg:grid-cols-2">
        <BrokerRadarChart broker={broker} />
        <FeeComparisonChart broker={broker} allBrokers={allBrokers} />
      </div>

      {/* ── Score breakdown + Pros/Cons ─────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }} className="grid-cols-1 lg:grid-cols-2">

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
          <div style={{ paddingTop: 14, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Score global</span>
              <ScoreBadge value={broker.score_overall} />
            </div>
          </div>
        </div>

        {/* Pros & Cons */}
        <div style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Points forts & faibles</p>
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
      <div style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FeaturedIcon icon={CreditCard} color="brand" size="sm" />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Grille tarifaire officielle</p>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 20 }} className="grid-cols-1 sm:grid-cols-3">
          {[
            { label: "Droits de garde", value: broker.custody_fee === 0 ? "Gratuit" : `${broker.custody_fee}€/an`, icon: Shield },
            { label: "Frais d'inactivité", value: broker.inactivity_fee === 0 ? "Aucun" : `${broker.inactivity_fee}€`, icon: Zap },
            { label: "Frais de change", value: `${broker.currency_fee || 0}%`, icon: Globe },
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="grid-cols-1 lg:grid-cols-2">

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
        <p style={{ fontSize: 12, color: "var(--text-faint)", lineHeight: 1.6 }}>
          Données collectées depuis les pages tarifaires officielles de {broker.name}.
          Certains frais peuvent varier selon les conditions de marché ou les offres commerciales en cours.
          Lien affilié — notre classement reste 100% indépendant.
          Dernière vérification : mars 2025.
        </p>
      </div>
    </div>
  );
}
