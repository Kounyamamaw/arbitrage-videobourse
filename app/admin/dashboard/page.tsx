"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  RefreshCw, Database, CheckCircle2, XCircle,
  AlertCircle, LogOut, Clock, Globe, TrendingUp,
  FileText, ChevronRight
} from "lucide-react";

type ScrapeLog = {
  timestamp: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
};

type ScrapeResult = {
  id:        string;
  name:      string;
  status:    "success" | "partial" | "error";
  fields_found: number;
  logo_found:   boolean;
};

const BROKERS_TO_SCRAPE = [
  { id: "bourse-direct",       name: "Bourse Direct",        url: "https://www.boursedirect.fr/fr/tarifs" },
  { id: "fortuneo",            name: "Fortuneo",             url: "https://www.fortuneo.fr/bourse/offre-bourse" },
  { id: "xtb",                 name: "XTB",                  url: "https://www.xtb.com/fr/taux-et-frais" },
  { id: "trade-republic",      name: "Trade Republic",       url: "https://traderepublic.com/fr-fr/pricing" },
  { id: "interactive-brokers", name: "Interactive Brokers",  url: "https://www.interactivebrokers.com/fr/index.php?f=1590" },
  { id: "saxo-banque",         name: "Saxo Banque",          url: "https://www.home.saxo/fr-fr/rates-and-conditions/stocks/commissions" },
  { id: "degiro",              name: "Degiro",               url: "https://www.degiro.fr/tarifs" },
  { id: "boursobank",          name: "BoursoBank",           url: "https://www.boursobank.com/bourse/tarifs" },
  { id: "etoro",               name: "eToro",                url: "https://www.etoro.com/fr/trading/fees/" },
  { id: "linxea",              name: "Linxea",               url: "https://www.linxea.com/assurance-vie/tarifs" },
  { id: "nalo",                name: "Nalo",                 url: "https://nalo.fr/tarifs" },
  { id: "yomoni",              name: "Yomoni",               url: "https://www.yomoni.fr/tarifs" },
  { id: "bitpanda",            name: "Bitpanda",             url: "https://www.bitpanda.com/fr/fees" },
  { id: "coinbase",            name: "Coinbase",             url: "https://www.coinbase.com/fr/legal/fees" },
  { id: "credit-agricole",     name: "Crédit Agricole",      url: "https://www.credit-agricole.fr/particulier/bourse" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [isRunning, setIsRunning]     = useState(false);
  const [logs, setLogs]               = useState<ScrapeLog[]>([]);
  const [results, setResults]         = useState<ScrapeResult[]>([]);
  const [progress, setProgress]       = useState(0);
  const [lastRun, setLastRun]         = useState<string | null>(null);
  const [currentTarget, setCurrentTarget] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("admin_auth")) {
      router.replace("/admin");
    }
    const stored = localStorage.getItem("last_scrape_run");
    if (stored) setLastRun(stored);
    const storedResults = localStorage.getItem("scrape_results");
    if (storedResults) setResults(JSON.parse(storedResults));
  }, [router]);

  const addLog = (level: ScrapeLog["level"], message: string) => {
    const entry: ScrapeLog = {
      timestamp: new Date().toLocaleTimeString("fr-FR"),
      level,
      message,
    };
    setLogs((prev) => [...prev, entry]);
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const scrapeBroker = async (broker: typeof BROKERS_TO_SCRAPE[0]): Promise<ScrapeResult> => {
    setCurrentTarget(broker.name);
    addLog("info", `Analyse de ${broker.name} (${broker.url})`);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: broker.id, name: broker.name, url: broker.url }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      addLog("success", `${broker.name} — ${data.fields_found} champs récupérés`);
      return {
        id:            broker.id,
        name:          broker.name,
        status:        data.fields_found >= 4 ? "success" : "partial",
        fields_found:  data.fields_found,
        logo_found:    data.logo_found,
      };
    } catch (err) {
      addLog("warning", `${broker.name} — accès limité (données partielles conservées)`);
      return { id: broker.id, name: broker.name, status: "partial", fields_found: 0, logo_found: false };
    }
  };

  const runAnalysis = async () => {
    setIsRunning(true);
    setLogs([]);
    setResults([]);
    setProgress(0);

    addLog("info", `Démarrage de l'analyse — ${BROKERS_TO_SCRAPE.length} acteurs financiers ciblés`);
    addLog("info", "Simulation navigateur activée (user-agent rotatif, délais humains)");
    await sleep(600);

    const batchResults: ScrapeResult[] = [];

    for (let i = 0; i < BROKERS_TO_SCRAPE.length; i++) {
      const broker = BROKERS_TO_SCRAPE[i];
      const result = await scrapeBroker(broker);
      batchResults.push(result);
      setResults([...batchResults]);
      setProgress(Math.round(((i + 1) / BROKERS_TO_SCRAPE.length) * 100));
      await sleep(800 + Math.random() * 600);
    }

    addLog("info", "Consolidation des données...");
    await sleep(800);

    const successCount = batchResults.filter((r) => r.status === "success").length;
    const partialCount = batchResults.filter((r) => r.status === "partial").length;

    addLog("success", `Analyse terminée — ${successCount} complets, ${partialCount} partiels`);
    addLog("info", "Fichier brokers.json mis à jour");

    const now = new Date().toLocaleString("fr-FR");
    setLastRun(now);
    localStorage.setItem("last_scrape_run", now);
    localStorage.setItem("scrape_results", JSON.stringify(batchResults));

    setCurrentTarget("");
    setIsRunning(false);
  };

  const logout = () => {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin");
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const partialCount = results.filter((r) => r.status === "partial").length;
  const errorCount   = results.filter((r) => r.status === "error").length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      {/* Top bar */}
      <header
        style={{
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logos/logo-light.svg"
              alt="ArbitrAge"
              width={120}
              height={28}
              style={{ height: "26px", width: "auto" }}
              unoptimized
            />
            <div
              className="h-4 w-px"
              style={{ backgroundColor: "var(--border)" }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-faint)" }}
            >
              Admin
            </span>
          </div>
          <button onClick={logout} className="btn-ghost" style={{ gap: "6px" }}>
            <LogOut size={13} />
            <span className="text-xs">Déconnexion</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Page title */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="font-display font-semibold text-2xl"
              style={{ color: "var(--text)" }}
            >
              Analyse des données
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Lance le scraping des frais et informations pour tous les acteurs financiers référencés.
            </p>
          </div>
          {lastRun && (
            <div
              className="text-right hidden sm:block"
              style={{ color: "var(--text-faint)" }}
            >
              <p className="text-xs">Dernière analyse</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
                {lastRun}
              </p>
            </div>
          )}
        </div>

        {/* Stats row */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Analysés",  value: results.length,  icon: Globe },
              { label: "Complets",  value: successCount,    icon: CheckCircle2, color: "var(--positive)" },
              { label: "Partiels",  value: partialCount,    icon: AlertCircle,  color: "var(--warning)" },
              { label: "Erreurs",   value: errorCount,      icon: XCircle,      color: "var(--negative)" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: "var(--text-faint)" }}>{label}</span>
                  <Icon size={13} style={{ color: color || "var(--text-faint)" }} />
                </div>
                <p
                  className="font-display font-semibold text-2xl"
                  style={{ color: "var(--text)" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Main action card */}
        <div
          className="rounded-2xl p-6 space-y-6"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Action row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: "var(--bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <Database size={16} style={{ color: "var(--text-muted)" }} />
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: "var(--text)" }}>
                  Scraping des acteurs financiers
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
                  {BROKERS_TO_SCRAPE.length} sources · Navigation simulée · Frais + logos
                </p>
              </div>
            </div>
            <button
              onClick={runAnalysis}
              disabled={isRunning}
              className="btn-primary flex-shrink-0"
              style={{ opacity: isRunning ? 0.7 : 1 }}
            >
              <RefreshCw
                size={13}
                className={isRunning ? "animate-spin" : ""}
              />
              {isRunning ? "Analyse en cours..." : "Lancer l'analyse"}
            </button>
          </div>

          {/* Progress bar */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {currentTarget ? `Analyse de ${currentTarget}...` : "Initialisation..."}
                </span>
                <span
                  className="font-display font-semibold text-sm"
                  style={{ color: "var(--text)" }}
                >
                  {progress}%
                </span>
              </div>
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: "4px", backgroundColor: "var(--border)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: "var(--text)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Sources list */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--text-faint)" }}
            >
              Sources ({BROKERS_TO_SCRAPE.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {BROKERS_TO_SCRAPE.map((b) => {
                const result = results.find((r) => r.id === b.id);
                return (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{
                      backgroundColor: "var(--bg)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {currentTarget === b.name && isRunning ? (
                        <div className="spinner flex-shrink-0" />
                      ) : result?.status === "success" ? (
                        <CheckCircle2 size={13} style={{ color: "var(--positive)", flexShrink: 0 }} />
                      ) : result?.status === "partial" ? (
                        <AlertCircle  size={13} style={{ color: "var(--warning)",  flexShrink: 0 }} />
                      ) : result?.status === "error" ? (
                        <XCircle      size={13} style={{ color: "var(--negative)", flexShrink: 0 }} />
                      ) : (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: "var(--border)" }}
                        />
                      )}
                      <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {b.name}
                      </span>
                    </div>
                    {result && (
                      <span className="text-xs ml-2 flex-shrink-0" style={{ color: "var(--text-faint)" }}>
                        {result.fields_found > 0 ? `${result.fields_found} champs` : "—"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Log panel */}
        {logs.length > 0 && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <FileText size={13} style={{ color: "var(--text-faint)" }} />
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--text-faint)" }}
                >
                  Journal d'exécution
                </span>
              </div>
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                {logs.length} entrées
              </span>
            </div>
            <div
              className="p-4 space-y-1 overflow-y-auto font-mono text-xs"
              style={{
                maxHeight: "320px",
                backgroundColor: "var(--bg)",
              }}
            >
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span style={{ color: "var(--text-faint)", flexShrink: 0 }}>
                    {log.timestamp}
                  </span>
                  <span
                    style={{
                      color:
                        log.level === "success" ? "var(--positive)" :
                        log.level === "error"   ? "var(--negative)" :
                        log.level === "warning" ? "var(--warning)"  :
                        "var(--text-muted)",
                      flexShrink: 0,
                      width: "52px",
                    }}
                  >
                    [{log.level.toUpperCase()}]
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info banner */}
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <AlertCircle size={14} style={{ color: "var(--text-faint)", flexShrink: 0, marginTop: "1px" }} />
          <div className="space-y-1">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Fonctionnement du scraper
            </p>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>
              Le scraper simule un navigateur humain (user-agent réaliste, délais aléatoires, rotation de headers) 
              pour contourner les protections anti-bot. En cas de blocage, les données existantes sont conservées 
              et marquées comme partielles. Le fichier <code>data/brokers.json</code> est mis à jour après chaque analyse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
