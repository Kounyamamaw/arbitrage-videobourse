"use client";
import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/page-container";
import { ArrowUpRight, Gift } from "lucide-react";

type Offer = {
  id: string;
  broker_slug: string;
  broker_name: string;
  broker_logo?: string;
  broker_category?: string;
  title: string;
  description: string;
  cta_label: string;
  cta_url: string;
  badge?: string;
  cta_enabled?: boolean;
  expires_at?: string;
};

const CAT_LABELS: Record<string, string> = {
  broker:    "Courtier",
  bank:      "Banque",
  neobanque: "Néobanque",
  insurance: "Assurance-vie",
  crypto:    "Crypto",
  cfd:       "CFD",
  scpi:      "SCPI",
};
const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  broker:    { bg: "#dbeafe", color: "#2563EB" },
  bank:      { bg: "#d1fae5", color: "#059669" },
  neobanque: { bg: "#d1fae5", color: "#059669" },
  insurance: { bg: "#ede9fe", color: "#7C3AED" },
  crypto:    { bg: "#fef3c7", color: "#D97706" },
  cfd:       { bg: "#fce7f3", color: "#DB2777" },
  scpi:      { bg: "#fce7f3", color: "#DB2777" },
};

function OfferCard({ offer }: { offer: Offer }) {
  const cat = offer.broker_category || "";
  const catStyle = CAT_COLORS[cat] || { bg: "var(--muted)", color: "var(--muted-foreground)" };
  const isExpired = !!offer.expires_at && new Date(offer.expires_at) < new Date();

  return (
    <div
      className="relative flex flex-col rounded-2xl border border-border bg-card p-6 gap-5 hover:border-primary/30 hover:shadow-md transition-all"
      style={isExpired ? { opacity: 0.5, filter: "grayscale(0.7)", pointerEvents: "none" } : undefined}
    >
      {/* Badge statut — En cours ou Expiré */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
        {isExpired ? (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
            backgroundColor: "#f1f5f9", color: "#94a3b8",
            border: "1px solid #e2e8f0", letterSpacing: "0.05em", textTransform: "uppercase" as const,
          }}>Expiré</span>
        ) : (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
            backgroundColor: "#dcfce7", color: "#16a34a",
            border: "1px solid #bbf7d0", letterSpacing: "0.05em", textTransform: "uppercase" as const,
          }}>✦ En cours</span>
        )}
        {offer.badge && !isExpired && (
          <div className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground tracking-wide">
            {offer.badge}
          </div>
        )}
      </div>

      {/* Header : logo + nom + catégorie */}
      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted overflow-hidden border border-border">
          {offer.broker_logo && !offer.broker_logo.startsWith("data:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={offer.broker_logo} alt={offer.broker_name} className="size-9 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <span className="text-sm font-bold text-primary">{offer.broker_name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{offer.broker_name}</p>
          {cat && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
              color: catStyle.color, backgroundColor: catStyle.bg,
              border: `1px solid ${catStyle.color}33`,
              display: "inline-flex", alignItems: "center", lineHeight: 1.5,
            }}>
              {CAT_LABELS[cat] || cat}
            </span>
          )}
        </div>
      </div>

      {/* Titre + description */}
      <div className="flex-1">
        <h3 className="font-bold text-base leading-snug mb-2">{offer.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{offer.description}</p>
      </div>

      {/* Expiration */}
      {offer.expires_at && (
        <p className="text-xs text-muted-foreground">
          Expire le {new Date(offer.expires_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      )}

      {/* CTA */}
      {offer.cta_enabled !== false ? (
        <a
          href={offer.cta_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full justify-center"
          style={{ padding: "11px 16px", fontSize: 13, gap: 6 }}
        >
          {offer.cta_label}
          <ArrowUpRight size={13} />
        </a>
      ) : (
        <div
          className="w-full flex items-center justify-center rounded-lg border border-border"
          style={{ padding: "11px 16px", fontSize: 13, gap: 6, color: "var(--text-muted)", cursor: "not-allowed", backgroundColor: "var(--muted)" }}
        >
          {offer.cta_label}
        </div>
      )}
    </div>
  );
}

export default function OffresPage() {
  const [offers, setOffers]   = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/offers")
      .then(r => r.json())
      .then(d => setOffers(Array.isArray(d) ? d : []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Gift className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Offres Exclusives</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Profitez des meilleures offres négociées pour notre communauté</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-72 rounded-2xl border border-border bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <Gift className="size-10 text-muted-foreground mb-4" />
            <p className="font-semibold">Aucune offre disponible pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">Revenez bientôt, de nouvelles offres sont en préparation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {offers.map(offer => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        )}
      </div>
    </PageContainer>
  );
}