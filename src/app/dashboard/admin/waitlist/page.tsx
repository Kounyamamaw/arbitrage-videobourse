"use client";

import PageContainer from "@/components/layout/page-container";
import { useState, useEffect } from "react";
import { IconMail, IconDownload, IconTrash } from "@tabler/icons-react";

type Subscriber = { id: number; email: string; created_at: string };

export default function AdminWaitlistPage() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/waitlist")
      .then(r => r.json())
      .then(data => { setSubs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleExport = () => {
    const csv = "email,date\n" + subs.map(s => `${s.email},${new Date(s.created_at).toLocaleDateString("fr-FR")}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "waitlist-arbitrage.csv"; a.click();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet inscrit ?")) return;
    await fetch(`/api/admin/waitlist?id=${id}`, { method: "DELETE" });
    setSubs(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <PageContainer><div className="flex h-32 items-center justify-center text-muted-foreground">Chargement...</div></PageContainer>;

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Waitlist</h2>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-semibold text-foreground">{subs.length}</span> inscrit{subs.length !== 1 ? "s" : ""}
            </p>
          </div>
          {subs.length > 0 && (
            <button onClick={handleExport}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
              <IconDownload className="size-4" /> Exporter CSV
            </button>
          )}
        </div>

        {subs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-16 text-center">
            <IconMail className="mx-auto size-10 text-muted-foreground/30" />
            <p className="mt-4 font-semibold text-sm">Aucun inscrit pour le moment</p>
            <p className="mt-1 text-xs text-muted-foreground">Partagez le lien /waitlist pour commencer à collecter des emails</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card">
            <div className="divide-y divide-border">
              {subs.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 px-4 py-3 sm:px-6 sm:gap-4">
                  <IconMail className="size-4 text-muted-foreground" />
                  <span className="flex-1 min-w-0 truncate text-sm font-medium">{sub.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(sub.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <button onClick={() => handleDelete(sub.id)} className="text-muted-foreground hover:text-red-500">
                    <IconTrash className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
