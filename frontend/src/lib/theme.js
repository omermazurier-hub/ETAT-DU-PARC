import { useEffect } from "react";
import { getSettings, subscribe } from "@/lib/storage";

export const THEME_DEFAULTS = { pageBg: "#f8fafc", accent: "#2563eb" };

export const PAGE_BG_PRESETS = [
  { key: "#f8fafc", label: "Gris clair" },
  { key: "#ffffff", label: "Blanc" },
  { key: "#eff6ff", label: "Bleu pâle" },
  { key: "#ecfdf5", label: "Vert pâle" },
  { key: "#fefce8", label: "Jaune pâle" },
  { key: "#fff7ed", label: "Orange pâle" },
  { key: "#f5f3ff", label: "Violet pâle" },
  { key: "#f1f5f9", label: "Ardoise" },
  { key: "#e2e8f0", label: "Gris" },
  { key: "#1e293b", label: "Sombre" },
];

export const ACCENT_PRESETS = [
  { key: "#2563eb", label: "Bleu" },
  { key: "#16a34a", label: "Vert" },
  { key: "#dc2626", label: "Rouge" },
  { key: "#ea580c", label: "Orange" },
  { key: "#ca8a04", label: "Jaune" },
  { key: "#7c3aed", label: "Violet" },
  { key: "#db2777", label: "Rose" },
  { key: "#0d9488", label: "Turquoise" },
  { key: "#475569", label: "Gris" },
  { key: "#0f172a", label: "Noir" },
];

function shade(hex, pct) {
  const n = parseInt(hex.replace("#", ""), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (pct < 0 ? c * pct : (255 - c) * pct))));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function applyTheme(theme) {
  const t = { ...THEME_DEFAULTS, ...(theme || {}) };
  const root = document.documentElement;
  root.style.setProperty("--app-bg", t.pageBg);
  root.style.setProperty("--app-accent", t.accent);
  root.style.setProperty("--app-accent-hover", shade(t.accent, -0.15));
  root.style.setProperty("--app-accent-soft", shade(t.accent, 0.9));
}

export function useApplyTheme() {
  useEffect(() => {
    applyTheme(getSettings().theme);
    return subscribe(() => applyTheme(getSettings().theme));
  }, []);
}
