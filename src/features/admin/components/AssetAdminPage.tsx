"use client";

import { useState, useEffect } from "react";
import { IconPlus, IconTrash, IconPencil, IconCheck, IconX } from "@tabler/icons-react";

type AssetRow = { id?: string; name: string; [key: string]: unknown };

// Champs spécifiques par classe d'actif
const FIELDS: Record<string, { key: string; label: string; placeholder: string; type?: string }[]> = {
  actions: [
    { key: "name",        label: "Nom *",        placeholder: "Apple Inc."       },
    { key: "ticker",      label: "Ticker",        placeholder: "AAPL"             },
    { key: "isin",        label: "ISIN",          placeholder: "US0378331005"     },
    { key: "market",      label: "Marché",        placeholder: "NASDAQ"           },
    { key: "sector",      label: "Secteur",       placeholder: "Technologie"      },
    { key: "description", label: "Description",   placeholder: "Description…",   type: "textarea" },
  ],
  options: [
    { key: "name",        label: "Nom *",         placeholder: "Option AAPL Call" },
    { key: "underlying",  label: "Sous-jacent",   placeholder: "AAPL"             },
    { key: "expiry",      label: "Échéance",      placeholder: "2025-12-19"       },
    { key: "strike",      label: "Strike",        placeholder: "180"              },
    { key: "option_type", label: "Type",          placeholder: "Call / Put"       },
    { key: "description", label: "Description",   placeholder: "Description…",   type: "textarea" },
  ],
  futures: [
    { key: "name",        label: "Nom *",         placeholder: "ES1! (S&P 500 Future)" },
    { key: "ticker",      label: "Ticker",        placeholder: "ES1!"              },
    { key: "asset_class", label: "Catégorie",     placeholder: "Indice / Matière première / Devise" },
    { key: "exchange",    label: "Bourse",        placeholder: "CME / EUREX"       },
    { key: "contract_size", label: "Taille contrat", placeholder: "50 × valeur"  },
    { key: "description", label: "Description",   placeholder: "Description…",   type: "textarea" },
  ],
  cfds: [
    { key: "name",        label: "Nom *",         placeholder: "CFD Apple"        },
    { key: "ticker",      label: "Ticker",        placeholder: "AAPL.CFD"         },
    { key: "underlying",  label: "Sous-jacent",   placeholder: "AAPL"             },
    { key: "spread",      label: "Spread typique", placeholder: "0.1%"            },
    { key: "description", label: "Description",   placeholder: "Description…",   type: "textarea" },
  ],
  forex: [
    { key: "name",        label: "Paire *",       placeholder: "EUR/USD"          },
    { key: "ticker",      label: "Ticker",        placeholder: "EURUSD"           },
    { key: "base",        label: "Devise base",   placeholder: "EUR"              },
    { key: "quote",       label: "Devise cotée",  placeholder: "USD"              },
    { key: "pip_value",   label: "Valeur du pip", placeholder: "10 USD (lot std)" },
    { key: "description", label: "Description",   placeholder: "Description…",   type: "textarea" },
  ],
};

const DEFAULT_FIELDS = [
  { key: "name",        label: "Nom *",        placeholder: "Nom de l'actif"   },
  { key: "ticker",      label: "Ticker",        placeholder: "TICKER"           },
  { key: "isin",        label: "ISIN",          placeholder: "ISIN"             },
  { key: "description", label: "Description",   placeholder: "Description…",   type: "textarea" },
];

export function AssetAdminPage({
  assetType, label, supabaseTable,
}: { assetType: string; label: string; supabaseTable: string }) {
  const fields = FIELDS[supabaseTable] || DEFAULT_FIELDS;
  const emptyForm: AssetRow = { name: "" };
  fields.forEach(f => { emptyForm[f.key] = ""; });

  const [rows, setRows] = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AssetRow>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const apiBase = `/api/admin/assets/${supabaseTable}`;

  useEffect(() => {
    fetch(apiBase)
      .then(r => r.json())
      .then(data => { setRows(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [apiBase]);

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`${apiBase}/${editing}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (res.ok) { const u = await res.json(); setRows(prev => prev.map(r => r.id === editing ? u : r)); }
      } else {
        const res = await fetch(apiBase, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (res.ok) { const n = await res.json(); setRows(prev => [...prev, n]); }
      }
      setForm(emptyForm); setEditing(null); setShowForm(false);
    } catch { /* */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Supprimer cet élément ?`)) return;
    await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // Colonnes à afficher dans le tableau (max 3 premiers champs non-description)
  const tableCols = fields.filter(f => f.type !== "textarea").slice(0, 3);

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{label}</h2>
          <p className="text-muted-foreground mt-1">{rows.length} {label.toLowerCase()} référencé{rows.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <IconPlus className="size-4" /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold">{editing ? `Modifier` : `Ajouter ${label === "Forex" ? "une paire" : `un ${label.toLowerCase()}`}`}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map(({ key, label: lbl, placeholder, type }) => (
              <div key={key} className={type === "textarea" ? "md:col-span-2" : ""}>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{lbl}</label>
                {type === "textarea" ? (
                  <textarea
                    value={(form[key] as string) || ""}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    rows={2}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder={placeholder}
                  />
                ) : (
                  <input
                    value={(form[key] as string) || ""}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder={placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.name}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" /> : <IconCheck className="size-4" />}
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
              <IconX className="size-4" /> Annuler
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
            <p className="text-sm">Aucun {label.toLowerCase()} référencé</p>
            <p className="text-xs">Cliquez sur &quot;Ajouter&quot; pour commencer</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                {tableCols.map(c => (
                  <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{c.label.replace(" *","")}</th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(row => (
                <tr key={String(row.id)} className="hover:bg-muted/30 transition-colors">
                  {tableCols.map(c => (
                    <td key={c.key} className="px-4 py-3 font-mono text-xs text-muted-foreground first:font-medium first:text-foreground">
                      {(row[c.key] as string) || "—"}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setForm(row); setEditing(String(row.id)); setShowForm(true); }}
                        className="text-muted-foreground hover:text-primary transition-colors">
                        <IconPencil className="size-4" />
                      </button>
                      <button onClick={() => row.id && handleDelete(String(row.id))}
                        className="text-muted-foreground hover:text-red-500 transition-colors">
                        <IconTrash className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
