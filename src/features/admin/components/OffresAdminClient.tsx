"use client";
import { useState, useEffect } from "react";
import { IconPlus, IconPencil, IconTrash, IconGift, IconCheck, IconX } from "@tabler/icons-react";
import { ChevronUp, ChevronDown } from "lucide-react";

type Offer = {
  id: string;
  broker_slug: string;
  broker_name: string;
  broker_logo?: string;
  broker_category?: string;
  title: string;
  description: string;
  cta_label: string;
  cta_url: string;
  badge?: string;
  is_active: boolean;
  cta_enabled: boolean;
  expires_at?: string;
  sort_order: number;
};

const EMPTY: Omit<Offer, "id"> = {
  broker_slug: "", broker_name: "", broker_logo: "", broker_category: "broker",
  title: "", description: "", cta_label: "Voir l'offre", cta_url: "",
  badge: "", is_active: true, cta_enabled: true, expires_at: "", sort_order: 999,
};

const CAT_OPTIONS = [
  { value: "broker",    label: "Courtier" },
  { value: "bank",      label: "Banque" },
  { value: "neobanque", label: "Néobanque" },
  { value: "insurance", label: "Assurance-vie" },
  { value: "crypto",    label: "Crypto" },
  { value: "cfd",       label: "CFD" },
  { value: "scpi",      label: "SCPI" },
];

const ic = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

