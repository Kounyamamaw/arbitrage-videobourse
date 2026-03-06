"use client";

import Link from "next/link";

const LINKS = [
  { label: "Accueil",    href: "/" },
  { label: "Comparer",   href: "/comparer" },
  { label: "Courtiers",  href: "/courtiers" },
  { label: "Par actif",  href: "/par-actif" },
  { label: "Admin",      href: "/admin" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      backgroundColor: "var(--surface)",
      marginTop: "auto",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-sora)", color: "var(--text)" }}>
                ArbitrAge
                <span style={{ marginLeft: 8, fontWeight: 400, fontSize: 12, color: "var(--text-faint)" }}>by VideoBourse</span>
              </p>
              <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4, maxWidth: 360 }}>
                Comparateur indépendant de courtiers et acteurs financiers français. Données indicatives.
              </p>
            </div>
            <nav style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
              {LINKS.map(({ label, href }) => (
                <Link key={href} href={href} style={{
                  fontSize: 13,
                  color: "var(--text-faint)",
                  textDecoration: "none",
                  transition: "color 150ms ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-faint)"; }}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div style={{ height: 1, backgroundColor: "var(--border)" }} />
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
            <p style={{ fontSize: 12, color: "var(--text-faint)" }}>
              &copy; {year} ArbitrAge by VideoBourse. Outil de comparaison indépendant.
            </p>
            <p style={{ fontSize: 12, color: "var(--text-faint)" }}>
              Liens affiliés — politique de transparence
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
