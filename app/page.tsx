import Link from "next/link";
import Image from "next/image";
import brokersData from "@/data/brokers.json";
import { BrokerCard } from "@/components/brokers/BrokerCard";
import { Broker } from "@/lib/brokers";
import { ArrowRight, ShieldCheck, RefreshCw, BarChart3, TrendingUp, Users, Award } from "lucide-react";
import { CategoryCard } from "@/components/home/CategoryCard";

const TOP_BROKERS = (brokersData as unknown as Broker[])
  .sort((a, z) => z.score_overall - a.score_overall)
  .slice(0, 3);

const STATS = [
  { value: "10+",    label: "Courtiers analysés",    icon: BarChart3 },
  { value: "100%",   label: "Données indépendantes", icon: ShieldCheck },
  { value: "2025",   label: "Données à jour",        icon: RefreshCw },
  { value: "42K+",   label: "Investisseurs aidés",   icon: Users },
];

const CATEGORIES = [
  { label: "Courtiers bourse", sublabel: "PEA, CTO, actions & ETF", tint: "--tint-blue",   href: "/courtiers?cat=broker" },
  { label: "Banques en ligne", sublabel: "Livrets, bourse, SCPI",   tint: "--tint-amber",  href: "/courtiers?cat=bank" },
  { label: "Assurances-vie",   sublabel: "Fonds euros, UC, PER",   tint: "--tint-purple", href: "/courtiers?cat=insurance" },
  { label: "Crypto-actifs",    sublabel: "CEX, DEX, staking",      tint: "--tint-rose",   href: "/courtiers?cat=crypto" },
];

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Hero centré ─────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(180deg, var(--accent-light) 0%, var(--bg) 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "80px 24px 72px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 14px",
              borderRadius: 100,
              fontSize: 12, fontWeight: 600,
              color: "var(--accent-text)",
              backgroundColor: "var(--accent-light)",
              border: "1px solid var(--accent-mid)",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                backgroundColor: "var(--accent)",
                display: "inline-block",
              }} />
              Données vérifiées 2025 · 100% indépendant
            </span>
          </div>

          <h1 className="animate-fade-up" style={{
            fontSize: "clamp(2.2rem, 5.5vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "var(--text)",
            marginBottom: 20,
          }}>
            Trouvez le meilleur<br />
            <span style={{ color: "var(--accent)" }}>courtier financier</span><br />
            pour votre profil.
          </h1>

          <p className="animate-fade-up delay-1" style={{
            fontSize: 17,
            lineHeight: 1.65,
            color: "var(--text-muted)",
            maxWidth: 520,
            margin: "0 auto 36px",
          }}>
            Comparez frais réels, enveloppes fiscales et services de plus de 10 acteurs financiers français.
            Simulation personnalisée, données officielles.
          </p>

          <div className="animate-fade-up delay-2" style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/comparer" className="btn-primary" style={{ padding: "13px 28px", fontSize: 15 }}>
              Lancer la comparaison
              <ArrowRight size={16} />
            </Link>
            <Link href="/courtiers" className="btn-secondary" style={{ padding: "13px 28px", fontSize: 15 }}>
              Voir tous les courtiers
            </Link>
          </div>

          {/* Social proof */}
          <p className="animate-fade-up delay-3" style={{
            marginTop: 28,
            fontSize: 12,
            color: "var(--text-faint)",
          }}>
            Mis à jour régulièrement · Aucun partenariat rémunéré sur le classement
          </p>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <div key={label} style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "22px 0",
                borderRight: i < 3 ? "1px solid var(--border)" : "none",
                justifyContent: "center",
              }}>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 9,
                  backgroundColor: "var(--accent-light)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={16} color="var(--accent)" />
                </div>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-sora)", color: "var(--text)", lineHeight: 1 }}>
                    {value}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 24px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
            Choisissez votre type d'investissement
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6 }}>
            Chaque enveloppe a ses avantages fiscaux et ses acteurs spécialisés
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="grid-cols-2 sm:grid-cols-4">
          {CATEGORIES.map(({ label, sublabel, tint, href }) => (
            <CategoryCard key={label} label={label} sublabel={sublabel} tint={tint} href={href} />
          ))}
        </div>
      </section>

      {/* ── Top brokers ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Award size={16} color="var(--accent)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Top sélection 2025
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Meilleures plateformes</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
              Classées par score global — frais, fiabilité, interface
            </p>
          </div>
          <Link href="/courtiers" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 500, color: "var(--accent)" }}>
            Voir tout <ArrowRight size={13} />
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="grid-cols-1 md:grid-cols-3">
          {TOP_BROKERS.map((broker, i) => (
            <BrokerCard key={broker.id} broker={broker} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* ── Why section ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="grid-cols-1 md:grid-cols-3">
          {[
            { icon: BarChart3, title: "Frais réels vérifiés", desc: "Courtage, change, garde, inactivité. Nous extrayons les tarifs officiels, pas des estimations approximatives.", tint: "--tint-blue" },
            { icon: ShieldCheck, title: "Classement neutre", desc: "Zéro partenariat commercial sur le classement. L'ordre reflète uniquement les données objectives collectées.", tint: "--tint-green" },
            { icon: RefreshCw, title: "Mise à jour auto", desc: "Notre système de veille scrape les pages tarifaires et détecte les modifications 1 à 2 fois par mois.", tint: "--tint-amber" },
          ].map(({ icon: Icon, title, desc, tint }) => (
            <div key={title} style={{
              padding: "24px",
              borderRadius: 14,
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-xs)",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                backgroundColor: `var(${tint})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <Icon size={18} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: "56px auto 0", padding: "0 24px 72px" }}>
        <div style={{
          borderRadius: 20,
          background: "linear-gradient(135deg, var(--accent) 0%, #065F52 100%)",
          padding: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}>
          <div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8, letterSpacing: "-0.02em" }}>
              Trouvez votre courtier idéal
            </h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
              Simulation gratuite · 2 minutes · Frais calculés sur votre profil exact
            </p>
          </div>
          <Link href="/comparer" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "13px 28px",
            borderRadius: 10,
            backgroundColor: "#fff",
            color: "var(--accent-text)",
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            flexShrink: 0,
            transition: "transform 150ms ease",
          }}>
            Commencer maintenant <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
