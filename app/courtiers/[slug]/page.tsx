import { notFound } from "next/navigation";
import Link from "next/link";
import brokersData from "@/data/brokers.json";
import { Broker } from "@/lib/brokers";
import { BrokerDetailClient } from "@/components/brokers/BrokerDetailClient";
import { ArrowLeft, ExternalLink } from "lucide-react";

// On définit une constante propre pour éviter de répéter le "as unknown as Broker[]"
const allBrokers = brokersData as unknown as Broker[];

export async function generateStaticParams() {
  return allBrokers.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const broker = allBrokers.find((b) => b.slug === params.slug);
  if (!broker) return {};
  return {
    title: `${broker.name} — Avis & Frais 2025`,
    description: broker.tagline,
  };
}

export default function BrokerDetailPage({ params }: { params: { slug: string } }) {
  const broker = allBrokers.find((b) => b.slug === params.slug);
  if (!broker) notFound();

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link href="/courtiers" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
                <ArrowLeft size={14} />
                Courtiers
              </Link>
              <span style={{ color: "var(--border)", fontSize: 13 }}>/</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{broker.name}</span>
            </div>
            <a href={broker.affiliate_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: "7px 16px", fontSize: 13, gap: 6 }}>
              Ouvrir un compte
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      <BrokerDetailClient broker={broker} allBrokers={allBrokers} />
    </div>
  );
}