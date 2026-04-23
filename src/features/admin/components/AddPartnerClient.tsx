"use client";

import { useState, useEffect, useRef } from "react";
import { IconPlus, IconTrash, IconExternalLink, IconSparkles, IconLoader, IconCheck, IconX, IconPencil, IconUpload, IconPhoto, IconChevronDown, IconChevronUp } from "@tabler/icons-react";

type Partner = {
  id: string; name: string; slug: string; category: string;
  website: string; affiliate_url: string; tagline: string;
  is_partner?: boolean; demo_url?: string; logo_url?: string;
};

const ALL_CATEGORIES = [
  { value: "broker",    label: "Courtier bourse" },
  { value: "bank",      label: "Banque" },
  { value: "neobanque", label: "Néobanque" },
  { value: "insurance", label: "Assurance-vie" },
  { value: "crypto",    label: "Crypto" },
  { value: "cfd",       label: "CFD" },
  { value: "scpi",      label: "SCPI" },
];

const EMPTY_FORM = {
  name: "", slug: "", categories: ["broker"] as string[], website: "",
  affiliate_url: "", tagline: "", demo_url: "", is_partner: false, is_visible: true, logo_url: "",
  score_overall: "" as string, score_fees: "" as string,
  score_reliability: "" as string, score_ux: "" as string,
  score_envergure: "" as string, score_support: "" as string,
  founded: "" as string, deposit_minimum: "" as string,
  trustpilot_score: "" as string, trustpilot_count: "" as string,
  custody_fee: "" as string, custody_fee_unit: "€" as string, inactivity_fee: "" as string, currency_fee: "" as string,
  welcome_offer: "", pros: "", cons: "", best_for: "",
  accounts: "", regulation: "",
  // Critères vue tableau (fees JSON)
  fees_fr_amount: "" as string,
  fees_us_amount: "" as string,
  fees_eu_amount: "" as string,
  fees_fr_type: "percent" as string,
  fees_us_type: "flat" as string,
  fees_eu_type: "percent" as string,
  fees_spread_forex: "" as string,
  fees_spread_indices: "" as string,
  fees_overnight: "" as string,
  fees_standard_abo: "" as string,
  fees_retrait_especes: "" as string,
  fees_maker: "" as string,
  fees_taker: "" as string,
  fees_retrait_fiat: "" as string,
  fees_depot_carte: "" as string,
  fees_carte_banque: "" as string,
  fees_entree: "" as string,
  fees_arbitrage: "" as string,
  fees_sortie_anticipee: "" as string,
  fees_gestion_uc: "" as string,
  fees_virement: "" as string,
  protection_solde_negatif: false,
};
type FormState = typeof EMPTY_FORM;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
const ic = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function AddPartnerClient() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFees, setCurrentFees] = useState<Record<string, unknown>>({});
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [showDataFields, setShowDataFields] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [enrichResult, setEnrichResult] = useState<any>(null);

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetch("/api/admin/partners")
      .then(r => r.json())
      .then(data => { setPartners(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (key: keyof FormState, value: any) => setForm(f => ({ ...f, [key]: value }));

  const toggleCategory = (cat: string) => {
    setForm(f => {
      const cur = f.categories;
      if (cur.includes(cat)) return cur.length === 1 ? f : { ...f, categories: cur.filter(c => c !== cat) };
      return { ...f, categories: [...cur, cat] };
    });
  };

  const parseNum = (v: string): number | undefined => {
    if (v === "") return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  };
  const parseArr = (v: string): string[] => v.split(/[\n,]/).map(s => s.trim()).filter(Boolean);

  const handleAdd = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);

    const primaryCategory = form.categories[0] || "broker";

    // Payload sans logo — le logo est uploadé séparément via /api/admin/upload-logo
    // pour éviter d'envoyer des données base64 volumineuses à PostgREST
    const logoForPayload = (!form.logo_url || form.logo_url.startsWith("data:"))
      ? undefined
      : form.logo_url;

    const payload: Record<string, any> = {
      name: form.name, category: primaryCategory, categories: form.categories,
      website: form.website, affiliate_url: form.affiliate_url, tagline: form.tagline,
      demo_url: form.demo_url || null, is_partner: form.is_partner,
      partner_rank: form.is_partner ? 10 : 999,
      is_visible: form.is_visible !== false,
      ...(logoForPayload !== undefined ? { logo_url: logoForPayload } : {}),
    };

    const scoreKeys = ["score_overall","score_fees","score_reliability","score_ux","score_envergure","score_support"] as const;
    for (const k of scoreKeys) {
      const n = parseNum(form[k]);
      if (n !== undefined) payload[k] = Math.min(10, Math.max(0, n));
    }
    const numKeys = [
      ["founded","founded"], ["deposit_minimum","deposit_minimum"],
      ["trustpilot_score","trustpilot_score"], ["trustpilot_count","trustpilot_count"],
      ["custody_fee","custody_fee"], ["inactivity_fee","inactivity_fee"], ["currency_fee","currency_fee"],
    ] as const;
    for (const [fk, pk] of numKeys) {
      const n = parseNum(form[fk]);
      if (n !== undefined) payload[pk] = n;
    }
    payload.custody_fee_details = form.custody_fee_unit || "€";
    if (form.welcome_offer) payload.welcome_offer = form.welcome_offer;
    if (form.pros)     payload.pros     = parseArr(form.pros);
    if (form.cons)     payload.cons     = parseArr(form.cons);
    if (form.best_for) payload.best_for = parseArr(form.best_for);
    if (form.accounts)   payload.accounts   = parseArr(form.accounts);
    if (form.regulation) payload.regulation = parseArr(form.regulation);

    // ── Construire le fees JSON à partir des champs du formulaire ──
    const pn = (v: string) => { const n = parseFloat(v); return isNaN(n) ? undefined : n; };
    const feesUpdate: Record<string, unknown> = { ...currentFees };
    // FR/US/EU paliers
    if (pn(form.fees_fr_amount) !== undefined) feesUpdate.FR = [{ min: 0, max: null, type: form.fees_fr_type || "percent", amount: pn(form.fees_fr_amount), label: "" }];
    if (pn(form.fees_us_amount) !== undefined) feesUpdate.US = [{ min: 0, max: null, type: form.fees_us_type || "flat",    amount: pn(form.fees_us_amount), label: "" }];
    if (pn(form.fees_eu_amount) !== undefined) feesUpdate.EU = [{ min: 0, max: null, type: form.fees_eu_type || "percent", amount: pn(form.fees_eu_amount), label: "" }];
    // Clés metadata
    if (pn(form.fees_spread_forex)    !== undefined) feesUpdate.spread_forex    = { montant: pn(form.fees_spread_forex),    details: "EUR/USD" };
    if (pn(form.fees_spread_indices)  !== undefined) feesUpdate.spread_indices  = { montant: pn(form.fees_spread_indices),  details: "CAC40/DAX" };
    if (pn(form.fees_overnight)       !== undefined) feesUpdate.overnight       = { montant: pn(form.fees_overnight),       details: "%/nuit" };
    if (pn(form.fees_standard_abo)    !== undefined) feesUpdate.standard        = { montant: pn(form.fees_standard_abo),    details: "€/mois" };
    if (pn(form.fees_retrait_especes) !== undefined) feesUpdate.retrait_especes_standard = { montant: pn(form.fees_retrait_especes), details: "€/mois gratuit" };
    if (pn(form.fees_maker)           !== undefined) feesUpdate.maker           = { montant: pn(form.fees_maker),           details: "%" };
    if (pn(form.fees_taker)           !== undefined) feesUpdate.taker           = { montant: pn(form.fees_taker),           details: "%" };
    if (pn(form.fees_retrait_fiat)    !== undefined) feesUpdate.retrait_fiat    = { montant: pn(form.fees_retrait_fiat),    details: "€" };
    if (pn(form.fees_depot_carte)     !== undefined) feesUpdate.depot_carte     = { montant: pn(form.fees_depot_carte),     details: "%" };
    if (pn(form.fees_carte_banque)    !== undefined) feesUpdate.carte           = { montant: pn(form.fees_carte_banque),    details: "€/an" };
    if (pn(form.fees_entree)          !== undefined) feesUpdate.entree          = { montant: pn(form.fees_entree),          details: "%" };
    if (pn(form.fees_arbitrage)       !== undefined) feesUpdate.arbitrage       = { montant: pn(form.fees_arbitrage),       details: "€" };
    if (pn(form.fees_sortie_anticipee)!== undefined) feesUpdate.sortie_anticipee= { montant: pn(form.fees_sortie_anticipee),details: "%" };
    if (pn(form.fees_gestion_uc)      !== undefined) feesUpdate.gestion_uc     = { montant: pn(form.fees_gestion_uc),      details: "%/an" };
    if (pn(form.fees_virement)         !== undefined) feesUpdate.virement       = { montant: pn(form.fees_virement),        details: "€/virement" };
    feesUpdate.protection_solde_negatif = form.protection_solde_negatif;
    payload.fees = feesUpdate;

    try {
      const targetSlug = editingSlug || form.slug;

      if (editingSlug) {
        const res = await fetch(`/api/brokers/${editingSlug}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setPartners(prev => prev.map(p => p.slug === editingSlug ? { ...p, ...updated } : p));
        } else {
          const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          alert(`Erreur mise à jour : ${errData.error || res.status}`);
          setSaving(false);
          return;
        }
      } else {
        const res = await fetch("/api/admin/partners", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, slug: form.slug }),
        });
        if (res.ok) {
          const np = await res.json();
          setPartners(prev => [...prev, np]);
          if (enrichResult && !enrichResult.error) {
            await fetch("/api/admin/scraping/save", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ broker_slug: form.slug, extracted: enrichResult }),
            });
          }
        } else {
          const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          alert(`Erreur création : ${errData.error || res.status}`);
          setSaving(false);
          return;
        }
      }

      // Upload du logo via Supabase Storage si un fichier a été sélectionné
      if (logoFile && targetSlug) {
        const fd = new FormData();
        fd.append("file", logoFile);
        fd.append("slug", targetSlug);
        const logoRes = await fetch("/api/admin/upload-logo", { method: "POST", body: fd });
        if (logoRes.ok) {
          const { logo_url } = await logoRes.json();
          setPartners(prev => prev.map(p => p.slug === targetSlug ? { ...p, logo_url } : p));
        }
        // Ne pas bloquer si le logo échoue (bucket peut ne pas être configuré)
      }

      if (editingSlug && enrichResult && !enrichResult.error) {
        await fetch("/api/admin/scraping/save", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ broker_slug: form.slug, extracted: enrichResult }),
        });
      }
      closeModal();
    } catch (err: unknown) {
      alert(`Erreur réseau : ${err instanceof Error ? err.message : String(err)}`);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce partenaire ?")) return;
    await fetch(`/api/admin/partners?id=${id}`, { method: "DELETE" });
    setPartners(prev => prev.filter(p => p.id !== id));
  };

  const handleAnalyze = async () => {
    if (!form.slug || pastedText.trim().length < 50) return;
    setAnalyzing(true); setEnrichResult(null);
    try {
      const res = await fetch("/api/admin/scraping/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ broker_slug: form.slug, text: pastedText }),
      });
      setEnrichResult(await res.json());
    } catch (e) { setEnrichResult({ error: String(e) }); }
    setAnalyzing(false);
  };

  const closeModal = () => {
    setShowModal(false); setForm(EMPTY_FORM); setPastedText("");
    setEnrichResult(null); setEditingSlug(null);
    setLogoFile(null); setLogoPreview(""); setShowDataFields(false);
  };

  const openEdit = async (p: any) => {
    // Fetch full broker data to get scores and all fields
    let full = p;
    try {
      const res = await fetch(`/api/brokers/${p.slug}`);
      if (res.ok) full = await res.json();
    } catch { /* use partial data */ }
    setForm({
      name: full.name, slug: full.slug,
      categories: full.categories?.length ? full.categories : [full.category || "broker"],
      website: full.website || "", affiliate_url: full.affiliate_url || "",
      tagline: full.tagline || "", demo_url: full.demo_url || "",
      is_partner: !!full.is_partner, is_visible: full.is_visible !== false, logo_url: full.logo_url || "",
      score_overall:     full.score_overall     != null ? String(full.score_overall)     : "",
      score_fees:        full.score_fees        != null ? String(full.score_fees)        : "",
      score_reliability: full.score_reliability != null ? String(full.score_reliability) : "",
      score_ux:          full.score_ux          != null ? String(full.score_ux)          : "",
      score_envergure:   full.score_envergure   != null ? String(full.score_envergure)   : "",
      score_support:     full.score_support     != null ? String(full.score_support)     : "",
      founded:           full.founded           != null ? String(full.founded)           : "",
      deposit_minimum:   full.deposit_minimum   != null ? String(full.deposit_minimum)   : "",
      trustpilot_score:  full.trustpilot_score  != null ? String(full.trustpilot_score)  : "",
      trustpilot_count:  full.trustpilot_count  != null ? String(full.trustpilot_count)  : "",
      custody_fee:       full.custody_fee       != null ? String(full.custody_fee)       : "",
      custody_fee_unit:  full.custody_fee_details === "%" ? "%" : "€",
      inactivity_fee:    full.inactivity_fee    != null ? String(full.inactivity_fee)    : "",
      currency_fee:      full.currency_fee      != null ? String(full.currency_fee)      : "",
      welcome_offer:     full.welcome_offer     || "",
      pros:    Array.isArray(full.pros)     ? full.pros.join("\n")     : (full.pros     || ""),
      cons:    Array.isArray(full.cons)     ? full.cons.join("\n")     : (full.cons     || ""),
      best_for:Array.isArray(full.best_for) ? full.best_for.join("\n") : (full.best_for || ""),
      accounts:   Array.isArray(full.accounts)   ? full.accounts.join(", ")   : (full.accounts   || ""),
      regulation: Array.isArray(full.regulation) ? full.regulation.join(", ") : (full.regulation || ""),
      // Critères tableau — lire depuis fees JSON
      fees_fr_amount:       full.fees?.FR?.[0]?.amount != null ? String(full.fees.FR[0].amount) : "",
      fees_us_amount:       full.fees?.US?.[0]?.amount != null ? String(full.fees.US[0].amount) : "",
      fees_eu_amount:       full.fees?.EU?.[0]?.amount != null ? String(full.fees.EU[0].amount) : "",
      fees_fr_type:         full.fees?.FR?.[0]?.type   || "percent",
      fees_us_type:         full.fees?.US?.[0]?.type   || "flat",
      fees_eu_type:         full.fees?.EU?.[0]?.type   || "percent",
      fees_spread_forex:    full.fees?.spread_forex?.montant     != null ? String(full.fees.spread_forex.montant)     : "",
      fees_spread_indices:  full.fees?.spread_indices?.montant   != null ? String(full.fees.spread_indices.montant)   : "",
      fees_overnight:       full.fees?.overnight?.montant        != null ? String(full.fees.overnight.montant)        : "",
      fees_standard_abo:    full.fees?.standard?.montant         != null ? String(full.fees.standard.montant)         : "",
      fees_retrait_especes: full.fees?.retrait_especes_standard?.montant != null ? String(full.fees.retrait_especes_standard.montant) : "",
      fees_maker:           full.fees?.maker?.montant            != null ? String(full.fees.maker.montant)            : "",
      fees_taker:           full.fees?.taker?.montant            != null ? String(full.fees.taker.montant)            : "",
      fees_retrait_fiat:    full.fees?.retrait_fiat?.montant     != null ? String(full.fees.retrait_fiat.montant)     : "",
      fees_depot_carte:     full.fees?.depot_carte?.montant      != null ? String(full.fees.depot_carte.montant)      : "",
      fees_carte_banque:    full.fees?.carte?.montant            != null ? String(full.fees.carte.montant)            : "",
      fees_entree:          full.fees?.entree?.montant           != null ? String(full.fees.entree.montant)           : "",
      fees_arbitrage:       full.fees?.arbitrage?.montant        != null ? String(full.fees.arbitrage.montant)        : "",
      fees_sortie_anticipee:full.fees?.sortie_anticipee?.montant != null ? String(full.fees.sortie_anticipee.montant) : "",
      fees_gestion_uc:      full.fees?.gestion_uc?.montant       != null ? String(full.fees.gestion_uc.montant)       : "",
      fees_virement:        full.fees?.virement?.montant         != null ? String(full.fees.virement.montant)         : "",
      protection_solde_negatif: !!(full.fees?.protection_solde_negatif),
    });
    setCurrentFees((full.fees as Record<string, unknown>) || {});
    setEditingSlug(full.slug); setLogoFile(null); setLogoPreview("");
    setPastedText(""); setEnrichResult(null); setShowDataFields(false); setShowModal(true);
  };

  if (loading) return <div className="flex h-32 items-center justify-center text-muted-foreground">Chargement...</div>;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* List */}
      <div className="rounded-xl border border-border bg-card max-w-full overflow-x-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4 gap-2 flex-wrap">
          <div>
            <h3 className="font-semibold">Intermédiaires référencés</h3>
            <p className="text-sm text-muted-foreground">{partners.length} intermédiaires</p>
          </div>
          <button onClick={() => { setForm(EMPTY_FORM); setEditingSlug(null); setLogoFile(null); setLogoPreview(""); setPastedText(""); setEnrichResult(null); setShowDataFields(false); setShowModal(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <IconPlus className="size-4" /> Ajouter
          </button>
        </div>
        <div className="divide-y divide-border">
          {partners.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-6 min-w-0 w-full overflow-hidden">
              {/* Ligne 1 mobile: logo + nom + badges */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                  {p.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo_url} alt={p.name} className="size-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }} />
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground">{p.name.slice(0,2).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground shrink-0">{p.category}</span>
                    {p.is_partner && <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shrink-0">Partenaire</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{p.tagline || p.website || "—"}</p>
                </div>
              </div>
              {/* Ligne 2 mobile: actions (sm: aligne à droite dans la même ligne) */}
              <div className="flex items-center gap-1 sm:ml-auto">
                <a href={`/comparatif/dashboard/courtiers/${p.slug}`} className="text-xs text-primary hover:underline px-1">Fiche</a>
                <button onClick={() => openEdit(p)} className="flex size-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-primary"><IconPencil className="size-3.5" /></button>
                <a href={p.affiliate_url || p.website} target="_blank" rel="noopener noreferrer" className="flex size-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><IconExternalLink className="size-3.5" /></a>
                <button onClick={() => handleDelete(p.id)} className="flex size-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500"><IconTrash className="size-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[4vh] px-4" onClick={closeModal}>
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-6 py-4 sticky top-0 bg-card z-10">
              <h3 className="text-lg font-bold">{editingSlug ? "Modifier l'intermédiaire" : "Nouvel intermédiaire"}</h3>
              <button onClick={closeModal} className="rounded-lg p-1 hover:bg-muted"><IconX className="size-5" /></button>
            </div>

            <div className="space-y-5 p-6">
              {/* Identité */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Nom *">
                  <input value={form.name}
                    onChange={e => { set("name", e.target.value); if (!editingSlug) set("slug", e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/-+$/,"")); }}
                    className={ic} placeholder="Trade Republic" />
                </Field>
                <Field label="Slug (URL) *">
                  <input value={form.slug} onChange={e => set("slug", e.target.value)}
                    disabled={!!editingSlug}
                    className={ic + (editingSlug ? " opacity-50 cursor-not-allowed" : "")} placeholder="trade-republic" />
                </Field>
                <Field label="Site web">
                  <input value={form.website} onChange={e => set("website", e.target.value)} className={ic} placeholder="https://traderepublic.com" />
                </Field>
                <Field label="Lien d'affiliation">
                  <input value={form.affiliate_url} onChange={e => set("affiliate_url", e.target.value)} className={ic} placeholder="https://..." />
                </Field>
                <Field label="URL compte démo">
                  <input value={form.demo_url} onChange={e => set("demo_url", e.target.value)} className={ic} placeholder="https://demo.example.com" />
                </Field>
              </div>

              {/* Catégories multi-select */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Catégories (une ou plusieurs)</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map(({ value, label }) => {
                    const checked = form.categories.includes(value);
                    return (
                      <button key={value} type="button" onClick={() => toggleCategory(value)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${checked ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}>
                        <div className={`size-3.5 rounded-sm border flex items-center justify-center shrink-0 ${checked ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                          {checked && <IconCheck className="size-2.5 text-white" />}
                        </div>
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">Catégorie principale : <strong>{ALL_CATEGORIES.find(c => c.value === form.categories[0])?.label || "—"}</strong></p>
              </div>

              {/* Logo */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Logo (optionnel)</label>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted overflow-hidden cursor-pointer hover:border-primary transition-colors" onClick={() => logoInputRef.current?.click()}>
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoPreview} alt="preview" className="h-10 w-10 object-contain" />
                    ) : form.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.logo_url} alt="logo" className="h-10 w-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }} />
                    ) : (
                      <IconPhoto className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); }} />
                    <button type="button" onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      <IconUpload className="size-3.5" />
                      {logoFile ? logoFile.name : "Choisir un fichier image"}
                    </button>
                    <p className="text-[10px] text-muted-foreground">ou URL directe :</p>
                    <input value={form.logo_url} onChange={e => { set("logo_url", e.target.value); setLogoPreview(""); setLogoFile(null); }}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="https://example.com/logo.png" />
                  </div>
                </div>
              </div>

              <Field label="Description courte">
                <input value={form.tagline} onChange={e => set("tagline", e.target.value)} className={ic} placeholder="Courtier spécialisé ETF..." />
              </Field>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_partner} onChange={e => set("is_partner", e.target.checked)} className="size-4 rounded border-border" />
                <div>
                  <span className="text-sm font-medium">Partenaire VideoBourse</span>
                  <p className="text-xs text-muted-foreground">Badge visible + position prioritaire dans le classement</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_visible !== false} onChange={e => set("is_visible", e.target.checked)} className="size-4 rounded border-border" />
                <div>
                  <span className="text-sm font-medium">Visible dans les intermédiaires</span>
                  <p className="text-xs text-muted-foreground">Décocher pour masquer cet intermédiaire sur la page publique sans le supprimer</p>
                </div>
              </label>

              {/* Notes & Données — collapsible */}
              <div className="border-t border-border pt-4">
                <button type="button" onClick={() => setShowDataFields(!showDataFields)}
                  className="flex w-full items-center justify-between py-1 text-sm font-semibold hover:text-primary transition-colors">
                  <span>📊 Notes & données complémentaires</span>
                  {showDataFields ? <IconChevronUp className="size-4 shrink-0" /> : <IconChevronDown className="size-4 shrink-0" />}
                </button>

                {showDataFields && (
                  <div className="mt-4 space-y-5">
                    {/* Scores */}
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (0 – 10)</p>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {([
                          ["score_overall",     "⭐ Score global"],
                          ["score_fees",        "💰 Frais"],
                          ["score_reliability", "🛡 Fiabilité"],
                          ["score_ux",          "🖥 Interface"],
                          ["score_envergure",   "🌐 Envergure"],
                          ["score_support",     "🎧 Support"],
                        ] as [keyof FormState, string][]).map(([key, label]) => (
                          <Field key={key} label={label}>
                            <input type="number" min={0} max={10} step={0.1}
                              value={form[key] as string}
                              onChange={e => set(key, e.target.value)}
                              className={ic + " tabular-nums"} placeholder="—" />
                          </Field>
                        ))}
                      </div>
                    </div>

                    {/* Données numériques */}
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Données générales</p>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        <Field label="Année de création">
                          <input type="number" value={form.founded} onChange={e => set("founded", e.target.value)} className={ic} placeholder="2015" />
                        </Field>
                        <Field label="Dépôt minimum (€)">
                          <input type="number" value={form.deposit_minimum} onChange={e => set("deposit_minimum", e.target.value)} className={ic} placeholder="0" />
                        </Field>
                        <Field label="Trustpilot score">
                          <input type="number" min={0} max={5} step={0.1} value={form.trustpilot_score} onChange={e => set("trustpilot_score", e.target.value)} className={ic} placeholder="4.2" />
                        </Field>
                        <Field label="Trustpilot avis">
                          <input type="number" value={form.trustpilot_count} onChange={e => set("trustpilot_count", e.target.value)} className={ic} placeholder="12000" />
                        </Field>
                        <Field label="Frais de garde">
                          <div style={{ display:"flex", gap:4 }}>
                            <input type="number" step={0.01} value={form.custody_fee} onChange={e => set("custody_fee", e.target.value)} className={ic} placeholder="0" style={{ flex:1 }} />
                            <select value={form.custody_fee_unit} onChange={e => set("custody_fee_unit", e.target.value)} className={ic} style={{ width:72 }}>
                              <option value="€">€/an</option>
                              <option value="%">%/an</option>
                            </select>
                          </div>
                        </Field>
                        <Field label="Frais inactivité (€)">
                          <input type="number" step={0.01} value={form.inactivity_fee} onChange={e => set("inactivity_fee", e.target.value)} className={ic} placeholder="0" />
                        </Field>
                        <Field label="Frais change (%)">
                          <input type="number" step={0.01} value={form.currency_fee} onChange={e => set("currency_fee", e.target.value)} className={ic} placeholder="0" />
                        </Field>
                      </div>
                    </div>

                    {/* Critères vue tableau (fees JSON) */}
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">📊 Critères vue tableau</p>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        <Field label="FR 1er palier">
                          <div style={{ display:"flex", gap:4 }}>
                            <input type="number" step={0.01} value={form.fees_fr_amount} onChange={e => set("fees_fr_amount", e.target.value)} className={ic} placeholder="ex: 1.99" style={{ flex:1 }} />
                            <select value={form.fees_fr_type} onChange={e => set("fees_fr_type", e.target.value)} className={ic} style={{ width:80 }}>
                              <option value="flat">€ fixe</option><option value="percent">%</option>
                            </select>
                          </div>
                        </Field>
                        <Field label="US 1er palier">
                          <div style={{ display:"flex", gap:4 }}>
                            <input type="number" step={0.01} value={form.fees_us_amount} onChange={e => set("fees_us_amount", e.target.value)} className={ic} placeholder="ex: 15" style={{ flex:1 }} />
                            <select value={form.fees_us_type} onChange={e => set("fees_us_type", e.target.value)} className={ic} style={{ width:80 }}>
                              <option value="flat">€ fixe</option><option value="percent">%</option>
                            </select>
                          </div>
                        </Field>
                        <Field label="EU 1er palier">
                          <div style={{ display:"flex", gap:4 }}>
                            <input type="number" step={0.01} value={form.fees_eu_amount} onChange={e => set("fees_eu_amount", e.target.value)} className={ic} placeholder="ex: 3.90" style={{ flex:1 }} />
                            <select value={form.fees_eu_type} onChange={e => set("fees_eu_type", e.target.value)} className={ic} style={{ width:80 }}>
                              <option value="flat">€ fixe</option><option value="percent">%</option>
                            </select>
                          </div>
                        </Field>
                        <Field label="Spread Forex (pip EUR/USD)">
                          <input type="number" step={0.01} value={form.fees_spread_forex} onChange={e => set("fees_spread_forex", e.target.value)} className={ic} placeholder="ex: 0.6" />
                        </Field>
                        <Field label="Spread Indices (pts)">
                          <input type="number" step={0.1} value={form.fees_spread_indices} onChange={e => set("fees_spread_indices", e.target.value)} className={ic} placeholder="ex: 1" />
                        </Field>
                        <Field label="Overnight (%/nuit)">
                          <input type="number" step={0.001} value={form.fees_overnight} onChange={e => set("fees_overnight", e.target.value)} className={ic} placeholder="ex: 0.007" />
                        </Field>
                        <Field label="Abonnement Standard (€/mois)">
                          <input type="number" step={0.01} value={form.fees_standard_abo} onChange={e => set("fees_standard_abo", e.target.value)} className={ic} placeholder="0 = gratuit" />
                        </Field>
                        <Field label="Plafond retrait gratuit (€/mois)">
                          <input type="number" step={1} value={form.fees_retrait_especes} onChange={e => set("fees_retrait_especes", e.target.value)} className={ic} placeholder="ex: 200" />
                        </Field>
                        <Field label="Maker (%)">
                          <input type="number" step={0.001} value={form.fees_maker} onChange={e => set("fees_maker", e.target.value)} className={ic} placeholder="ex: 0.1" />
                        </Field>
                        <Field label="Taker (%)">
                          <input type="number" step={0.001} value={form.fees_taker} onChange={e => set("fees_taker", e.target.value)} className={ic} placeholder="ex: 0.1" />
                        </Field>
                        <Field label="Retrait fiat (€)">
                          <input type="number" step={0.01} value={form.fees_retrait_fiat} onChange={e => set("fees_retrait_fiat", e.target.value)} className={ic} placeholder="ex: 5" />
                        </Field>
                        <Field label="Dépôt carte (%)">
                          <input type="number" step={0.01} value={form.fees_depot_carte} onChange={e => set("fees_depot_carte", e.target.value)} className={ic} placeholder="ex: 1.5" />
                        </Field>
                        <Field label="Carte bancaire (€/an)">
                          <input type="number" step={0.01} value={form.fees_carte_banque} onChange={e => set("fees_carte_banque", e.target.value)} className={ic} placeholder="ex: 39" />
                        </Field>
                        <Field label="Virement (€/virement)">
                          <input type="number" step={0.01} value={form.fees_virement} onChange={e => set("fees_virement", e.target.value)} className={ic} placeholder="0 = gratuit" />
                        </Field>
                        <Field label="Droit d'entrée AV (%)">
                          <input type="number" step={0.01} value={form.fees_entree} onChange={e => set("fees_entree", e.target.value)} className={ic} placeholder="0 = gratuit" />
                        </Field>
                        <Field label="Arbitrage AV (€)">
                          <input type="number" step={0.01} value={form.fees_arbitrage} onChange={e => set("fees_arbitrage", e.target.value)} className={ic} placeholder="0 = gratuit" />
                        </Field>
                        <Field label="Sortie anticipée AV (%)">
                          <input type="number" step={0.01} value={form.fees_sortie_anticipee} onChange={e => set("fees_sortie_anticipee", e.target.value)} className={ic} placeholder="ex: 1" />
                        </Field>
                        <Field label="Gestion UC AV (%/an)">
                          <input type="number" step={0.01} value={form.fees_gestion_uc} onChange={e => set("fees_gestion_uc", e.target.value)} className={ic} placeholder="ex: 0.5" />
                        </Field>
                        <Field label="🛡 Protection solde négatif">
                          <label style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, cursor:"pointer" }}>
                            <input type="checkbox" checked={form.protection_solde_negatif} onChange={e => set("protection_solde_negatif", e.target.checked)} style={{ width:16, height:16, accentColor:"var(--primary)", cursor:"pointer" }} />
                            <span className="text-sm text-muted-foreground">Activée</span>
                          </label>
                        </Field>
                      </div>
                    </div>

                    {/* Listes */}
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Listes (virgule ou saut de ligne)</p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <Field label="Enveloppes (PEA, CTO, AV…)">
                          <input value={form.accounts} onChange={e => set("accounts", e.target.value)} className={ic} placeholder="PEA, CTO, AV" />
                        </Field>
                        <Field label="Régulation (AMF, FCA…)">
                          <input value={form.regulation} onChange={e => set("regulation", e.target.value)} className={ic} placeholder="AMF, FCA" />
                        </Field>
                        <Field label="Offre de bienvenue">
                          <input value={form.welcome_offer} onChange={e => set("welcome_offer", e.target.value)} className={ic} placeholder="100€ offerts jusqu'au 31/12" />
                        </Field>
                        <Field label="Meilleur pour">
                          <textarea value={form.best_for} onChange={e => set("best_for", e.target.value)} rows={2} className={ic + " resize-y"} placeholder="ETF long terme&#10;DCA mensuel" />
                        </Field>
                        <Field label="✅ Points forts (pros)">
                          <textarea value={form.pros} onChange={e => set("pros", e.target.value)} rows={3} className={ic + " resize-y"} placeholder="Pas de frais de courtage&#10;PEA disponible" />
                        </Field>
                        <Field label="❌ Points faibles (cons)">
                          <textarea value={form.cons} onChange={e => set("cons", e.target.value)} rows={3} className={ic + " resize-y"} placeholder="Support limité&#10;Pas de compte démo" />
                        </Field>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Groq enrichment */}
              <div className="border-t border-border pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <IconSparkles className="size-4 text-primary" />
                  <h4 className="text-sm font-semibold">Enrichir les données avec l&apos;IA</h4>
                  <span className="text-xs text-muted-foreground">(optionnel)</span>
                </div>
                <textarea value={pastedText} onChange={e => setPastedText(e.target.value)}
                  placeholder={"Collez ici le contenu de la page tarifaire de " + (form.name || "ce courtier") + "…"}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y font-mono" />
                {pastedText.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{pastedText.length.toLocaleString("fr-FR")} caractères</p>}
                {pastedText.trim().length >= 50 && (
                  <button onClick={handleAnalyze} disabled={analyzing}
                    className="mt-2 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50">
                    {analyzing ? <><IconLoader className="size-3.5 animate-spin" /> Analyse en cours…</> : <><IconSparkles className="size-3.5" /> Analyser avec Groq</>}
                  </button>
                )}
                {enrichResult && !enrichResult.error && (
                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400"><IconCheck className="inline size-3.5 mr-1" />Données extraites (confiance : {enrichResult.confiance})</p>
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
                  {saving ? "Enregistrement…" : editingSlug ? "Mettre à jour" : enrichResult && !enrichResult.error ? "Créer + enrichir" : "Créer l'intermédiaire"}
                </button>
                <button onClick={closeModal} className="rounded-lg border border-border px-6 py-2.5 text-sm hover:bg-muted">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}