"use client";

import { useMemo, useState } from "react";
import { useFilterStore } from "@/lib/store";
import { Broker } from "@/lib/brokers";
import { BrokerCard } from "./BrokerCard";
import { Search, X } from "lucide-react";
import brokersData from "@/data/brokers.json";

const ALL_BROKERS = brokersData as unknown as Broker[];

export function BrokerGrid() {
  const { category, accountType, sortBy, maxDeposit } = useFilterStore();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = [...ALL_BROKERS];

    // Category filter
    if (category && category !== "all") {
      list = list.filter((b) => b.category === category);
    }

    // Account type filter
    if (accountType && accountType !== "all") {
      list = list.filter((b) => b.accounts.includes(accountType));
    }

    // Max deposit filter
    if (maxDeposit < 10000) {
      list = list.filter((b) => b.deposit_minimum <= maxDeposit);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.tagline.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "fees":
        list.sort((a, z) => z.score_fees - a.score_fees);
        break;
      case "trustpilot":
        list.sort((a, z) => z.trustpilot_score - a.trustpilot_score);
        break;
      case "name":
        list.sort((a, z) => a.name.localeCompare(z.name));
        break;
      case "score":
      default:
        list.sort((a, z) => z.score_overall - a.score_overall);
    }

    return list;
  }, [category, accountType, sortBy, maxDeposit, search]);

  return (
    <div className="flex-1 space-y-5">
      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-faint)" }}
        />
        <input
          type="text"
          placeholder="Rechercher un courtier ou banque..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: "36px", paddingRight: search ? "36px" : "12px" }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={13} style={{ color: "var(--text-faint)" }} />
          </button>
        )}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--text-faint)" }}>
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </p>
        {(category !== "all" || accountType !== "all") && (
          <button
            onClick={() => {
              useFilterStore.getState().setCategory("all");
              useFilterStore.getState().setAccountType("all");
            }}
            className="text-xs"
            style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          className="rounded-xl p-16 text-center"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px dashed var(--border)",
          }}
        >
          <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
            Aucun résultat
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Modifiez les filtres pour afficher des courtiers
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((broker, i) => (
            <BrokerCard key={broker.id} broker={broker} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
