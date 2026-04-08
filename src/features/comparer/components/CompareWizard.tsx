"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ChevronLeft,
  TrendingUp, Shield, Bitcoin, Home, Zap, LayoutGrid,
  Sprout, BarChart2, Activity, Briefcase,
  Flag, Globe, Plane,
  Target, User, Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";

const OBJECTIVES = [
  { value: "bourse",  label: "Investir en bourse",  icon: TrendingUp, desc: "Actions, ETF, obligations" },
  { value: "av",      label: "Assurance-vie",        icon: Shield,     desc: "Épargne long terme" },
  { value: "crypto",  label: "Crypto-actifs",        icon: Bitcoin,    desc: "Bitcoin, Ethereum..." },
  { value: "scpi",    label: "SCPI / Immobilier",    icon: Home,       desc: "Pierre-papier" },
  { value: "cfd",     label: "Trading / CFD",        icon: Zap,        desc: "Levier, court terme" },
  { value: "all",     label: "Tout comparer",        icon: LayoutGrid, desc: "Voir toutes les options" },
];

const PROFILES = [
  { value: "beginner",     label: "Débutant",             icon: Sprout,    desc: "Je découvre l'investissement" },
  { value: "intermediate", label: "Investisseur régulier", icon: BarChart2, desc: "DCA, ETF, moyen terme" },
  { value: "active",       label: "Investisseur actif",   icon: Activity,  desc: "+ 10 ordres par mois" },
  { value: "pro",          label: "Professionnel",        icon: Briefcase, desc: "Gros volumes, multi-marchés" },
];

const ACCOUNT_TYPES = [
  { value: "PEA",  label: "PEA",           desc: "Exonération fiscale après 5 ans" },
  { value: "CTO",  label: "CTO",           desc: "Accès aux marchés mondiaux" },
  { value: "AV",   label: "Assurance-vie", desc: "Fiscalité avantageuse" },
  { value: "PER",  label: "PER",           desc: "Retraite, déduction fiscale" },
];

const MARKETS = [
  { value: "FR", label: "France",  icon: Flag },
  { value: "EU", label: "Europe",  icon: Globe },
  { value: "US", label: "USA",     icon: Plane },
];

const STEPS = [
  { num: 1, label: "Objectif",      icon: Target },
  { num: 2, label: "Profil",        icon: User },
  { num: 3, label: "Configuration", icon: Settings2 },
];

type Config = {
  objective:     string;
  profile:       string;
  accountType:   string;
  market:        string;
  orderAmount:   number;
  ordersPerMonth: number;
};

