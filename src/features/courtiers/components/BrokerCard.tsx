"use client";

import Link from "next/link";
import { Broker, estimateAnnualFees, computeOverallScore, scoreColor } from "@/lib/brokers";
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

// Fallback domains for brokers whose website field may be missing / unhelpful
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
  "la-banque-postale":   "labanquepostale.fr",
  "caisse-d-epargne":    "caisse-epargne.fr",
  "cr-dit-agricole":     "credit-agricole.fr",
  "cr-dit-mutuel":       "creditmutuel.fr",
  "soci-t-g-n-rale":     "societegenerale.fr",
};

function BrokerLogo({ broker }: { broker: Broker }) {
  const rawDomain = (broker as any).website || "";
  // Use website domain if available, otherwise fall back to LOGO_DOMAINS map
  const websiteDomain = rawDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  const domain = websiteDomain || LOGO_DOMAINS[broker.slug] || "";
  const cat = CAT_COLORS[broker.category] || { bg: "var(--accent-light)", color: "var(--accent)" };
  const initials = broker.name.slice(0, 2).toUpperCase();

  // Si un logo_url est défini manuellement, on le priorise
  const manualLogoUrl = (broker as any).logo_url;

  // Sources logo par ordre de priorité
  const sources = manualLogoUrl
    ? [manualLogoUrl]
    : domain ? [
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
      backgroundColor: "var(--card)",
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
  const c = color || scoreColor(value);
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

  // Score affiché = toujours calculé depuis les critères (cohérence garantie)
  const displayScore = computeOverallScore(broker);
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
          #1
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
            {/* Badge catégorie principale — style coloré */}
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
              color:            CAT_COLORS[broker.category]?.color || "var(--accent)",
              backgroundColor:  CAT_COLORS[broker.category]?.bg    || "var(--accent-light)",
              border: `1px solid ${CAT_COLORS[broker.category]?.color || "var(--accent)"}33`,
              display: "inline-flex", alignItems: "center", lineHeight: "1.4",
            }}>
              {CAT_LABELS[broker.category] || broker.category}
            </span>
            {/* Badges catégories supplémentaires (multi-catégorie) */}
            {(() => {
              const extra: string[] = ((broker as any).categories || []).filter(
                (c: string) => c !== broker.category
              );
              return extra.map((c) => (
                <span
                  key={c}
                  style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                    color: CAT_COLORS[c]?.color || "var(--accent)",
                    backgroundColor: CAT_COLORS[c]?.bg || "var(--accent-light)",
                    border: `1px solid ${CAT_COLORS[c]?.color || "var(--accent)"}33`,
                    lineHeight: "1.4",
                  }}
                >
                  {CAT_LABELS[c] || c}
                </span>
              ));
            })()}
            {(broker as any).is_partner && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 5, color: "#2563eb", backgroundColor: "#dbeafe", border: "1px solid #93c5fd" }}>Partenaire</span>
            )}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {broker.tagline}
          </p>
        </div>
        <span style={{
          fontSize: 20, fontWeight: 800,
          fontFamily: "var(--font-sora)",
          color: scoreColor(displayScore),
          flexShrink: 0,
          lineHeight: 1,
        }}>
          {displayScore.toFixed(1)}
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
          ...(((broker as any).score_envergure ?? 0) > 0
            ? [{ label: "Envergure", value: (broker as any).score_envergure as number }]
            : []),
          ...(((broker as any).score_support ?? 0) > 0
            ? [{ label: "Support",   value: (broker as any).score_support as number }]
            : []),
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
          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>({broker.trustpilot_count.toLocaleString("fr-FR")} avis)</span>
          {broker.trustpilot_count < 200 && (
            <span title="Peu d'avis — score à relativiser" style={{ fontSize: 10, color: "var(--warning)", cursor: "help" }}>⚠</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Link href={`/dashboard/courtiers/${broker.slug}`} className="btn-secondary" style={{ padding: "5px 12px", fontSize: 12 }}>
            Détails
          </Link>
          {(broker as any).demo_url && (
            <a href={`/comparatif/go/${broker.slug}/demo?src=demo-card`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: "5px 12px", fontSize: 12 }}>
              Démo
            </a>
          )}
          <a href={`/comparatif/go/${broker.slug}`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: "5px 12px", fontSize: 12 }}>
            Ouvrir
            <ArrowUpRight size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

export { ScoreBar };