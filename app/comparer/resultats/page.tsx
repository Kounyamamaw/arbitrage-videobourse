import { Suspense } from "react";
import Link from "next/link";
import brokersData from "@/data/brokers.json";
import { Broker, rankBrokers, estimateAnnualFees } from "@/lib/brokers";
import { BrokerCard } from "@/components/brokers/BrokerCard";
import { ArrowLeft, RotateCcw } from "lucide-react";

const brokers = (brokersData as unknown) as unknown as Broker[];

type SearchParams = {
  objective?:      string;
  profile?:        string;
  accountType?:    string;
  market?:         string;
  orderAmount?:    string;
  ordersPerMonth?: string;
};

export const metadata = { title: "Résultats de comparaison" };

function ResultsContent({ searchParams }: { searchParams: SearchParams }) {
  const accountType    = searchParams.accountType    || "PEA";
  const market         = searchParams.market         || "FR";
  const orderAmount    = Number(searchParams.orderAmount)    || 300;
  const ordersPerMonth = Number(searchParams.ordersPerMonth) || 4;

  const ranked = rankBrokers(brokers, {
    accountType,
    profile:    searchParams.profile    || "",
    market,
    orderAmount,
    ordersPerMonth,
    depositMin: 10000,
  });

  const topThree = ranked.slice(0, 3);
  const others   = ranked.slice(3);

  // Annual fee comparison data for top 3
  const feeComparison = topThree.map((b) => ({
    broker: b,
    ...estimateAnnualFees(b, orderAmount, ordersPerMonth, market),
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back nav */}
      <div className="flex items-center justify-between">
        <Link href="/comparer" className="flex items-center gap-2 text-sm hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft size={15} />
          Modifier la comparaison
        </Link>
        <Link href="/comparer" className="flex items-center gap-2 text-xs btn-secondary" style={{ padding: "6px 12px" }}>
          <RotateCcw size={13} />
          Recommencer
        </Link>
      </div>

      {/* Summary */}
      <div className="rounded-xl p-5 flex flex-wrap gap-4 items-center" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>
          Votre config :{" "}
          <span className="font-semibold" style={{ color: "var(--text)" }}>{accountType}</span>
          {" · "}
          <span className="font-semibold" style={{ color: "var(--text)" }}>{market}</span>
          {" · "}
          <span className="font-semibold" style={{ color: "var(--text)" }}>{orderAmount.toLocaleString("fr-FR")}€ / ordre</span>
          {" · "}
          <span className="font-semibold" style={{ color: "var(--text)" }}>{ordersPerMonth} ordres/mois</span>
        </div>
      </div>

      {/* Fee comparison bar chart */}
      <div>
        <h2 className="font-display font-bold text-xl mb-4" style={{ color: "var(--text)" }}>
          Coût annuel estimé — Top 3
        </h2>
        <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
          {feeComparison.map(({ broker, per_year }, i) => {
            const maxFee = Math.max(...feeComparison.map((f) => f.per_year), 1);
            const pct    = per_year === 0 ? 2 : (per_year / maxFee) * 100;
            return (
              <div key={broker.id} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: broker.logoColor }}>
                      {i + 1}
                    </span>
                    <span className="font-medium" style={{ color: "var(--text)" }}>{broker.name}</span>
                  </div>
                  <span className="font-display font-bold" style={{ color: per_year === 0 ? "var(--green)" : "var(--text)" }}>
                    {per_year === 0 ? "Gratuit" : `${per_year.toFixed(0)}€ / an`}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width:           `${pct}%`,
                      backgroundColor: i === 0 ? "var(--green)" : i === 1 ? "var(--accent)" : "var(--amber)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 3 cards */}
      <div>
        <h2 className="font-display font-bold text-xl mb-4" style={{ color: "var(--text)" }}>
          Recommandations pour votre profil
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topThree.map((broker, i) => (
            <BrokerCard
              key={broker.id}
              broker={broker}
              rank={i + 1}
              showFeeEstimate
              orderAmount={orderAmount}
              ordersPerMonth={ordersPerMonth}
              market={market}
            />
          ))}
        </div>
      </div>

      {/* Other results */}
      {others.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-lg mb-4" style={{ color: "var(--text)" }}>
            Autres options compatibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {others.map((broker) => (
              <BrokerCard
                key={broker.id}
                broker={broker}
                showFeeEstimate
                orderAmount={orderAmount}
                ordersPerMonth={ordersPerMonth}
                market={market}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="p-20 text-center" style={{ color: "var(--text-muted)" }}>Calcul en cours...</div>}>
      <ResultsContent searchParams={searchParams} />
    </Suspense>
  );
}
