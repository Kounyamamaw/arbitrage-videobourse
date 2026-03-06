import { CompareWizard } from "@/components/compare/CompareWizard";

export const metadata = {
  title: "Comparer les courtiers",
  description: "Trouvez le meilleur courtier pour votre profil en 3 étapes. Simulation de frais réels personnalisée.",
};

export default function ComparePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] py-16 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-3" style={{ color: "var(--text)" }}>
          Comparateur personnalisé
        </h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
          Répondez à 3 questions. Obtenez les courtiers les plus adaptés
          à votre profil avec simulation de frais réels annuels.
        </p>
      </div>

      <CompareWizard />
    </div>
  );
}
