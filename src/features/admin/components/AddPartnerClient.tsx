"use client";

import { useState, useEffect, useRef } from "react";
import { IconPlus, IconTrash, IconExternalLink, IconSparkles, IconLoader, IconCheck, IconX, IconStar, IconPencil, IconUpload, IconPhoto } from "@tabler/icons-react";

type Partner = {
  id: string; name: string; slug: string; category: string;
  website: string; affiliate_url: string; tagline: string;
  is_partner?: boolean; demo_url?: string; logo_url?: string;
};

const EMPTY_FORM = {
  name: "", slug: "", category: "broker", website: "",
  affiliate_url: "", tagline: "", demo_url: "", is_partner: false, logo_url: "",
};

export function AddPartnerClient() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  const [analyzing, setAnalyzing] = useState(false);
  const [enrichResult, setEnrichResult] = useState<any>(null);
  const [enrichSaved, setEnrichSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/partners")
      .then(r => r.json())
      .then(data => { setPartners(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);

    // If a file was uploaded, convert to base64 data URL as logo_url
    let finalLogoUrl = form.logo_url;
    if (logoFile) {
      finalLogoUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(logoFile);
      });
    }

    try {
      if (editingSlug) {
        // Update existing
        const res = await fetch(`/api/brokers/${editingSlug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name, category: form.category, website: form.website,
            affiliate_url: form.affiliate_url, tagline: form.tagline,
            demo_url: form.demo_url, is_partner: form.is_partner,
            partner_rank: form.is_partner ? 10 : 999,
            logo_url: finalLogoUrl || undefined,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setPartners(prev => prev.map(p => p.slug === editingSlug ? { ...p, ...updated } : p));
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, logo_url: finalLogoUrl }),
        });
        if (res.ok) {
          const newPartner = await res.json();
          setPartners(prev => [...prev, newPartner]);

        // If we have enrichment data, save it too
        if (enrichResult && !enrichResult.error) {
          await fetch("/api/admin/scraping/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ broker_slug: form.slug, extracted: enrichResult }),
          });
          setEnrichSaved(true);
        }

        setForm(EMPTY_FORM);
        setPastedText("");
        setEnrichResult(null);
        setEditingSlug(null);
        setLogoFile(null);
        setLogoPreview("");
        setShowModal(false);
        }
      }

      // If enrichment data, save it
      if (enrichResult && !enrichResult.error) {
        await fetch("/api/admin/scraping/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ broker_slug: form.slug, extracted: enrichResult }),
        });
      }

    } catch { /* */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce partenaire ?")) return;
    await fetch(`/api/admin/partners?id=${id}`, { method: "DELETE" });
    setPartners(prev => prev.filter(p => p.id !== id));
  };

  const handleAnalyze = async () => {
    if (!form.slug || pastedText.trim().length < 50) return;
    setAnalyzing(true);
    setEnrichResult(null);
    try {
      const res = await fetch("/api/admin/scraping/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ broker_slug: form.slug, text: pastedText }),
      });
      const data = await res.json();
      setEnrichResult(data);
    } catch (e) {
      setEnrichResult({ error: String(e) });
    }
    setAnalyzing(false);
  };

  const openModal = () => {
    setForm(EMPTY_FORM);
    setPastedText("");
    setEnrichResult(null);
    setEnrichSaved(false);
    setEditingSlug(null);
    setLogoFile(null);
    setLogoPreview("");
    setShowModal(true);
  };

  if (loading) return <div className="flex h-32 items-center justify-center text-muted-foreground">Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Partner list */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="font-semibold">Intermédiaires référencés</h3>
            <p className="text-sm text-muted-foreground">{partners.length} intermédiaires référencés</p>
          </div>
          <button onClick={openModal}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <IconPlus className="size-4" /> Ajouter
          </button>
        </div>
        <div className="divide-y divide-border">
          {partners.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-6 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{p.name}</p>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{p.category}</span>
                  {p.is_partner && (
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">Partenaire</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{p.tagline || p.website || "—"}</p>
              </div>
              <a href={`/dashboard/courtiers/${p.slug}`} className="text-xs text-primary hover:underline">Fiche</a>
              <button onClick={() => {
                setForm({
                  name: p.name, slug: p.slug, category: p.category,
                  website: p.website || "", affiliate_url: p.affiliate_url || "",
                  tagline: p.tagline || "", demo_url: (p as any).demo_url || "",
                  is_partner: !!(p as any).is_partner,
                  logo_url: (p as any).logo_url || "",
                });
                setEditingSlug(p.slug);
                setLogoFile(null);
                setLogoPreview("");
                setPastedText(""); setEnrichResult(null); setEnrichSaved(false);
                setShowModal(true);
              }} className="text-muted-foreground hover:text-primary" title="Modifier">
                <IconPencil className="size-4" />
              </button>
              <a href={p.affiliate_url || p.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <IconExternalLink className="size-4" />
              </a>
              <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-red-500">
                <IconTrash className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
         MODAL — Ajouter un partenaire + enrichir avec Groq
         ══════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[8vh] px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-lg font-bold">{editingSlug ? "Modifier l\'intermédiaire" : "Nouvel intermédiaire"}</h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-muted">
                <IconX className="size-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Basic fields */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Nom *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/,'') }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Trade Republic" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Slug (URL) *</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="trade-republic" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Catégorie</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none">
                    <option value="broker">Courtier</option>
                    <option value="bank">Banque</option>
                    <option value="insurance">Assurance-vie</option>
                    <option value="crypto">Crypto</option>
                    <option value="cfd">CFD</option>
                    <option value="scpi">SCPI</option>
                <option value="neobanque">Néobanque</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Site web</label>
                  <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://traderepublic.com" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Lien d&apos;affiliation</label>
                  <input value={form.affiliate_url} onChange={e => setForm(f => ({ ...f, affiliate_url: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">URL compte démo</label>
                  <input value={form.demo_url} onChange={e => setForm(f => ({ ...f, demo_url: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://demo.example.com" />
                </div>
              </div>

              {/* Logo upload */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Logo (optionnel)</label>
                <div className="flex items-center gap-3">
                  {/* Preview */}
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => logoInputRef.current?.click()}
                    title="Cliquer pour choisir un logo"
                  >
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoPreview} alt="logo preview" className="h-10 w-10 object-contain" />
                    ) : form.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.logo_url} alt="logo" className="h-10 w-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <IconPhoto className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); }}
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <IconUpload className="size-3.5" />
                      {logoFile ? logoFile.name : "Choisir un fichier image"}
                    </button>
                    <p className="text-[10px] text-muted-foreground">ou coller une URL directe :</p>
                    <input
                      value={form.logo_url}
                      onChange={e => { setForm(f => ({ ...f, logo_url: e.target.value })); setLogoPreview(""); setLogoFile(null); }}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Description courte</label>
                <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Courtier spécialisé ETF..." />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_partner} onChange={e => setForm(f => ({ ...f, is_partner: e.target.checked }))}
                  className="size-4 rounded border-border" />
                <div>
                  <span className="text-sm font-medium">Partenaire VideoBourse</span>
                  <p className="text-xs text-muted-foreground">Badge visible + position prioritaire dans le classement</p>
                </div>
              </label>

              {/* ── Groq enrichment zone ── */}
              <div className="border-t border-border pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <IconSparkles className="size-4 text-primary" />
                  <h4 className="text-sm font-semibold">Enrichir les données avec l&apos;IA</h4>
                  <span className="text-xs text-muted-foreground">(optionnel)</span>
                </div>
                <textarea
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  placeholder={"Collez ici le contenu de la page tarifaire de " + (form.name || "ce courtier") + " (Cmd+A → Cmd+C depuis la page tarifaire ou un PDF)"}
                  rows={5}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y font-mono"
                />
                {pastedText.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">{pastedText.length.toLocaleString("fr-FR")} caractères</p>
                )}
                {pastedText.trim().length >= 50 && (
                  <button onClick={handleAnalyze} disabled={analyzing}
                    className="mt-2 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50">
                    {analyzing ? <><IconLoader className="size-3.5 animate-spin" /> Analyse en cours...</> : <><IconSparkles className="size-3.5" /> Analyser avec Groq</>}
                  </button>
                )}
                {enrichResult && !enrichResult.error && (
                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                      <IconCheck className="inline size-3.5 mr-1" />
                      Données extraites (confiance: {enrichResult.confiance}) — seront sauvegardées avec le partenaire
                    </p>
                  </div>
                )}
                {enrichResult?.error && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
                    <p className="text-xs text-red-700 dark:text-red-400">{enrichResult.error}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-border pt-5">
                <button onClick={handleAdd} disabled={saving || !form.name || !form.slug}
                  className="flex-1 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
                  {saving ? "Enregistrement..." : editingSlug ? "Mettre à jour" : enrichResult && !enrichResult.error ? "Créer + enrichir" : "Créer l'intermédiaire"}
                </button>
                <button onClick={() => setShowModal(false)} className="rounded-lg border border-border px-6 py-2.5 text-sm hover:bg-muted">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
