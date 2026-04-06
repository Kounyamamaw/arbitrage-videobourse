"use client";

import { useState } from "react";

export function WaitlistForm({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Une erreur est survenue");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Erreur réseau");
    }
  };

  if (status === "success") {
    return (
      <div className={`rounded-xl border px-6 py-4 text-center ${
        variant === "dark"
          ? "border-white/20 bg-white/10 text-white"
          : "border-primary/20 bg-primary/5 text-foreground"
      }`}>
        <p className="text-sm font-semibold">Vous êtes sur la liste ! 🎉</p>
        <p className={`mt-1 text-xs ${variant === "dark" ? "opacity-60" : "text-muted-foreground"}`}>
          On vous enverra l&apos;accès beta dès que c&apos;est prêt.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
        placeholder="Votre adresse email"
        required
        className={`flex-1 rounded-xl border px-5 py-3 text-sm outline-none transition-all ${
          variant === "dark"
            ? "border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-white/40"
            : "border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
        }`}
      />
      <button
        type="submit"
        disabled={status === "loading" || !email}
        className={`shrink-0 rounded-xl px-7 py-3 text-sm font-semibold transition-all disabled:opacity-60 ${
          variant === "dark"
            ? "bg-white text-black hover:bg-white/90"
            : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
        }`}
      >
        {status === "loading" ? "..." : "Rejoindre la waitlist"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-500 sm:col-span-2">{errorMsg}</p>
      )}
    </form>
  );
}
