"use client";

import { useState } from "react";
import { useFilterStore } from "@/lib/store";
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from "lucide-react";

const CATEGORIES = [
  { value: "all",       label: "Tous les acteurs" },
  { value: "broker",    label: "Courtiers bourse" },
  { value: "neobanque", label: "Néobanques"        },
  { value: "bank",      label: "Banques"           },
  { value: "cfd",       label: "CFD FOREX"         },
  { value: "crypto",    label: "Crypto"            },
  { value: "insurance", label: "Assurances-vie"    },
];

const ACCOUNTS = [
  { value: "all",             label: "Toutes"            },
  { value: "PEA",             label: "PEA"               },
  { value: "CTO",             label: "CTO"               },
  { value: "AV",              label: "Assurance Vie"     },
  { value: "PER",             label: "PER"               },
  { value: "FUTURES OPTIONS", label: "Futures Options"   },
  { value: "cfd",             label: "CFD FOREX"         },
];

const SORTS = [
  { value: "score",      label: "Meilleur score"  },
  { value: "fees",       label: "Moins de frais"  },
  { value: "trustpilot", label: "Avis Trustpilot" },
];

const ASSET_CLASSES = [
  { value: "all",         label: "Tous les actifs" },
  { value: "actions",     label: "Actions"         },
  { value: "etf",         label: "ETF"             },
  { value: "crypto",      label: "Crypto"          },
  { value: "cfd",         label: "CFD"             },
  { value: "options",     label: "Options"         },
  { value: "futures",     label: "Futures"         },
  { value: "forex",       label: "Forex"           },
  { value: "obligations", label: "Obligations"     },
];

const LEVELS = [
  { value: "all",           label: "Tous niveaux"  },
  { value: "debutant",      label: "Débutant"      },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "expert",        label: "Expert"        },
];

const FISCALITIES = [
  { value: "all",      label: "Toutes"              },
  { value: "france",   label: "Compte en France"    },
  { value: "etranger", label: "Compte à l'étranger" },
  { value: "ifu",      label: "IFU fourni"          },
];

const PLATFORMS = [
  { value: "all",         label: "Toutes"      },
  { value: "prt",         label: "ProRealTime" },
  { value: "tradingview", label: "TradingView" },
  { value: "metatrader",  label: "MetaTrader"  },
  { value: "ninjatrader", label: "NinjaTrader" },
  { value: "atas",        label: "ATAS"        },
];

function SectionTitle({ label }: { label: string }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
      {label}
    </p>
  );
}

function FilterBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 8,
      fontSize: 13, fontWeight: active ? 600 : 400,
      color: active ? "var(--accent)" : "var(--text-muted)",
      backgroundColor: active ? "var(--accent-light)" : "transparent",
      border: active ? "1px solid var(--accent-mid)" : "1px solid transparent",
      cursor: "pointer", transition: "all 150ms ease",
    }}>{label}</button>
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, cursor: "pointer", backgroundColor: checked ? "var(--accent-light)" : "transparent", border: checked ? "1px solid var(--accent-mid)" : "1px solid transparent", transition: "all 150ms" }}>
      <div onClick={() => onChange(!checked)} style={{
        width: 32, height: 18, borderRadius: 9, flexShrink: 0,
        backgroundColor: checked ? "var(--accent)" : "var(--border)",
        position: "relative", transition: "background 200ms", cursor: "pointer",
      }}>
        <div style={{ position: "absolute", top: 3, left: checked ? 17 : 3, width: 12, height: 12, borderRadius: "50%", backgroundColor: "#fff", transition: "left 200ms" }} />
      </div>
      <span style={{ fontSize: 13, color: checked ? "var(--accent)" : "var(--text-muted)", fontWeight: checked ? 600 : 400 }}>{label}</span>
    </label>
  );
}

