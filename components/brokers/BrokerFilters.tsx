"use client";

import { useFilterStore } from "@/lib/store";
import { SlidersHorizontal } from "lucide-react";

const CATEGORIES = [
  { value: "all",       label: "Tous les acteurs" },
  { value: "broker",    label: "Courtiers bourse" },
  { value: "bank",      label: "Banques en ligne" },
  { value: "insurance", label: "Assurances-vie"   },
  { value: "crypto",    label: "Crypto"            },
];

const ACCOUNTS = [
  { value: "all", label: "Toutes" },
  { value: "PEA", label: "PEA"   },
  { value: "CTO", label: "CTO"   },
  { value: "AV",  label: "AV"    },
  { value: "PER", label: "PER"   },
];

const SORTS = [
  { value: "score",      label: "Meilleur score"  },
  { value: "fees",       label: "Moins de frais"  },
  { value: "trustpilot", label: "Avis Trustpilot" },
  { value: "name",       label: "Alphabétique"    },
];

function FilterBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%",
      textAlign: "left",
      padding: "8px 12px",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: active ? 600 : 400,
      color: active ? "var(--accent)" : "var(--text-muted)",
      backgroundColor: active ? "var(--accent-light)" : "transparent",
      border: active ? "1px solid var(--accent-mid)" : "1px solid transparent",
      cursor: "pointer",
      transition: "all 150ms ease",
    }}>
      {label}
    </button>
  );
}

export function BrokerFilters() {
  const {
    category, setCategory,
    accountType, setAccountType,
    sortBy, setSortBy,
    maxDeposit, setMaxDeposit,
  } = useFilterStore();

  return (
    <aside style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 24 }} className="w-full lg:w-56">

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SlidersHorizontal size={13} color="var(--accent)" />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)" }}>
          Filtres
        </span>
      </div>

      {/* Catégorie */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
          Catégorie
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {CATEGORIES.map((cat) => (
            <FilterBtn key={cat.value} active={category === cat.value} label={cat.label} onClick={() => setCategory(cat.value)} />
          ))}
        </div>
      </div>

      {/* Enveloppe */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
          Enveloppe
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {ACCOUNTS.map((acc) => (
            <FilterBtn key={acc.value} active={accountType === acc.value} label={acc.label} onClick={() => setAccountType(acc.value)} />
          ))}
        </div>
      </div>

      {/* Dépôt max */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Dépôt max
          </p>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-sora)" }}>
            {maxDeposit >= 10000 ? "Illimité" : `${maxDeposit.toLocaleString("fr-FR")} €`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={10000}
          step={100}
          value={maxDeposit}
          onChange={(e) => setMaxDeposit(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>0 €</span>
          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>Illimité</span>
        </div>
      </div>

      {/* Tri */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
          Trier par
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SORTS.map((s) => (
            <FilterBtn key={s.value} active={sortBy === s.value} label={s.label} onClick={() => setSortBy(s.value)} />
          ))}
        </div>
      </div>
    </aside>
  );
}
