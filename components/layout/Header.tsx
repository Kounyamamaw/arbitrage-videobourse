"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useThemeStore } from "@/lib/store";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/",          label: "Accueil"   },
  { href: "/comparer",  label: "Comparer"  },
  { href: "/courtiers", label: "Courtiers" },
  { href: "/par-actif", label: "Par actif" },
];

export function Header() {
  const pathname = usePathname();
  const { isDark, toggle } = useThemeStore();
  const [open, setOpen] = useState(false);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      backgroundColor: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      backdropFilter: "blur(16px)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Image
              src={isDark ? "/logos/logo-dark.svg" : "/logos/logo-light.svg"}
              alt="ArbitrAge"
              width={148}
              height={34}
              priority
              unoptimized
              style={{ height: 32, width: "auto", display: "block" }}
            />
          </Link>

          {/* Nav desktop */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden md:flex">
            {NAV.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  backgroundColor: active ? "var(--accent-light)" : "transparent",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                }}>
                  {label}
                </Link>
              );
            })}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={toggle} aria-label="Thème" style={{
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 8,
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}>
              {isDark
                ? <Sun  size={14} color="var(--text-muted)" />
                : <Moon size={14} color="var(--text-muted)" />
              }
            </button>

            <Link href="/comparer" className="btn-primary hidden md:inline-flex" style={{ padding: "7px 16px", fontSize: 13 }}>
              Comparer
            </Link>

            <button onClick={() => setOpen(!open)} className="flex md:hidden" style={{
              width: 36, height: 36,
              alignItems: "center", justifyContent: "center",
              borderRadius: 8,
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}>
              {open ? <X size={16} color="var(--text-muted)" /> : <Menu size={16} color="var(--text-muted)" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden" style={{
            borderTop: "1px solid var(--border)",
            padding: "12px 0 16px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}>
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: pathname === href ? 600 : 400,
                color: pathname === href ? "var(--accent)" : "var(--text-muted)",
                backgroundColor: pathname === href ? "var(--accent-light)" : "transparent",
                textDecoration: "none",
              }}>
                {label}
              </Link>
            ))}
            <div style={{ paddingTop: 8 }}>
              <Link href="/comparer" onClick={() => setOpen(false)} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Comparer maintenant
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
