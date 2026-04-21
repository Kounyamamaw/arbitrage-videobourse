"use client";
import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/page-container";
import { IconUsers, IconEye, IconClock, IconBounceRight, IconArrowUpRight } from "@tabler/icons-react";

type Stats = {
  visitors: number; pageviews: number; sessions: number;
  visitorsMonth: number; pageviewsMonth: number; sessionsMonth: number;
  bounceRate: number; visitDuration: number;
  topPages: { page: string; visitors: number }[];
  topSources: { source: string; visitors: number }[];
};

type BrokerAgg = { broker_id: string; broker_name: string; total: number; sources: Record<string, number> };
type ClickFeed = { broker_id: string; broker_name: string; source: string; created_at: string };
type ClickSection = { byBroker: BrokerAgg[]; total: number; recent: ClickFeed[] };
type ClickStats = {
  affiliate: ClickSection;
  demo: ClickSection;
  tableExists?: boolean;
  tableError?: string;
};

function fmt(n: number) { return n > 0 ? n.toLocaleString("fr-FR") : "—"; }
function fmtDuration(s: number) {
  if (!s || s <= 0) return "—";
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${s % 60 > 0 ? ` ${s % 60}s` : ""}`;
}

function KpiCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-sm text-muted-foreground truncate flex-1 min-w-0">{label}</span>
      <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold tabular-nums w-8 text-right shrink-0">{value}</span>
    </div>
  );
}

// Carte réutilisable "Clics par intermédiaire" + "Derniers clics"
function ClickCards({ section, accentColor = "bg-primary" }: { section: ClickSection; accentColor?: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Classement */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold">Clics par intermédiaire</p>
          <span className="text-xs text-muted-foreground">{section.total} total</span>
        </div>
        {section.byBroker.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun clic pour l&apos;instant</p>
        ) : (
          section.byBroker.slice(0, 10).map(({ broker_id, broker_name, total }) => (
            <div key={broker_id} className="flex items-center gap-3 py-1.5">
              <a
                href={`/dashboard/courtiers/${broker_id}`}
                className="text-sm text-muted-foreground hover:text-primary truncate flex-1 min-w-0 transition-colors"
              >
                {broker_name}
              </a>
              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                <div
                  className={`h-full rounded-full ${accentColor}`}
                  style={{ width: `${Math.round((total / (section.byBroker[0]?.total ?? 1)) * 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <IconArrowUpRight className="size-3 text-primary" />
                <span className="text-sm font-semibold tabular-nums w-6 text-right">{total}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feed */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="font-semibold mb-4">Derniers clics</p>
        {section.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun clic pour l&apos;instant</p>
        ) : (
          <div className="space-y-2">
            {section.recent.map((c, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">{c.source}</span>
                <span className="truncate flex-1">{c.broker_name}</span>
                <span className="shrink-0 tabular-nums">
                  {new Date(c.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrafficPage() {
  const [stats, setStats]               = useState<Stats | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [clicks, setClicks]             = useState<ClickStats | null>(null);
  const [clicksLoading, setClicksLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plausible")
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setStats(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));

    fetch("/api/affiliate-clicks")
      .then(r => r.json())
      .then(d => setClicks(d))
      .catch(() => setClicks(null))
      .finally(() => setClicksLoading(false));
  }, []);

  const notReady = !loading && (!!error || !stats);

  const hasAffiliateClicks = (clicks?.affiliate?.total ?? 0) > 0;
  const hasDemoClicks      = (clicks?.demo?.total ?? 0) > 0;

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-6">

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trafic</h2>
          <p className="text-muted-foreground mt-1">videobourse.fr/comparatif* — Umami Analytics</p>
        </div>

        {notReady && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-300">
            <strong>Analytics non connecté.</strong> Ajoutez <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">UMAMI_API_KEY</code> et <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">NEXT_PUBLIC_UMAMI_WEBSITE_ID</code> dans Vercel → Settings → Environment Variables, puis redéployez.
          </div>
        )}

        {/* KPIs aujourd'hui */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Aujourd'hui</p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Visiteurs"  value={loading ? "…" : fmt(stats?.visitors ?? 0)}   sub="uniques"   icon={IconUsers} />
            <KpiCard label="Pages vues" value={loading ? "…" : fmt(stats?.pageviews ?? 0)}  sub="au total"  icon={IconEye} />
            <KpiCard label="Sessions"   value={loading ? "…" : fmt(stats?.sessions ?? 0)}   sub="visites"   icon={IconUsers} />
            <KpiCard label="Durée moy." value={loading ? "…" : fmtDuration(stats?.visitDuration ?? 0)} sub="par visite" icon={IconClock} />
          </div>
        </div>

        {/* KPIs ce mois */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Ce mois</p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Visiteurs"   value={loading ? "…" : fmt(stats?.visitorsMonth ?? 0)}  sub="uniques"  icon={IconUsers} />
            <KpiCard label="Pages vues"  value={loading ? "…" : fmt(stats?.pageviewsMonth ?? 0)} sub="au total" icon={IconEye} />
            <KpiCard label="Sessions"    value={loading ? "…" : fmt(stats?.sessionsMonth ?? 0)}  sub="visites"  icon={IconUsers} />
            <KpiCard label="Taux rebond" value={loading ? "…" : (stats?.bounceRate ? `${stats.bounceRate}%` : "—")} sub="ce mois" icon={IconBounceRight} />
          </div>
        </div>

        {/* Top pages + sources */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="font-semibold mb-4">Pages les plus visitées</p>
              {stats.topPages.length === 0
                ? <p className="text-sm text-muted-foreground">Aucune donnée</p>
                : stats.topPages.map(({ page, visitors }) => (
                  <BarRow key={page} label={page} value={visitors} max={stats.topPages[0]?.visitors ?? 1} />
                ))
              }
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="font-semibold mb-4">Sources de trafic</p>
              {stats.topSources.length === 0
                ? <p className="text-sm text-muted-foreground">Aucune donnée</p>
                : stats.topSources.map(({ source, visitors }) => (
                  <BarRow key={source} label={source} value={visitors} max={stats.topSources[0]?.visitors ?? 1} />
                ))
              }
            </div>
          </div>
        )}

        {/* ── Clics affiliés ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Clics affiliés — Ouvertures de compte · 30 derniers jours
          </p>

          {clicksLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : clicks?.tableError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-300">
              <strong>Erreur de lecture de la table affiliate_clicks.</strong><br />
              <span className="text-xs opacity-70 mt-1 block">{clicks.tableError}</span>
            </div>
          ) : !hasAffiliateClicks ? (
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Aucun clic affilié enregistré sur les 30 derniers jours.
            </div>
          ) : (
            <ClickCards section={clicks!.affiliate} accentColor="bg-primary" />
          )}
        </div>

        {/* ── Clics démo ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Clics démo — Comptes démo · 30 derniers jours
          </p>

          {clicksLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : !hasDemoClicks ? (
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Aucun clic démo enregistré sur les 30 derniers jours. Les clics sur &quot;Compte démo&quot; et &quot;Démo&quot; apparaîtront ici.
            </div>
          ) : (
            <ClickCards section={clicks!.demo} accentColor="bg-emerald-500" />
          )}
        </div>

      </div>
    </PageContainer>
  );
}
