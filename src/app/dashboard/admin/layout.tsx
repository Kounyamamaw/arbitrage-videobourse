"use client";

import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_auth");
    if (stored === "true") setAuthenticated(true);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setAuthenticated(true);
        sessionStorage.setItem("admin_auth", "true");
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  };

  if (!authenticated) {
    return (
      <PageContainer>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-2 text-xl font-bold">Administration</h2>
            <p className="mb-6 text-sm text-muted-foreground">Entrez le mot de passe administrateur.</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Mot de passe"
              className="mb-3 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            {error && <p className="mb-3 text-xs text-red-500">Mot de passe incorrect</p>}
            <button onClick={handleLogin}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Se connecter
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return <>{children}</>;
}
