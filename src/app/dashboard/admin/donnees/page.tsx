"use client";
import PageContainer from '@/components/layout/page-container';
import { useState, useEffect } from 'react';
import { IconPencil, IconX, IconCheck, IconLoader } from '@tabler/icons-react';

type Broker = { id: string; slug: string; name: string; category: string; score_overall: number; tagline: string; [key: string]: unknown };

const FIELDS = [
  { key: 'tagline',           label: 'Tagline',              type: 'text'    },
  { key: 'score_overall',     label: 'Score global',         type: 'number'  },
  { key: 'score_fees',        label: 'Score frais',          type: 'number'  },
  { key: 'score_ux',          label: 'Score interface',      type: 'number'  },
  { key: 'score_reliability', label: 'Score fiabilité',      type: 'number'  },
  { key: 'score_envergure',   label: 'Score envergure',      type: 'number'  },
  { key: 'score_support',     label: 'Score support',        type: 'number'  },
  { key: 'trustpilot_score',  label: 'Note Trustpilot',      type: 'number'  },
  { key: 'trustpilot_count',  label: 'Nb avis Trustpilot',   type: 'number'  },
  { key: 'deposit_minimum',   label: 'Dépôt minimum (€)',    type: 'number'  },
  { key: 'accounts',          label: 'Enveloppes (virgule)', type: 'text'    },
  { key: 'pros',              label: 'Points forts (virgule)',type: 'text'    },
  { key: 'cons',              label: 'Points faibles (virgule)',type:'text'   },
  { key: 'level',             label: 'Niveau cible',         type: 'select', options: ['debutant','intermediaire','expert'] },
  { key: 'is_foreign',        label: 'Compte étranger',      type: 'bool'    },
  { key: 'provides_ifu',      label: 'IFU fourni',           type: 'bool'    },
  { key: 'has_dca',           label: 'DCA disponible',       type: 'bool'    },
  { key: 'has_fractions',     label: "Fractions d'actions",  type: 'bool'    },
  { key: 'logo_url',          label: 'URL du logo',          type: 'text'    },
  { key: 'affiliate_url',     label: 'Lien affilié',         type: 'text'    },
  { key: 'demo_url',          label: 'Lien démo',            type: 'text'    },
  { key: 'fees.virement_int', label: 'Virement Int. (€)',    type: 'fees_montant' },
] as const;

