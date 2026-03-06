"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

type Props = { label: string; sublabel: string; tint: string; href: string; };

export function CategoryCard({ label, sublabel, tint, href }: Props) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block", padding: "20px", borderRadius: 14,
        backgroundColor: `var(${tint})`,
        border: "1px solid var(--border)",
        transition: "transform 150ms ease, box-shadow 150ms ease",
        textDecoration: "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "var(--shadow-md)" : "none",
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-sora)" }}>{label}</p>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{sublabel}</p>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 4, color: "var(--accent)", fontSize: 12, fontWeight: 600 }}>
        Comparer <ArrowRight size={12} />
      </div>
    </Link>
  );
}
