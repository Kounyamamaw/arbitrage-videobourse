"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USER  || "admin";
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS  || "videobourse2025";

export default function AdminLoginPage() {
  const router = useRouter();
  const [user, setUser]       = useState("");
  const [pass, setPass]       = useState("");
  const [show, setShow]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem("admin_auth", "1");
      router.push("/admin/dashboard");
    } else {
      setError("Identifiants incorrects.");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logos/logo-light.svg"
            alt="ArbitrAge"
            width={140}
            height={34}
            style={{ height: "32px", width: "auto" }}
            unoptimized
            className="dark:hidden"
          />
          <div className="text-center">
            <p className="text-xs font-medium" style={{ color: "var(--text-faint)" }}>
              ESPACE ADMINISTRATION
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 space-y-6"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div>
            <h1
              className="font-display font-semibold text-xl"
              style={{ color: "var(--text)" }}
            >
              Connexion
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Accès restreint aux administrateurs
            </p>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 rounded-lg p-3"
              style={{
                backgroundColor: "var(--negative-bg)",
                border: "1px solid var(--negative)",
              }}
            >
              <AlertCircle size={14} style={{ color: "var(--negative)", flexShrink: 0 }} />
              <span className="text-sm" style={{ color: "var(--negative)" }}>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Identifiant
              </label>
              <input
                type="text"
                autoComplete="username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  {show
                    ? <EyeOff size={14} style={{ color: "var(--text-faint)" }} />
                    : <Eye    size={14} style={{ color: "var(--text-faint)" }} />
                  }
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
              style={{ marginTop: "8px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="spinner" style={{ width: "14px", height: "14px" }} />
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock size={13} />
                  Se connecter
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs" style={{ color: "var(--text-faint)" }}>
          ArbitrAge — Administration
        </p>
      </div>
    </div>
  );
}
