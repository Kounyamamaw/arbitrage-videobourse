"use client";

import Link from "next/link";
import { Broker, estimateAnnualFees } from "@/lib/brokers";
import { Star, ArrowUpRight, Check, Minus, TrendingUp } from "lucide-react";
import { useState } from "react";

type Props = {
  broker: Broker;
  showFeeEstimate?: boolean;
  orderAmount?: number;
  ordersPerMonth?: number;
  market?: string;
  rank?: number;
};

const CAT_LABELS: Record<string, string> = {
  broker:    "Courtier",
  bank:      "Banque",
  insurance: "Assurance-vie",
  crypto:    "Crypto",
  scpi:      "SCPI",
};

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  broker:    { bg: "var(--tint-blue)",   color: "#2563EB" },
  bank:      { bg: "var(--tint-green)",  color: "var(--accent)" },
  insurance: { bg: "var(--tint-purple)", color: "#7C3AED" },
  crypto:    { bg: "var(--tint-amber)",  color: "#D97706" },
  scpi:      { bg: "var(--tint-rose)",   color: "#DB2777" },
};

function BrokerLogo({ broker }: { broker: Broker }) {
  const domain = (broker as any).website;
  const cat = CAT_COLORS[broker.category] || { bg: "var(--accent-light)", color: "var(--accent)" };
  const initials = broker.name.slice(0, 2).toUpperCase();

  // Sources logo par ordre de priorité
  const sources = domain ? [
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://api.faviconkit.com/${domain}/128`,
  ] : [];

  const [srcIdx, setSrcIdx] = useState(0);
  const currentSrc = sources[srcIdx] || "";

  if (!currentSrc || srcIdx >= sources.length) {
    // Fallback initiales stylées avec couleur catégorie
    return (
      <div style={{
        width: 44, height: 44,
        borderRadius: 11,
        backgroundColor: cat.bg,
        border: "1.5px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 13, fontWeight: 700,
          fontFamily: "var(--font-sora)",
          color: cat.color,
          letterSpacing: "-0.01em",
        }}>{initials}</span>
      </div>
    );
  }

  return (
    <div style={{
      width: 44, height: 44,
      borderRadius: 11,
      backgroundColor: "#fff",
      border: "1.5px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={broker.name}
        width={28}
        height={28}
        style={{ objectFit: "contain", width: 28, height: 28 }}
        onError={() => setSrcIdx(i => i + 1)}
      />
    </div>
  );
}

function ScoreBar({ value, color }: { value: number; color?: string }) {
  const c = color || (value >= 8.5 ? "var(--positive)" : value >= 7 ? "var(--warning)" : "var(--negative)");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 3, backgroundColor: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value * 10}%`, backgroundColor: c, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-sora)", color: c, width: 26, textAlign: "right" }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

export function BrokerCard({
  broker, showFeeEstimate,
  orderAmount = 300, ordersPerMonth = 4, market = "FR", rank,
}: Props) {
  const feeEstimate = showFeeEstimate
    ? estimateAnnualFees(broker, orderAmount, ordersPerMonth, market)
    : null;

  const isTop = rank === 1;

  return (
    <div
      className="broker-card"
      style={{
        backgroundColor: "var(--card)",
        border: `1.5px solid ${isTop ? "var(--accent-mid)" : "var(--border)"}`,
        borderRadius: 14,
        boxShadow: isTop ? "0 4px 20px rgba(13,155,138,0.10)" : "var(--shadow-xs)",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        transition: "box-shadow 200ms ease, transform 200ms ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "var(--shadow-md)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = isTop ? "0 4px 20px rgba(13,155,138,0.10)" : "var(--shadow-xs)";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Badge #1 */}
      {rank === 1 && (
        <div style={{
          position: "absolute", top: -1, left: 16,
          padding: "3px 10px",
          backgroundColor: "var(--accent)",
          color: "#fff",
          fontSize: 10, fontWeight: 700,
          borderRadius: "0 0 7px 7px",
          letterSpacing: "0.05em",
        }}>
          #1 RECOMMANDÉ
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingTop: rank === 1 ? 16 : 0 }}>
        <BrokerLogo broker={broker} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-sora)" }}>
              {broker.name}
            </span>
            <span className="tag" style={{ fontSize: 10 }}>
              {CAT_LABELS[broker.category] || broker.category}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {broker.tagline}
          </p>
        </div>
        <span style={{
          fontSize: 20, fontWeight: 800,
          fontFamily: "var(--font-sora)",
          color: broker.score_overall >= 8.5 ? "var(--positive)" : broker.score_overall >= 7 ? "var(--warning)" : "var(--negative)",
          flexShrink: 0,
          lineHeight: 1,
        }}>
          {broker.score_overall.toFixed(1)}
        </span>
      </div>

      {/* Accounts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {broker.accounts.map((acc) => (
          <span key={acc} className="tag">{acc}</span>
        ))}
        {broker.deposit_minimum === 0 && (
          <span className="tag" style={{ color: "var(--positive)", borderColor: "var(--positive-bg)", backgroundColor: "var(--positive-bg)" }}>
            0 EUR min
          </span>
        )}
      </div>

      {/* Scores */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "Frais",     value: broker.score_fees },
          { label: "Fiabilité", value: broker.score_reliability },
          { label: "Interface", value: broker.score_ux },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-faint)", width: 58, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1 }}><ScoreBar value={value} /></div>
          </div>
        ))}
      </div>

      {/* Fee estimate */}
      {feeEstimate && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 12px",
          backgroundColor: "var(--accent-light)",
          borderRadius: 8,
          border: "1px solid var(--accent-mid)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <TrendingUp size={12} color="var(--accent)" />
            <span style={{ fontSize: 12, color: "var(--accent-text)" }}>Coût annuel estimé</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-text)", fontFamily: "var(--font-sora)" }}>
            {feeEstimate.per_year === 0 ? "Gratuit" : `~${feeEstimate.per_year.toFixed(0)} EUR`}
          </span>
        </div>
      )}

      {/* Pros / cons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {broker.pros.slice(0, 2).map((pro, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
            <Check size={11} style={{ color: "var(--positive)", flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{pro}</span>
          </div>
        ))}
        {broker.cons.slice(0, 1).map((con, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
            <Minus size={11} style={{ color: "var(--text-faint)", flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 12, color: "var(--text-faint)", lineHeight: 1.5 }}>{con}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Star size={11} fill="var(--warning)" color="var(--warning)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{broker.trustpilot_score}</span>
          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>({broker.trustpilot_count.toLocaleString("fr-FR")})</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Link href={`/courtiers/${broker.slug}`} className="btn-secondary" style={{ padding: "5px 12px", fontSize: 12 }}>
            Détails
          </Link>
          <a href={`/go/${broker.slug}`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: "5px 12px", fontSize: 12 }}>
            Ouvrir
            <ArrowUpRight size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

export { ScoreBar };
