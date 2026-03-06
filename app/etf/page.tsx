import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";

export const metadata = { title: "Comparateur par ETF — Bientôt disponible" };

export default function ETFPage() {
  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "var(--accent-light)" }}>
          <Construction size={28} style={{ color: "var(--accent)" }} />
        </div>
        <h1 className="font-display font-bold text-2xl mb-3" style={{ color: "var(--text)" }}>
          Comparateur ETF — Phase 2
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          Cette fonctionnalité arrive en Phase 2 de notre roadmap. Elle vous permettra
          de rechercher un ETF spécifique (ex: Amundi MSCI World CW8) et de voir
          exactement quel courtier est le moins cher pour l'acheter.
        </p>
        <Link href="/comparer" className="btn-primary">
          Utiliser le comparateur général
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
