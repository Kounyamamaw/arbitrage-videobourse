"use client";

import { useEffect } from "react";

export function ThemeInit() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem("theme");
      if (raw) {
        const { state } = JSON.parse(raw);
        if (state?.isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } catch {
      // ignore — première visite ou localStorage bloqué
    }
  }, []);
  return null;
}