function MobileFilterDrawer() {
  const [open, setOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const {
    category, setCategory, accountType, setAccountType, sortBy, setSortBy,
    maxDeposit, setMaxDeposit, assetClass, setAssetClass, level, setLevel,
    fiscality, setFiscality, platform, setPlatform, hasDCA, setHasDCA,
    hasFractions, setHasFractions, hasDemo, setHasDemo, reset,
  } = useFilterStore();

  const activeCount = [
    category !== "all", accountType !== "all", sortBy !== "score", maxDeposit < 10000,
    assetClass !== "all", level !== "all", fiscality !== "all", platform !== "all",
    hasDCA, hasFractions, hasDemo,
  ].filter(Boolean).length;

  const hasActiveAdvanced = assetClass !== "all" || level !== "all" || fiscality !== "all" || platform !== "all" || hasDCA || hasFractions;

  return (
    <div className="lg:hidden sticky top-0 z-20 bg-background/95 pt-1 pb-2 -mx-1 px-1">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10,
            border: `1.5px solid ${activeCount > 0 ? "var(--accent-mid)" : "var(--border)"}`,
            backgroundColor: activeCount > 0 ? "var(--accent-light)" : "var(--surface)",
            cursor: "pointer", fontSize: 13, fontWeight: 600,
            color: activeCount > 0 ? "var(--accent)" : "var(--text-muted)", transition: "all 150ms",
          }}
        >
          <SlidersHorizontal size={14} />
          Filtres
          {activeCount > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 100, backgroundColor: "var(--accent)", color: "#fff" }}>
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={reset} style={{ fontSize: 11, color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}>
            Réinit.
          </button>
        )}
      </div>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 9990, backdropFilter: "blur(2px)" }} />
      )}

      <div style={{
        position: "fixed", left: 0, top: 0, bottom: 0, width: "min(320px, 90vw)",
        backgroundColor: "var(--bg)", borderRight: "1px solid var(--border)",
        zIndex: 9991, transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 280ms cubic-bezier(0.34,1.1,0.64,1)",
        display: "flex", flexDirection: "column",
        boxShadow: open ? "4px 0 24px rgba(0,0,0,0.12)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SlidersHorizontal size={14} color="var(--accent)" />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)" }}>Filtres</span>
            {activeCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 100, backgroundColor: "var(--accent)", color: "#fff" }}>{activeCount}</span>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {activeCount > 0 && <button onClick={reset} style={{ fontSize: 11, color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer" }}>Réinit.</button>}
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)", display: "flex" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <SectionTitle label="Catégorie" />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {CATEGORIES.map((c) => <FilterBtn key={c.value} active={category === c.value} label={c.label} onClick={() => setCategory(c.value)} />)}
            </div>
          </div>
          <div>
            <SectionTitle label="Enveloppe" />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {ACCOUNTS.map((a) => <FilterBtn key={a.value} active={accountType === a.value} label={a.label} onClick={() => setAccountType(a.value)} />)}
            </div>
            <div style={{ marginTop: 8 }}>
              <Toggle checked={hasDemo} label="Compte démo disponible" onChange={setHasDemo} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <SectionTitle label="Dépôt min" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                {maxDeposit >= 10000 ? "Illimité" : `${maxDeposit.toLocaleString("fr-FR")} €`}
              </span>
            </div>
            <input type="range" min={0} max={10000} step={100} value={maxDeposit} onChange={(e) => setMaxDeposit(Number(e.target.value))} style={{ width: "100%" }} />
          </div>
          <div>
            <SectionTitle label="Trier par" />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {SORTS.map((s) => <FilterBtn key={s.value} active={sortBy === s.value} label={s.label} onClick={() => setSortBy(s.value)} />)}
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <button onClick={() => setShowAdvanced(!showAdvanced)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: hasActiveAdvanced ? "var(--accent)" : "var(--text-faint)" }}>Filtres avancés</span>
                {hasActiveAdvanced && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 100, backgroundColor: "var(--accent)", color: "#fff" }}>{[assetClass !== "all", level !== "all", fiscality !== "all", platform !== "all", hasDCA, hasFractions].filter(Boolean).length}</span>}
              </div>
              {showAdvanced ? <ChevronUp size={14} color="var(--text-faint)" /> : <ChevronDown size={14} color="var(--text-faint)" />}
            </button>
            {showAdvanced && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                <div><SectionTitle label="Classe d'actif" /><div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{ASSET_CLASSES.map((a) => <FilterBtn key={a.value} active={assetClass === a.value} label={a.label} onClick={() => setAssetClass(a.value)} />)}</div></div>
                <div><SectionTitle label="Niveau" /><div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{LEVELS.map((l) => <FilterBtn key={l.value} active={level === l.value} label={l.label} onClick={() => setLevel(l.value)} />)}</div></div>
                <div><SectionTitle label="Fiscalité" /><div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{FISCALITIES.map((fi) => <FilterBtn key={fi.value} active={fiscality === fi.value} label={fi.label} onClick={() => setFiscality(fi.value)} />)}</div></div>
                <div><SectionTitle label="Plateforme compatible" /><div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{PLATFORMS.map((p) => <FilterBtn key={p.value} active={platform === p.value} label={p.label} onClick={() => setPlatform(p.value)} />)}</div></div>
                <div><SectionTitle label="Fonctionnalités" /><div style={{ display: "flex", flexDirection: "column", gap: 4 }}><Toggle checked={hasDCA} label="DCA / Investissement auto" onChange={setHasDCA} /><Toggle checked={hasFractions} label="Fractions d'actions" onChange={setHasFractions} /></div></div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <button onClick={() => setOpen(false)} style={{ width: "100%", padding: "11px 16px", borderRadius: 10, backgroundColor: "var(--accent)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff" }}>
            Voir les résultats
          </button>
        </div>
      </div>
    </div>
  );
}

