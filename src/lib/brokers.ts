export type FeeRange = {
  min: number;
  max: number | null;
  type: "flat" | "percentage" | "mixed";
  amount: number;
};

export type BrokerFeatures = {
  fractional_shares: boolean;
  dca: boolean;
  dividend_reinvestment: boolean;
  isa: boolean;
  mobile_app: boolean;
  web_platform: boolean;
};

export type Broker = {
  id: string;
  slug: string;
  website?: string;
  name: string;
  category: "broker" | "bank" | "insurance" | "crypto" | "scpi" | "cfd";
  logo: string;
  logoColor: string;
  tagline: string;
  deposit_minimum: number;
  accounts: string[];
  founded: number;
  country: string;
  regulation: string[];
  trustpilot_score: number;
  trustpilot_count: number;
  affiliate_url: string;
  score_overall: number;
  score_fees: number;
  score_reliability: number;
  score_ux: number;
  score_envergure?: number;
  score_support?: number;
  pros: string[];
  cons: string[];
  fees: Record<string, FeeRange[]>;
  custody_fee: number;
  inactivity_fee: number;
  currency_fee: number;
  features?: BrokerFeatures; 
  withdrawal_fee_details?: string;
  best_for: string[];
  markets_available?: string[];
  order_types?: string[];
  etf_count?: number;
  welcome_offer?: string;
  custody_fee_details?: string;
  inactivity_fee_details?: string;
  currency_fee_details?: string;
  withdrawal_fee?: number;
  deposit_fee?: number;
  pea_max_deposit?: number;
  transfer_out_fee?: string;
  dividend_fee?: string;
  ost_fee?: string;
  account_opening_fee?: number;
  account_closing_fee?: number;
  is_partner?: boolean;
  partner_rank?: number;
  demo_url?: string;
  logo_color?: string;
};

// Calculate fee for a given order amount on a given market
export function calculateFee(broker: Broker, market: string, amount: number): number {
  const marketFees = broker.fees[market];
  if (!marketFees) return 0;

  const range = marketFees.find(
    (r) => amount >= r.min && (r.max === null || amount <= r.max)
  );
  if (!range) return 0;

  if (range.type === "flat") return range.amount;
  if (range.type === "percentage") return (amount * range.amount) / 100;
  return range.amount;
}

// Estimate annual fees based on user config
export function estimateAnnualFees(
  broker: Broker,
  orderAmount: number,
  ordersPerMonth: number,
  market: string
): {
  per_order: number;
  per_month: number;
  per_year: number;
} {
  const per_order   = calculateFee(broker, market, orderAmount);
  const per_month   = per_order * ordersPerMonth + broker.custody_fee;
  const per_year    = per_month * 12;

  return { per_order, per_month, per_year };
}

// Score-based ranking for wizard results
export function rankBrokers(
  brokers: Broker[],
  config: {
    accountType: string;
    profile: string;
    market: string;
    orderAmount: number;
    ordersPerMonth: number;
    depositMin: number;
  }
): Broker[] {
  return brokers
    .filter((b) => {
      if (config.accountType && !b.accounts.includes(config.accountType)) return false;
      if (b.deposit_minimum > config.depositMin) return false;
      return true;
    })
    .map((b) => ({
      broker: b,
      weightedScore:
        b.score_overall * 0.4 +
        b.score_fees * 0.4 +
        b.score_reliability * 0.2,
    }))
    .sort((a, z) => z.weightedScore - a.weightedScore)
    .map((x) => x.broker);
}

export function formatFee(amount: number, type: "flat" | "percentage" | "currency"): string {
  if (type === "percentage") return `${amount}%`;
  if (type === "currency") return `${amount.toFixed(2)}€`;
  if (amount === 0) return "Gratuit";
  return `${amount.toFixed(2)}€`;
}

// Extended detail fields (optional — present on enriched records)
export type BrokerDetail = Broker & {
  cash_remuneration?:      string;
  savings_plan?:           string;
  av_fund_euro_rate?:      string;
  av_uc_selection?:        string;
};

// ── Calcul cohérent du score global ──────────────────────────────────────
// Formule : moyenne simple des 5 critères disponibles.
// Si envergure ou support sont absents (0), on fait la moyenne des critères renseignés.
export function computeOverallScore(broker: Broker): number {
  const fees        = broker.score_fees        || 0;
  const reliability = broker.score_reliability || 0;
  const ux          = broker.score_ux          || 0;
  const envergure   = (broker as any).score_envergure ?? 0;
  const support     = (broker as any).score_support   ?? 0;

  // Sans les 3 scores de base, on retourne la valeur stockée (fallback sûr)
  if (!fees && !reliability && !ux) return broker.score_overall;

  const scores  = [fees, reliability, ux, envergure, support].filter(s => s > 0);
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.min(Math.round(average * 10) / 10, 10);
}

// ── Couleurs des scores — dégradé fluide ─────────────────────────────────
// Vert   : 10 → 8.0
// Orange : 7.9 → 6.7
// Rouge  : < 6.7
// Interpolation HSL pour une transition douce sans saut brutal de couleur.
export function scoreColor(value: number): string {
  const v = Math.max(0, Math.min(10, value));
  if (v >= 8.0) {
    // Vert fixe — pas de dégradé
    return "var(--positive)";
  }
  if (v >= 6.7) {
    // Orange vif (6.7) → Jaune-orange (7.9)
    const t = (v - 6.7) / 1.2;
    const h = Math.round(30  + t * 12);
    const s = Math.round(90  - t * 5);
    const l = Math.round(48  + t * 4);
    return `hsl(${h},${s}%,${l}%)`;
  }
  // Rouge (< 6.7)
  const t = v / 6.7;
  const h = Math.round(4   + t * 11);
  const s = Math.round(80  - t * 10);
  const l = Math.round(46  + t * 4);
  return `hsl(${h},${s}%,${l}%)`;
}
export function scoreBg(value: number): string {
  return value >= 8.0 ? "var(--positive-bg)" : value >= 6.7 ? "var(--warning-bg)" : "var(--negative-bg)";
}
export function scoreTailwind(value: number): string {
  return value >= 8.0 ? "text-green-600" : value >= 6.7 ? "text-amber-600" : "text-red-500";
}