export default function DonneesPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/brokers').then(r => r.json()).then(d => { setBrokers(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const openEdit = (b: Broker) => {
    const form: Record<string, string> = {};
    FIELDS.forEach(f => {
      if (f.type === 'fees_montant') {
        // Lire depuis broker.fees le sous-champ correspondant
        const subKey = f.key.replace(/^fees\./, '');
        const feesObj = (b.fees as Record<string, any>) ?? {};
        const montant = feesObj[subKey]?.montant;
        form[f.key] = montant != null ? String(montant) : '';
      } else {
        const v = b[f.key];
        form[f.key] = Array.isArray(v) ? (v as string[]).join(', ') : v !== null && v !== undefined ? String(v) : '';
      }
    });
    setEditForm(form);
    setEditingSlug(b.slug);
  };

  const handleSave = async () => {
    if (!editingSlug) return;
    setSaving(true);
    const payload: Record<string, unknown> = {};

    // Séparer les champs scalaires/array des sous-champs fees.*
    const feesSubfields: Record<string, { montant: number; details: string }> = {};

    FIELDS.forEach(f => {
      const v = editForm[f.key];
      if (v === '' || v === undefined) return;

      if (f.type === 'fees_montant') {
        // Clé de la forme "fees.xxx" → merge dans fees
        const subKey = f.key.replace(/^fees\./, '');
        const montant = parseFloat(v);
        if (!isNaN(montant)) {
          feesSubfields[subKey] = { montant, details: '' };
        }
      } else if (f.type === 'number') {
        payload[f.key] = parseFloat(v);
      } else if (f.type === 'bool') {
        payload[f.key] = v === 'true';
      } else if (f.key === 'accounts' || f.key === 'pros' || f.key === 'cons') {
        payload[f.key] = v.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else {
        payload[f.key] = v;
      }
    });

    // Si des sous-champs fees sont modifiés, fetch les fees actuels et merger
    if (Object.keys(feesSubfields).length > 0) {
      const broker = brokers.find(b => b.slug === editingSlug);
      const currentFees: Record<string, unknown> = (broker?.fees as Record<string, unknown>) ?? {};
      payload['fees'] = { ...currentFees, ...feesSubfields };
    }

    try {
      const res = await fetch(`/api/brokers/${editingSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setBrokers(prev => prev.map(b => b.slug === editingSlug ? { ...b, ...updated } : b));
        setSavedSlug(editingSlug);
        setTimeout(() => { setSavedSlug(null); setEditingSlug(null); }, 1400);
      }
    } catch { /* */ }
    setSaving(false);
  };

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">État & enrichissement des données</h2>
          <p className="text-muted-foreground mt-1">
            {brokers.length} intermédiaires · {brokers.filter(b => !b.score_overall || b.score_overall === 0).length} sans score
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold">Tous les intermédiaires</h3>
          </div>
          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground"><IconLoader className="size-5 animate-spin mr-2" />Chargement…</div>
          ) : (
            <div className="divide-y divide-border">
              {brokers.map(broker => (
                <div key={broker.slug}>
                  <div className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{broker.name}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{broker.category}</span>
                        {(() => {
                          // Calcul de complétude : champs clés remplis
                          const checks = [
                            broker.score_overall > 0,
                            broker.tagline && broker.tagline !== '',
                            (broker as any).pros?.length > 0,
                            (broker as any).cons?.length > 0,
                            (broker as any).level && (broker as any).level !== '',
                            (broker as any).asset_classes?.length > 0,
                            (broker as any).best_for?.length > 0,
                            (broker as any).markets_available?.length > 0,
                          ];
                          const filled = checks.filter(Boolean).length;
                          const pct = Math.round((filled / checks.length) * 100);
                          if (pct === 100) return <span className="text-xs font-semibold text-green-600 dark:text-green-400">✓ Complet</span>;
                          if (pct >= 50) return <span className="text-xs font-semibold text-amber-500">⚡ {pct}% rempli</span>;
                          return <span className="text-xs text-red-500">✗ {pct}% rempli</span>;
                        })()}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{broker.tagline || '—'}</p>
                    </div>
                    <button onClick={() => editingSlug === broker.slug ? setEditingSlug(null) : openEdit(broker)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary rounded-md border border-border px-3 py-1.5 transition-colors shrink-0">
                      {editingSlug === broker.slug ? <IconX className="size-3" /> : <IconPencil className="size-3" />}
                      {editingSlug === broker.slug ? 'Fermer' : 'Éditer'}
                    </button>
                  </div>

                  {editingSlug === broker.slug && (
                    <div className="border-t border-border bg-muted/30 px-6 py-5">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {FIELDS.map(f => (
                          <div key={f.key}>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
                            {f.type === 'select' ? (
                              <select value={editForm[f.key] || ''} onChange={e => setEditForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
                                <option value="">—</option>
                                {'options' in f && f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            ) : f.type === 'bool' ? (
                              <select value={editForm[f.key] || ''} onChange={e => setEditForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
                                <option value="">—</option>
                                <option value="true">Oui</option>
                                <option value="false">Non</option>
                              </select>
                            ) : f.type === 'fees_montant' ? (
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={editForm[f.key] || ''}
                                onChange={e => setEditForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                              />
                            ) : (
                              <input value={editForm[f.key] || ''} onChange={e => setEditForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none" />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button onClick={handleSave} disabled={saving}
                          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                          {saving ? <IconLoader className="size-3.5 animate-spin" /> : <IconCheck className="size-3.5" />}
                          {saving ? 'Enregistrement…' : savedSlug === broker.slug ? '✓ Sauvegardé !' : 'Sauvegarder'}
                        </button>
                        <button onClick={() => setEditingSlug(null)}
                          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
                          <IconX className="size-3.5" /> Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}