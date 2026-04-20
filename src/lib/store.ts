import { create } from "zustand";

type FilterStore = {
  // Filtres de base
  category:    string;
  accountType: string;
  sortBy:      string;
  maxDeposit:  number;
  // Filtres avancés
  assetClass:  string;   // all | actions | etf | crypto | cfd | options | futures | forex | obligations
  level:       string;   // all | debutant | intermediaire | expert
  fiscality:   string;   // all | france | etranger | ifu
  platform:    string;   // all | tradingview | metatrader | prt | ninjatrader | atas
  hasDCA:       boolean;
  hasFractions: boolean;
  hasDemo:      boolean;
  // Actions
  setCategory:    (v: string) => void;
  setAccountType: (v: string) => void;
  setSortBy:      (v: string) => void;
  setMaxDeposit:  (v: number) => void;
  setAssetClass:  (v: string) => void;
  setLevel:       (v: string) => void;
  setFiscality:   (v: string) => void;
  setPlatform:    (v: string) => void;
  setHasDCA:      (v: boolean) => void;
  setHasFractions:(v: boolean) => void;
  setHasDemo:     (v: boolean) => void;
  reset:          () => void;
};

const DEFAULTS = {
  category: "all", accountType: "all", sortBy: "score", maxDeposit: 10000,
  assetClass: "all", level: "all", fiscality: "all", platform: "all",
  hasDCA: false, hasFractions: false, hasDemo: false,
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULTS,
  setCategory:    (v) => set({ category: v }),
  setAccountType: (v) => set({ accountType: v }),
  setSortBy:      (v) => set({ sortBy: v }),
  setMaxDeposit:  (v) => set({ maxDeposit: v }),
  setAssetClass:  (v) => set({ assetClass: v }),
  setLevel:       (v) => set({ level: v }),
  setFiscality:   (v) => set({ fiscality: v }),
  setPlatform:    (v) => set({ platform: v }),
  setHasDCA:      (v) => set({ hasDCA: v }),
  setHasFractions:(v) => set({ hasFractions: v }),
  setHasDemo:     (v) => set({ hasDemo: v }),
  reset: () => set(DEFAULTS),
}));