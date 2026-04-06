"use client";

import PageContainer from '@/components/layout/page-container';
import { useState, useEffect } from 'react';
import { IconExternalLink, IconDeviceFloppy, IconCheck, IconLoader, IconSparkles, IconAlertTriangle } from '@tabler/icons-react';

type BrokerInfo = { slug: string; name: string; website: string; pricing_url: string | null };
type ScrapeLog = { id: number; broker_slug: string; status: string; fields_found: number; scraped_at: string };

export default function ScrapingPage() {
  const [brokers, setBrokers] = useState<BrokerInfo[]>([]);
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual extraction state
  const [selectedBroker, setSelectedBroker] = useState<string>("");
  const [pastedText, setPastedText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/scraping/urls").then(r => r.json()),
      fetch("/api/admin/scraping/logs").then(r => r.json()),
    ]).then(([b, l]) => {
      setBrokers(Array.isArray(b) ? b : []);
      setLogs(Array.isArray(l) ? l : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAnalyze = async () => {
    if (!selectedBroker || !pastedText.trim()) return;
    setAnalyzing(true);
    setExtractedData(null);
    try {
      const res = await fetch("/api/admin/scraping/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ broker_slug: selectedBroker, text: pastedText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExtractedData(data);
    } catch (e) {
      setExtractedData({ error: String(e) });
    }
    setAnalyzing(false);
  };

  const handleSave = async () => {
    if (!extractedData || !selectedBroker) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/scraping/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ broker_slug: selectedBroker, extracted: extractedData }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // Refresh logs
        fetch("/api/admin/scraping/logs").then(r => r.json()).then(l => setLogs(Array.isArray(l) ? l : []));
      }
    } catch { /* */ }
    setSaving(false);
  };

  const brokerName = brokers.find(b => b.slug === selectedBroker)?.name || "";

  if (loading) return <PageContainer><div className="flex h-32 items-center justify-center text-muted-foreground">Chargement...</div></PageContainer>;

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Données des partenaires</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enrichissez les données via le script Python automatique ou la saisie assistée par IA ci-dessous.
          </p>
        </div>

        {/* Script Python instructions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-2">Scraping automatique (terminal)</h3>
          <div className="rounded-lg bg-muted p-4 font-mono text-xs leading-relaxed">
            <p className="text-muted-foreground mb-1"># Installation (une seule fois)</p>
            <p>pip3 install --upgrade playwright httpx pdfplumber supabase</p>
            <p>playwright install chromium</p>
            <p className="text-muted-foreground mt-3 mb-1"># Lancer le scraping (Google + PDF + Web + Groq)</p>
            <p>GROQ_KEY=&quot;gsk_...&quot; SUPABASE_KEY=&quot;eyJ...&quot; python3 scripts/scraper/scrape_v3.py</p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Le script cherche sur Google les pages tarifaires et PDFs officiels, extrait le contenu, et utilise Groq pour structurer les données.
            Les courtiers non trouvés automatiquement peuvent être traités ci-dessous.
          </p>
        </div>

        {/* ════════════════════════════════════════════════════════════
           ZONE DE SAISIE MANUELLE + GROQ
           ════════════════════════════════════════════════════════════ */}
        <div className="rounded-xl border-2 border-primary/20 bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconSparkles className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold">Extraction assistée par IA</h3>
              <p className="text-sm text-muted-foreground">Collez le texte d&apos;une page tarifaire — Groq extrait et structure automatiquement</p>
            </div>
          </div>

          {/* Step 1: Select broker */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">1. Sélectionnez un partenaire</label>
            <select
              value={selectedBroker}
              onChange={e => { setSelectedBroker(e.target.value); setExtractedData(null); setSaved(false); }}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">— Choisir un courtier —</option>
              {brokers.map(b => (
                <option key={b.slug} value={b.slug}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Paste text */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              2. Collez le texte (page tarifaire, PDF copié, conditions tarifaires...)
            </label>
            <textarea
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder={"Copiez-collez ici le contenu de la page tarifaire de " + (brokerName || "votre courtier") + "...\n\nExemple : ouvrez la page tarifs du courtier dans un onglet, faites Cmd+A puis Cmd+C, et collez ici."}
              rows={8}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y font-mono"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {pastedText.length > 0 ? `${pastedText.length.toLocaleString("fr-FR")} caractères` : ""}
            </p>
          </div>

          {/* Step 3: Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !selectedBroker || pastedText.trim().length < 50}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90"
          >
            {analyzing ? (
              <><IconLoader className="size-4 animate-spin" /> Analyse en cours...</>
            ) : (
              <><IconSparkles className="size-4" /> Analyser avec Groq</>
            )}
          </button>

          {/* Step 4: Results */}
          {extractedData && !('error' in extractedData) && (() => {
            const cat = extractedData._category || extractedData.categorie_detectee || 'broker';
            // Collect all non-null fields for display
            const fields: { label: string; value: string; filled: boolean }[] = [];
            const addField = (label: string, obj: any) => {
              if (!obj) { fields.push({ label, value: '—', filled: false }); return; }
              if (typeof obj === 'object' && 'montant' in obj) {
                const filled = obj.montant !== null && obj.montant !== undefined;
                const val = filled ? `${obj.montant}${obj.unite === '%' ? '%' : '€'}${obj.details ? ` (${obj.details})` : ''}${obj.conditions ? ` — ${obj.conditions}` : ''}` : '—';
                fields.push({ label, value: val, filled });
              } else if (typeof obj === 'string' || typeof obj === 'number') {
                fields.push({ label, value: String(obj), filled: true });
              } else {
                fields.push({ label, value: '—', filled: false });
              }
            };

            // Add fields based on category
            if (cat === 'crypto') {
              addField('Frais trading spot', extractedData.frais_trading_spot);
              addField('Frais maker', extractedData.frais_maker);
              addField('Frais taker', extractedData.frais_taker);
              addField('Spread moyen', extractedData.spread_moyen);
              addField('Frais dépôt carte', extractedData.frais_depot_carte);
              addField('Frais dépôt virement', extractedData.frais_depot_virement);
              addField('Frais retrait fiat', extractedData.frais_retrait_fiat);
              addField('Frais staking', extractedData.frais_staking);
              addField('Frais inactivité', extractedData.frais_inactivite);
              addField('Dépôt minimum', extractedData.depot_minimum);
              if (extractedData.nb_cryptos_disponibles) fields.push({ label: 'Cryptos disponibles', value: String(extractedData.nb_cryptos_disponibles), filled: true });
            } else if (cat === 'cfd') {
              addField('Spread indices', extractedData.spread_indices);
              addField('Spread forex', extractedData.spread_forex);
              addField('Spread actions', extractedData.spread_actions);
              addField('Frais overnight', extractedData.frais_overnight);
              addField('Frais inactivité', extractedData.frais_inactivite);
              addField('Frais change', extractedData.frais_change);
              addField('Dépôt minimum', extractedData.depot_minimum);
            } else if (cat === 'insurance') {
              addField('Frais gestion UC', extractedData.frais_gestion_uc);
              addField('Frais gestion fonds €', extractedData.frais_gestion_fonds_euro);
              addField("Frais d'entrée", extractedData.frais_entree);
              addField("Frais d'arbitrage", extractedData.frais_arbitrage);
              addField('Frais de sortie', extractedData.frais_sortie);
              addField('Rendement fonds €', extractedData.rendement_fonds_euro);
              addField('Dépôt minimum', extractedData.depot_minimum);
            } else {
              // broker / bank
              addField('Droits de garde', extractedData.droits_garde);
              addField('Frais inactivité', extractedData.frais_inactivite);
              addField('Frais de change', extractedData.frais_change);
              addField('Frais de retrait', extractedData.frais_retrait);
              addField('Dépôt minimum', extractedData.depot_minimum);
            }
            // Common
            if (extractedData.pros?.length > 0) fields.push({ label: 'Avantages', value: extractedData.pros.join(' · '), filled: true });
            if (extractedData.cons?.length > 0) fields.push({ label: 'Inconvénients', value: extractedData.cons.join(' · '), filled: true });

            const filledCount = fields.filter(f => f.filled).length;
            const totalCount = fields.length;
            const completeness = Math.round((filledCount / totalCount) * 100);

            return (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-sm">Données extraites</h4>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    extractedData.confiance === 'haute' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    extractedData.confiance === 'moyenne' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    Confiance : {String(extractedData.confiance || '?')}
                  </span>
                </div>
              </div>

              {/* Completeness bar */}
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Complétude de la fiche</span>
                  <span className={`text-xs font-bold ${completeness >= 70 ? 'text-green-600' : completeness >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                    {completeness}% ({filledCount}/{totalCount} champs)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${completeness >= 70 ? 'bg-green-500' : completeness >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${completeness}%` }} />
                </div>
              </div>

              {/* Broker courtage tiers (if applicable) */}
              {(cat === 'broker' || cat === 'bank') && extractedData.frais_courtage && (
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Frais de courtage</p>
                  {['france', 'europe', 'usa'].map(market => {
                    const tiers = extractedData.frais_courtage?.[market];
                    if (!tiers || !Array.isArray(tiers) || tiers.length === 0) return null;
                    return (
                      <div key={market} className="mb-2">
                        <p className="text-xs font-medium text-foreground mb-1">{market === 'france' ? '🇫🇷 France' : market === 'europe' ? '🇪🇺 Europe' : '🇺🇸 USA'}</p>
                        {tiers.map((tier: any, i: number) => (
                          <p key={i} className="text-xs text-muted-foreground ml-4">
                            {tier.min_eur || 0}€ → {tier.max_eur ? `${tier.max_eur}€` : '∞'} : <strong className="text-foreground">{tier.montant}{tier.unite === '%' ? '%' : '€'}</strong> ({tier.type})
                          </p>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Fields table */}
              <div className="rounded-lg border border-border overflow-hidden">
                {fields.map(({ label, value, filled }) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-2 text-xs border-b border-border last:border-0 ${!filled ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}>
                    <span className={filled ? 'text-muted-foreground' : 'text-red-400'}>{label}</span>
                    <span className={`font-medium ${filled ? 'text-foreground' : 'text-red-400'}`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {extractedData.notes && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 dark:bg-amber-950/20 dark:border-amber-900">
                  <p className="text-xs text-amber-700 dark:text-amber-400">💡 {String(extractedData.notes)}</p>
                </div>
              )}

              {/* JSON toggle */}
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Voir le JSON brut</summary>
                <pre className="mt-2 rounded-lg bg-muted p-3 overflow-x-auto text-[10px] leading-relaxed">
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              </details>

              {/* Save */}
              <button onClick={handleSave} disabled={saving || saved}
                className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium ${saved ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'} disabled:opacity-70`}>
                {saving ? <IconLoader className="size-4 animate-spin" /> : saved ? <IconCheck className="size-4" /> : <IconDeviceFloppy className="size-4" />}
                {saved ? `Sauvegardé ! (${filledCount} champs)` : `Valider et sauvegarder (${filledCount} champs)`}
              </button>
            </div>
            );
          })()}

          {/* Error display */}
          {extractedData && 'error' in extractedData && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
              <IconAlertTriangle className="size-5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-400">{String(extractedData.error)}</p>
            </div>
          )}
        </div>

        {/* Historique des scrapes */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold">Historique des analyses</h3>
          </div>
          {logs.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">Aucune analyse effectuée</div>
          ) : (
            <div className="divide-y divide-border max-h-72 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 px-6 py-2.5 text-sm">
                  <span className={`flex size-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : log.status === 'no_content' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="w-28 shrink-0 font-medium">{log.broker_slug}</span>
                  <span className="text-muted-foreground">{log.fields_found} champs</span>
                  <span className="ml-auto text-xs text-muted-foreground">{new Date(log.scraped_at).toLocaleString("fr-FR")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
