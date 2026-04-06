"use client";

import { useState, useEffect } from "react";

export function WaitlistCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/waitlist/count")
      .then(r => r.json())
      .then(data => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, []);

  if (count === null) return null;

  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-bold text-foreground">{count.toLocaleString("fr-FR")}</span> investisseur{count !== 1 ? "s" : ""} sur la waitlist
    </p>
  );
}
