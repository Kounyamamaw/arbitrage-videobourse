"use client";

import PageContainer from '@/components/layout/page-container';
import { useState, useEffect } from 'react';
import { IconPlus, IconTrash, IconPencil, IconCheck, IconX } from '@tabler/icons-react';

type ETF = {
  isin: string; ticker: string; name: string; issuer: string;
  index_name: string; index_slug: string; ter: number; aum_bn: number;
  replication: string; hedged: boolean; currency: string;
  pea_eligible: boolean; domicile: string; dividend: string;
  inception_year: number; description: string; available_at: string[];
};

const EMPTY_ETF: Partial<ETF> = {
  isin: '', ticker: '', name: '', issuer: '', index_name: '', index_slug: '',
  ter: 0, aum_bn: 0, replication: 'physical', hedged: false, currency: 'EUR',
  pea_eligible: false, domicile: '', dividend: 'accumulating', inception_year: 2024,
  description: '', available_at: [],
};

export default function ETFAdminPage() {
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ETF>>(EMPTY_ETF);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/etfs').then(r => r.json()).then(data => { setEtfs(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.isin || !form.ticker || !form.name) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/etfs/${form.isin}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (res.ok) {
          const updated = await res.json();
          setEtfs(prev => prev.map(e => e.isin === editing ? updated : e));
        }
      } else {
        const res = await fetch('/api/etfs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (res.ok) {
          const newEtf = await res.json();
          setEtfs(prev => [...prev, newEtf]);
        }
      }
      setForm(EMPTY_ETF);
      setShowForm(false);
      setEditing(null);
    } catch { /* */ }
    setSaving(false);
  };

  const handleDelete = async (isin: string) => {
    if (!confirm('Supprimer cet ETF ?')) return;
    await fetch(`/api/etfs/${isin}`, { method: 'DELETE' });
    setEtfs(prev => prev.filter(e => e.isin !== isin));
  };

  const startEdit = (etf: ETF) => {
    setForm(etf);
    setEditing(etf.isin);
    setShowForm(true);
  };

  if (loading) return <PageContainer><div className="flex h-32 items-center justify-center text-muted-foreground">Chargement...</div></PageContainer>;

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion des ETF</h2>
            <p className="text-sm text-muted-foreground mt-1">{etfs.length} ETF référencés</p>
          </div>
          <button onClick={() => { setForm(EMPTY_ETF); setEditing(null); setShowForm(!showForm); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <IconPlus className="size-4" /> Ajouter un ETF
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border border-primary/20 bg-card p-6">
            <h3 className="mb-4 font-semibold">{editing ? 'Modifier' : 'Nouvel'} ETF</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { key: 'isin', label: 'ISIN *', disabled: !!editing },
                { key: 'ticker', label: 'Ticker *' },
                { key: 'name', label: 'Nom *' },
                { key: 'issuer', label: 'Émetteur (slug)' },
                { key: 'index_name', label: 'Indice' },
                { key: 'index_slug', label: 'Slug indice' },
                { key: 'ter', label: 'TER (%)', type: 'number' },
                { key: 'aum_bn', label: 'Encours (Mds€)', type: 'number' },
                { key: 'currency', label: 'Devise' },
                { key: 'domicile', label: 'Domicile' },
                { key: 'inception_year', label: 'Année lancement', type: 'number' },
              ].map(({ key, label, type, disabled }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
                  <input
                    type={type || 'text'}
                    value={(form as Record<string, unknown>)[key] as string || ''}
                    onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    disabled={disabled}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Réplication</label>
                <select value={form.replication} onChange={e => setForm(f => ({ ...f, replication: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="physical">Physique</option>
                  <option value="synthetic">Synthétique</option>
                </select>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.pea_eligible} onChange={e => setForm(f => ({ ...f, pea_eligible: e.target.checked }))} className="rounded" />
                  Éligible PEA
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.hedged} onChange={e => setForm(f => ({ ...f, hedged: e.target.checked }))} className="rounded" />
                  Hedgé
                </label>
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
              <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-y" />
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={handleSave} disabled={saving || !form.isin || !form.ticker}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button onClick={() => { setShowForm(false); setEditing(null); }}
                className="rounded-lg border border-border px-6 py-2 text-sm hover:bg-muted">Annuler</button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {etfs.map((etf) => (
              <div key={etf.isin} className="flex items-center gap-4 px-6 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{etf.ticker}</span>
                    <span className="text-sm font-medium">{etf.name}</span>
                    {etf.pea_eligible && <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">PEA</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{etf.isin} · TER {etf.ter}% · {etf.issuer}</p>
                </div>
                <button onClick={() => startEdit(etf)} className="text-muted-foreground hover:text-foreground"><IconPencil className="size-4" /></button>
                <button onClick={() => handleDelete(etf.isin)} className="text-muted-foreground hover:text-red-500"><IconTrash className="size-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
