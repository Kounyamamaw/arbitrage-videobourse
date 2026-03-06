import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Theme ──────────────────────────────────────────────────────────────────
type ThemeStore = {
  isDark: boolean;
  toggle: () => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggle: () => {
        const next = !get().isDark;
        set({ isDark: next });
        // Synchronise avec Tailwind darkMode:"class"
        if (next) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
    }),
    { name: "theme" }  // clé localStorage
  )
);

// ── Filters ────────────────────────────────────────────────────────────────
type FilterStore = {
  category:       string;
  accountType:    string;
  sortBy:         string;
  maxDeposit:     number;
  setCategory:    (v: string) => void;
  setAccountType: (v: string) => void;
  setSortBy:      (v: string) => void;
  setMaxDeposit:  (v: number) => void;
  reset:          () => void;
};

export const useFilterStore = create<FilterStore>((set) => ({
  category:       "all",
  accountType:    "all",
  sortBy:         "score",
  maxDeposit:     10000,
  setCategory:    (v) => set({ category: v }),
  setAccountType: (v) => set({ accountType: v }),
  setSortBy:      (v) => set({ sortBy: v }),
  setMaxDeposit:  (v) => set({ maxDeposit: v }),
  reset: () => set({ category: "all", accountType: "all", sortBy: "score", maxDeposit: 10000 }),
}));
