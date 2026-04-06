"use client";

import PageContainer from '@/components/layout/page-container';
import { useState, useEffect } from 'react';
import { IconDeviceFloppy, IconCheck, IconLoader } from '@tabler/icons-react';

const SECTIONS = [
  { title: "Landing Page — Textes", keys: [
    { key: 'hero_title', label: 'Titre Hero', type: 'text' },
    { key: 'hero_subtitle', label: 'Sous-titre Hero', type: 'textarea' },
    { key: 'hero_badge', label: 'Badge Hero', type: 'text' },
    { key: 'cta_title', label: 'Titre CTA final', type: 'text' },
    { key: 'cta_subtitle', label: 'Sous-titre CTA', type: 'text' },
    { key: 'footer_text', label: 'Texte footer', type: 'text' },
  ]},
  { title: "Landing Page — Métriques", keys: [
    { key: 'stat_1_value', label: 'Métrique 1 — valeur', type: 'text' },
    { key: 'stat_1_label', label: 'Métrique 1 — label', type: 'text' },
    { key: 'stat_2_value', label: 'Métrique 2 — valeur', type: 'text' },
    { key: 'stat_2_label', label: 'Métrique 2 — label', type: 'text' },
    { key: 'stat_3_value', label: 'Métrique 3 — valeur', type: 'text' },
    { key: 'stat_3_label', label: 'Métrique 3 — label', type: 'text' },
    { key: 'stat_4_value', label: 'Métrique 4 — valeur', type: 'text' },
    { key: 'stat_4_label', label: 'Métrique 4 — label', type: 'text' },
  ]},
  { title: "Landing Page — Témoignages", keys: [
    { key: 'testimonial_1_name', label: 'Témoignage 1 — nom', type: 'text' },
    { key: 'testimonial_1_role', label: 'Témoignage 1 — rôle', type: 'text' },
    { key: 'testimonial_1_text', label: 'Témoignage 1 — texte', type: 'textarea' },
    { key: 'testimonial_2_name', label: 'Témoignage 2 — nom', type: 'text' },
    { key: 'testimonial_2_role', label: 'Témoignage 2 — rôle', type: 'text' },
    { key: 'testimonial_2_text', label: 'Témoignage 2 — texte', type: 'textarea' },
    { key: 'testimonial_3_name', label: 'Témoignage 3 — nom', type: 'text' },
    { key: 'testimonial_3_role', label: 'Témoignage 3 — rôle', type: 'text' },
    { key: 'testimonial_3_text', label: 'Témoignage 3 — texte', type: 'textarea' },
  ]},
];

export default function ContentPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(data => { setContent(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (key: string) => {
    setSaving(key);
    await fetch('/api/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value: content[key] }) });
    setSaved(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2000);
    setSaving(null);
  };

  if (loading) return <PageContainer><div className="flex h-32 items-center justify-center text-muted-foreground">Chargement...</div></PageContainer>;

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contenu du site</h2>
          <p className="text-sm text-muted-foreground mt-1">Modifiez les textes, métriques et témoignages de la landing page.</p>
        </div>
        {SECTIONS.map(section => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</h3>
            {section.keys.map(({ key, label, type }) => (
              <div key={key} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">{label}</label>
                  <button onClick={() => handleSave(key)} disabled={saving === key}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
                    {saving === key ? <IconLoader className="size-3 animate-spin" /> : saved[key] ? <IconCheck className="size-3" /> : <IconDeviceFloppy className="size-3" />}
                    {saved[key] ? 'OK' : 'Sauver'}
                  </button>
                </div>
                {type === 'textarea' ? (
                  <textarea value={content[key] || ''} onChange={e => setContent(prev => ({ ...prev, [key]: e.target.value }))} rows={2}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-y" />
                ) : (
                  <input type="text" value={content[key] || ''} onChange={e => setContent(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