export function CompareWizard() {
  const router = useRouter();
  const [step, setStep]     = useState(1);
  const [visible, setVisible] = useState(true);
  const [config, setConfig] = useState<Config>({
    objective:     "",
    profile:       "",
    accountType:   "PEA",
    market:        "FR",
    orderAmount:   300,
    ordersPerMonth: 4,
  });

  const set = (key: keyof Config, value: string | number) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const canNext = () => {
    if (step === 1) return !!config.objective;
    if (step === 2) return !!config.profile;
    return true;
  };

  const animateStep = (next: number) => {
    setVisible(false);
    setTimeout(() => { setStep(next); setVisible(true); }, 220);
  };

  const handleNext = () => {
    if (step < 3) { animateStep(step + 1); return; }
    const params = new URLSearchParams({
      objective:      config.objective,
      profile:        config.profile,
      accountType:    config.accountType,
      market:         config.market,
      orderAmount:    String(config.orderAmount),
      ordersPerMonth: String(config.ordersPerMonth),
    });
    router.push(`/dashboard/comparer/resultats?${params.toString()}`);
  };

  return (
    <>
      {/* Step indicator */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, marginBottom: 32, flexWrap: "wrap" }}>
        {STEPS.map(({ num, label, icon: Icon }) => {
          const active = step === num;
          const done   = step > num;
          return (
            <div key={num} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 12px", borderRadius: 100,
                backgroundColor: active ? "var(--accent)" : done ? "var(--accent-light)" : "var(--bg)",
                border: `1px solid ${active ? "var(--accent)" : done ? "var(--accent-mid)" : "var(--border)"}`,
                transition: "all 200ms ease",
                whiteSpace: "nowrap",
              }}>
                {done ? (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <Icon size={12} color={active ? "#fff" : "var(--text-faint)"} />
                )}
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: active ? "#fff" : done ? "var(--accent-text)" : "var(--text-faint)",
                }}>
                  {label}
                </span>
              </div>
              {num < 3 && (
                <div style={{ width: 14, height: 1, backgroundColor: "var(--border)", flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "clamp(16px, 5vw, 32px)",
        boxShadow: "var(--shadow-md)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 200ms ease, transform 200ms ease",
        minWidth: 0,
        overflow: "hidden",
      }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                Quel est votre objectif d'investissement ?
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                Sélectionnez le type de placement qui vous correspond
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 10 }}>
              {OBJECTIVES.map(({ value, label, icon: Icon, desc }) => {
                const active = config.objective === value;
                return (
                  <button key={value} onClick={() => set("objective", value)} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    backgroundColor: active ? "var(--accent-light)" : "var(--bg)",
                    border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    transition: "all 150ms ease",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      backgroundColor: active ? "var(--accent)" : "var(--surface)",
                      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={16} color={active ? "#fff" : "var(--text-muted)"} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: active ? "var(--accent-text)" : "var(--text)" }}>{label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{desc}</div>
                    </div>
                    {active && (
                      <div style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3 5.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                Quel est votre profil d'investisseur ?
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                Pour adapter les recommandations à votre niveau et fréquence d'investissement
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PROFILES.map(({ value, label, icon: Icon, desc }) => {
                const active = config.profile === value;
                return (
                  <button key={value} onClick={() => set("profile", value)} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 18px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    backgroundColor: active ? "var(--accent-light)" : "var(--bg)",
                    border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    transition: "all 150ms ease",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      backgroundColor: active ? "var(--accent)" : "var(--surface)",
                      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={18} color={active ? "#fff" : "var(--text-muted)"} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: active ? "var(--accent-text)" : "var(--text)" }}>{label}</div>
                      <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>{desc}</div>
                    </div>
                    {active && (
                      <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                Votre configuration
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                Pour un calcul de frais précis sur votre situation
              </p>
            </div>

            {/* Enveloppe */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)", marginBottom: 10 }}>
                Enveloppe cible
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ACCOUNT_TYPES.map((acc) => {
                  const active = config.accountType === acc.value;
                  return (
                    <button key={acc.value} onClick={() => set("accountType", acc.value)} title={acc.desc} style={{
                      padding: "9px 18px", borderRadius: 9, cursor: "pointer",
                      fontSize: 13, fontWeight: 600,
                      backgroundColor: active ? "var(--accent)" : "var(--bg)",
                      color: active ? "#fff" : "var(--text-muted)",
                      border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      transition: "all 150ms ease",
                    }}>
                      {acc.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Marché */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)", marginBottom: 10 }}>
                Marché principal
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {MARKETS.map(({ value, label, icon: Icon }) => {
                  const active = config.market === value;
                  return (
                    <button key={value} onClick={() => set("market", value)} style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "9px 18px", borderRadius: 9, cursor: "pointer",
                      fontSize: 13, fontWeight: 500,
                      backgroundColor: active ? "var(--accent)" : "var(--bg)",
                      color: active ? "#fff" : "var(--text-muted)",
                      border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      transition: "all 150ms ease",
                    }}>
                      <Icon size={13} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Montant */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)" }}>
                  Montant par ordre
                </p>
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-sora)" }}>
                  {config.orderAmount.toLocaleString("fr-FR")}€
                </span>
              </div>
              <input type="range" min={50} max={10000} step={50} value={config.orderAmount} onChange={(e) => set("orderAmount", Number(e.target.value))} style={{ width: "100%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>
                <span>50€</span><span>2 500€</span><span>10 000€</span>
              </div>
            </div>

            {/* Ordres/mois */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)" }}>
                  Ordres par mois
                </p>
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-sora)" }}>
                  {config.ordersPerMonth}<span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-muted)", marginLeft: 4 }}>/ mois</span>
                </span>
              </div>
              <input type="range" min={1} max={30} step={1} value={config.ordersPerMonth} onChange={(e) => set("ordersPerMonth", Number(e.target.value))} style={{ width: "100%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>
                <span>1 / mois</span><span>15 / mois</span><span>30 / mois</span>
              </div>
            </div>

            {/* Recap */}
            <div style={{
              borderRadius: 10, padding: "14px 16px", backgroundColor: "var(--bg)",
              border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6,
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-faint)", marginBottom: 4 }}>
                Récapitulatif
              </p>
              {[
                { label: "Enveloppe",     value: config.accountType },
                { label: "Marché",        value: config.market },
                { label: "Montant/ordre", value: `${config.orderAmount.toLocaleString("fr-FR")}€` },
                { label: "Ordres/mois",   value: `${config.ordersPerMonth}` },
                { label: "Volume mensuel",value: `${(config.orderAmount * config.ordersPerMonth).toLocaleString("fr-FR")}€` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 28, paddingTop: 20,
          borderTop: "1px solid var(--border)",
          gap: 12, flexWrap: "wrap",
        }}>
          <button
            onClick={() => animateStep(step - 1)}
            className={cn("btn-secondary", step === 1 && "invisible")}
            style={{ gap: 6 }}
          >
            <ChevronLeft size={15} />
            Retour
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Dots */}
            <div style={{ display: "flex", gap: 5 }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{
                  height: 5, borderRadius: 3,
                  width: step === s ? 20 : 5,
                  backgroundColor: step >= s ? "var(--accent)" : "var(--border)",
                  transition: "all 250ms ease",
                }} />
              ))}
            </div>
            <button onClick={handleNext} disabled={!canNext()} className="btn-primary">
              {step === 3 ? "Voir les résultats" : "Continuer"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
