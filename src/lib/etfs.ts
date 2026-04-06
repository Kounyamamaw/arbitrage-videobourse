export type ETF = {
  isin:          string;
  ticker:        string;
  name:          string;
  issuer:        string;
  index:         string;
  index_slug:    string;
  ter:           number;          // % annuel
  aum_bn:        number;          // encours en Mds€
  replication:   "physical" | "synthetic";
  hedged:        boolean;
  currency:      string;
  pea_eligible:  boolean;
  domicile:      string;
  dividend:      "accumulating" | "distributing" | "none";
  inception_year: number;
  description:   string;
  available_at:  string[];        // broker slugs
};

export type Issuer = {
  id:           string;
  name:         string;
  country:      string;
  aum_total_bn: number;
  founded:      number;
  logo_domain:  string;
  description:  string;
  strengths:    string[];
  etf_count:    number;
  known_for:    string;
};

// Coût total annuel = TER + frais courtage annualisés + frais de change
export function computeTotalCost(
  etf: ETF,
  brokerSlug: string,
  brokers: { slug: string; fees: Record<string, { min: number; max: number | null; type: string; amount: number }[]>; currency_fee: number }[],
  orderAmount: number = 300,
  ordersPerMonth: number = 1
): { ter: number; brokerage: number; fx: number; total: number } | null {
  const broker = brokers.find((b) => b.slug === brokerSlug);
  if (!broker) return null;

  // TER annuel sur un investissement type 3600€ (300€ × 12)
  const investedPerYear = orderAmount * ordersPerMonth * 12;
  const ter_cost = (etf.ter / 100) * investedPerYear;

  // Frais de courtage annualisés
  const market = etf.currency === "USD" ? "US" : "FR";
  const fees = broker.fees?.[market];
  let brokerage_per_order = 0;
  if (fees) {
    const tier = fees.find(
      (f) => orderAmount >= f.min && (f.max === null || orderAmount <= f.max)
    );
    if (tier) {
      brokerage_per_order =
        tier.type === "flat"
          ? tier.amount
          : (orderAmount * tier.amount) / 100;
    }
  }
  const brokerage_annual = brokerage_per_order * ordersPerMonth * 12;

  // Frais de change (uniquement si ETF en USD et broker applique un FX fee)
  const fx_annual =
    etf.currency === "USD" && !etf.hedged
      ? (broker.currency_fee / 100) * investedPerYear
      : 0;

  const total = ter_cost + brokerage_annual + fx_annual;

  return {
    ter:       Math.round(ter_cost * 100) / 100,
    brokerage: Math.round(brokerage_annual * 100) / 100,
    fx:        Math.round(fx_annual * 100) / 100,
    total:     Math.round(total * 100) / 100,
  };
}

export const INDEX_LABELS: Record<string, string> = {
  "msci-world":    "MSCI World",
  "msci-em":       "MSCI Émergents",
  "ftse-all-world":"FTSE All-World",
  "sp500":         "S&P 500",
  "nasdaq100":     "Nasdaq 100",
  "msci-europe":   "MSCI Europe",
  "euro-bonds":    "Obligations Euro",
  "global-bonds":  "Obligations Monde",
  "gold":          "Or",
};