export function OffresAdminClient() {
  const [offers, setOffers]     = useState<Offer[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]         = useState<Omit<Offer, "id">>(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/offers?admin=1")
      .then(r => r.json())
      .then(d => setOffers(Array.isArray(d) ? d : []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k: keyof typeof EMPTY, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setForm(EMPTY); setEditingId(null); setShowModal(true); };
  const openEdit = (o: Offer) => {
    setForm({
      broker_slug: o.broker_slug, broker_name: o.broker_name,
      broker_logo: o.broker_logo || "", broker_category: o.broker_category || "broker",
      title: o.title, description: o.description,
      cta_label: o.cta_label, cta_url: o.cta_url,
      badge: o.badge || "", is_active: o.is_active, cta_enabled: o.cta_enabled !== false,
      expires_at: o.expires_at ? o.expires_at.split("T")[0] : "",
      sort_order: o.sort_order,
    });
    setEditingId(o.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.broker_name || !form.title || !form.cta_url) return;
    setSaving(true);
    try {
      const body = {
        ...form,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        badge: form.badge || null,
        broker_logo: form.broker_logo || null,
      };
      const url  = editingId ? `/api/offers/${editingId}` : "/api/offers";
      const meth = editingId ? "PATCH" : "POST";
      const res  = await fetch(url, { method: meth, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Erreur : ${err.error || res.status}`);
        return;
      }
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette offre ?")) return;
    await fetch(`/api/offers/${id}`, { method: "DELETE" });
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  const toggleActive = async (o: Offer) => {
    await fetch(`/api/offers/${o.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !o.is_active }),
    });
    setOffers(prev => prev.map(x => x.id === o.id ? { ...x, is_active: !x.is_active } : x));
  };

  // Déplacer une offre vers le haut ou le bas en échangeant les sort_order
  const moveOffer = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= offers.length) return;

    const current = offers[index];
    const target  = offers[targetIndex];
    const newCurrentOrder = target.sort_order;
    const newTargetOrder  = current.sort_order;

    // Optimistic update
    setOffers(prev => {
      const next = [...prev];
      next[index]       = { ...current, sort_order: newCurrentOrder };
      next[targetIndex] = { ...target,  sort_order: newTargetOrder  };
      return next.slice().sort((a, b) => a.sort_order - b.sort_order);
    });

    // Persist both changes in parallel
    await Promise.all([
      fetch(`/api/offers/${current.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: newCurrentOrder }),
      }),
      fetch(`/api/offers/${target.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: newTargetOrder }),
      }),
    ]);
  };

  return (
    <div className="flex flex-1 flex-col space-y-6 max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Offres Exclusives</h2>
          <p className="text-muted-foreground text-sm mt-1">Gérez les offres affichées sur la page Offres Exclusives</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <IconPlus className="size-4" /> Nouvelle offre
        </button>
      </div>

      {/* Liste des offres */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : offers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <IconGift className="size-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-sm">Aucune offre créée</p>
          <p className="text-xs text-muted-foreground mt-1">Cliquez sur &quot;Nouvelle offre&quot; pour commencer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((o, index) => (
            <div key={o.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4 min-w-0 w-full overflow-hidden">
              {/* Ligne 1 mobile: logo + infos */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                  {o.broker_logo && !o.broker_logo.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.broker_logo} alt={o.broker_name} className="size-7 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <span className="text-xs font-bold text-primary">{o.broker_name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-sm truncate">{o.broker_name}</p>
                    {o.badge && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary shrink-0">{o.badge}</span>}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 ${o.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                      {o.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{o.title}</p>
                </div>
              </div>
              {/* Actions : ordre + active + edit + delete */}
              <div className="flex items-center gap-1 sm:ml-auto">
                {/* Boutons monter / descendre */}
                <div className="flex flex-col" style={{ gap: 1 }}>
                  <button
                    onClick={() => moveOffer(index, "up")}
                    disabled={index === 0}
                    title="Monter"
                    className="flex items-center justify-center rounded p-0.5 text-muted-foreground hover:text-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                    style={{ width: 20, height: 18 }}
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => moveOffer(index, "down")}
                    disabled={index === offers.length - 1}
                    title="Descendre"
                    className="flex items-center justify-center rounded p-0.5 text-muted-foreground hover:text-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                    style={{ width: 20, height: 18 }}
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground w-6 text-center">#{o.sort_order}</span>
                <button onClick={() => toggleActive(o)} title={o.is_active ? "Désactiver" : "Activer"}
                  className="text-muted-foreground hover:text-primary ml-1">
                  {o.is_active ? <IconCheck className="size-4 text-green-500" /> : <IconX className="size-4" />}
                </button>
                <button onClick={() => openEdit(o)} className="text-muted-foreground hover:text-primary">
                  <IconPencil className="size-4" />
                </button>
                <button onClick={() => handleDelete(o.id)} className="text-muted-foreground hover:text-red-500">
                  <IconTrash className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <p className="font-semibold">{editingId ? "Modifier l'offre" : "Nouvelle offre"}</p>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <IconX className="size-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Nom intermédiaire *">
                  <input className={ic} value={form.broker_name} onChange={e => set("broker_name", e.target.value)} placeholder="ex: XTB" />
                </Field>
                <Field label="Slug intermédiaire">
                  <input className={ic} value={form.broker_slug} onChange={e => set("broker_slug", e.target.value)} placeholder="ex: xtb" />
                </Field>
              </div>
              <Field label="Catégorie">
                <select className={ic} value={form.broker_category || "broker"} onChange={e => set("broker_category", e.target.value)}>
                  {CAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="URL logo (optionnel)">
                <input className={ic} value={form.broker_logo || ""} onChange={e => set("broker_logo", e.target.value)} placeholder="https://..." />
              </Field>
              <Field label="Titre de l'offre *">
                <input className={ic} value={form.title} onChange={e => set("title", e.target.value)} placeholder="ex: Jusqu'à 100€ offerts" />
              </Field>
              <Field label="Description *">
                <textarea className={ic} rows={3} value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="Décrivez l'offre en détail…" />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Texte bouton">
                  <input className={ic} value={form.cta_label} onChange={e => set("cta_label", e.target.value)} placeholder="Voir l'offre" />
                </Field>
                <Field label="Badge (optionnel)">
                  <input className={ic} value={form.badge || ""} onChange={e => set("badge", e.target.value)} placeholder="ex: Exclusif" />
                </Field>
              </div>
              <Field label="URL de l'offre *">
                <input className={ic} value={form.cta_url} onChange={e => set("cta_url", e.target.value)} placeholder="https://..." />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Expire le (optionnel)">
                  <input className={ic} type="date" value={form.expires_at || ""} onChange={e => set("expires_at", e.target.value)} />
                </Field>
                <Field label="Ordre d'affichage">
                  <input className={ic} type="number" value={form.sort_order} onChange={e => set("sort_order", parseInt(e.target.value) || 999)} />
                </Field>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={form.is_active}
                    onChange={e => set("is_active", e.target.checked)} className="size-4 accent-primary" />
                  <label htmlFor="is_active" className="text-sm text-muted-foreground">Offre active (visible sur le site)</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="cta_enabled" checked={form.cta_enabled !== false}
                    onChange={e => set("cta_enabled", e.target.checked)} className="size-4 accent-primary" />
                  <label htmlFor="cta_enabled" className="text-sm text-muted-foreground">Bouton &quot;Voir l&apos;offre&quot; cliquable</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-border">
              <button onClick={() => setShowModal(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/60">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {saving ? "Enregistrement…" : editingId ? "Mettre à jour" : "Créer l'offre"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}