export function BrokerFilters() {
  const {
    category, setCategory, accountType, setAccountType, sortBy, setSortBy,
    maxDeposit, setMaxDeposit, assetClass, setAssetClass, level, setLevel,
    fiscality, setFiscality, platform, setPlatform, hasDCA, setHasDCA,
    hasFractions, setHasFractions, hasDemo, setHasDemo, reset,
  } = useFilterStore();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const hasActiveAdvanced = assetClass !== "all" || level !== "all" || fiscality !== "all" || platform !== "all" || hasDCA || hasFractions;

  return (
    <>
    <MobileFilterDrawer />
    <aside className="hidden lg:flex w-60 shrink-0 flex-col gap-5 sticky top-4 self-start max-h-[calc(100dvh-80px)] overflow-y-auto pr-1">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SlidersHorizontal size={13} color="var(--accent)" />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)" }}>Filtres</span>
        </div>
        <button onClick={reset} style={{ fontSize: 11, color: "var(--text-faint)", cursor: "pointer", background: "none", border: "none", padding: 0 }}>Réinit.</button>
      </div>
      <div>
        <SectionTitle label="Catégorie" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {CATEGORIES.map((c) => <FilterBtn key={c.value} active={category === c.value} label={c.label} onClick={() => setCategory(c.value)} />)}
        </div>
      </div>
      <div>
        <SectionTitle label="Enveloppe" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {ACCOUNTS.map((a) => <FilterBtn key={a.value} active={accountType === a.value} label={a.label} onClick={() => setAccountType(a.value)} />)}
        </div>
        <div style={{ marginTop: 8 }}>
          <Toggle checked={hasDemo} label="Compte démo disponible" onChange={setHasDemo} />
        </div>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <SectionTitle label="Dépôt min" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-sora)" }}>
            {maxDeposit >= 10000 ? "Illimité" : `${maxDeposit.toLocaleString("fr-FR")} €`}
          </span>
        </div>
        <input type="range" min={0} max={10000} step={100} value={maxDeposit} onChange={(e) => setMaxDeposit(Number(e.target.value))} style={{ width: "100%" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>0 €</span>
          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>Illimité</span>
        </div>
      </div>
      <div>
        <SectionTitle label="Trier par" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SORTS.map((s) => <FilterBtn key={s.value} active={sortBy === s.value} label={s.label} onClick={() => setSortBy(s.value)} />)}
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <button onClick={() => setShowAdvanced(!showAdvanced)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: hasActiveAdvanced ? "var(--accent)" : "var(--text-faint)" }}>Filtres avancés</span>
            {hasActiveAdvanced && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 100, backgroundColor: "var(--accent)", color: "#fff" }}>{[assetClass !== "all", level !== "all", fiscality !== "all", platform !== "all", hasDCA, hasFractions].filter(Boolean).length}</span>}
          </div>
          {showAdvanced ? <ChevronUp size={14} color="var(--text-faint)" /> : <ChevronDown size={14} color="var(--text-faint)" />}
        </button>
        {showAdvanced && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            <div><SectionTitle label="Classe d'actif" /><div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{ASSET_CLASSES.map((a) => <FilterBtn key={a.value} active={assetClass === a.value} label={a.label} onClick={() => setAssetClass(a.value)} />)}</div></div>
            <div><SectionTitle label="Niveau" /><div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{LEVELS.map((l) => <FilterBtn key={l.value} active={level === l.value} label={l.label} onClick={() => setLevel(l.value)} />)}</div></div>
            <div><SectionTitle label="Fiscalité" /><div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{FISCALITIES.map((fi) => <FilterBtn key={fi.value} active={fiscality === fi.value} label={fi.label} onClick={() => setFiscality(fi.value)} />)}</div></div>
            <div><SectionTitle label="Plateforme compatible" /><div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{PLATFORMS.map((p) => <FilterBtn key={p.value} active={platform === p.value} label={p.label} onClick={() => setPlatform(p.value)} />)}</div></div>
            <div><SectionTitle label="Fonctionnalités" /><div style={{ display: "flex", flexDirection: "column", gap: 4 }}><Toggle checked={hasDCA} label="DCA / Investissement auto" onChange={setHasDCA} /><Toggle checked={hasFractions} label="Fractions d'actions" onChange={setHasFractions} /></div></div>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}