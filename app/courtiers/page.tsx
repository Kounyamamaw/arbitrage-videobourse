import { BrokerFilters } from "@/components/brokers/BrokerFilters";
import { BrokerGrid } from "@/components/brokers/BrokerGrid";

export const metadata = {
  title: "Courtiers",
  description: "Comparez tous les courtiers, banques en ligne et assurances-vie disponibles en France.",
};

export default function CourtiersPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1
            className="font-display font-semibold text-2xl"
            style={{ color: "var(--text)" }}
          >
            Comparateur de courtiers
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
            Filtrez par catégorie, enveloppe ou dépôt — classement par score global.
          </p>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          <BrokerFilters />
          <BrokerGrid />
        </div>
      </div>
    </div>
  );
}
