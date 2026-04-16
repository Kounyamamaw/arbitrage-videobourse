"use client";

import { useState, useEffect } from "react";
import { IconDeviceFloppy, IconExternalLink, IconCheck, IconLoader } from "@tabler/icons-react";

type BrokerRow = {
  id: string;
  name: string;
  category: string;
  affiliate_url: string;
};

export function AffiliationsClient() {
  const [rows, setRows] = useState<BrokerRow[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/affiliations")
      .then((r) => r.json())
      .then((data) => { setRows(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (id: string) => {
    const newUrl = editing[id];
    if (!newUrl) return;
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/affiliations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, affiliate_url: newUrl }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, affiliate_url: newUrl } : r)));
      setEditing((prev) => { const next = { ...prev }; delete next[id]; return next; });
      setSaved((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [id]: false })), 2000);
    } catch {
      alert("Erreur lors de la mise à jour");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="flex h-32 items-center justify-center text-muted-foreground">Chargement...</div>;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h3 className="font-semibold">URLs d&apos;affiliation</h3>
        <p className="text-sm text-muted-foreground">Les modifications sont sauvegardées en base et prises en compte immédiatement sur les redirections /go/[slug].</p>
      </div>
      <div className="divide-y divide-border">
        {rows.map((broker) => (
          <div key={broker.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
            <div className="min-w-0 sm:w-40 sm:shrink-0">
              <p className="font-medium text-sm truncate">{broker.name}</p>
              <p className="text-xs text-muted-foreground">{broker.category}</p>
            </div>
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <input
                type="text"
                value={editing[broker.id] !== undefined ? editing[broker.id] : broker.affiliate_url}
                onChange={(e) => setEditing((prev) => ({ ...prev, [broker.id]: e.target.value }))}
                className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <a href={broker.affiliate_url} target="_blank" rel="noopener noreferrer"
                className="shrink-0 text-muted-foreground hover:text-foreground">
                <IconExternalLink className="size-4" />
              </a>
              <button
                disabled={saving === broker.id || editing[broker.id] === undefined || editing[broker.id] === broker.affiliate_url}
                onClick={() => handleSave(broker.id)}
                className="shrink-0 flex size-8 items-center justify-center rounded-lg border border-border bg-background text-sm disabled:opacity-30 hover:bg-muted">
                {saving === broker.id ? <IconLoader className="size-3.5 animate-spin" />
                  : saved[broker.id] ? <IconCheck className="size-3.5 text-green-600" />
                  : <IconDeviceFloppy className="size-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
