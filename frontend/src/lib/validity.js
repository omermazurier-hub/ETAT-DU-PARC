// Validity + date helpers (fr-FR)

export function parseDate(d) {
  if (!d) return null;
  const x = new Date(d);
  if (isNaN(x.getTime())) return null;
  return x;
}

export function fmtDate(d) {
  const x = parseDate(d);
  if (!x) return "—";
  return x.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function fmtDateTime(d) {
  const x = parseDate(d);
  if (!x) return "—";
  return x.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysBetween(date) {
  const x = parseDate(date);
  if (!x) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(x);
  t.setHours(0, 0, 0, 0);
  return Math.round((t - today) / 86400000);
}

// Returns "valide" | "proche" | "perime" | "unknown"
export function validityStatus(date, warningDays = 30) {
  const days = daysBetween(date);
  if (days === null) return "unknown";
  if (days < 0) return "perime";
  if (days <= warningDays) return "proche";
  return "valide";
}

export const STATUS_META = {
  valide: {
    label: "VALIDE",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-300",
  },
  proche: {
    label: "PÉREMPTION PROCHE",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 border-amber-300",
  },
  perime: {
    label: "PÉRIMÉ",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-300",
  },
  invalide: {
    label: "INVALIDE",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-300",
  },
  indisponible: {
    label: "INDISPONIBLE",
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-800 border-orange-300",
  },
  unknown: {
    label: "NON DÉFINI",
    dot: "bg-slate-300",
    badge: "bg-slate-50 text-slate-600 border-slate-300",
  },
};

export const PARACHUTE_STATUS_META = {
  "EN SERVICE": "bg-blue-50 text-blue-700 border-blue-300",
  "EN PLIAGE": "bg-amber-50 text-amber-800 border-amber-300",
  "EN RÉPARATION": "bg-orange-50 text-orange-800 border-orange-300",
  INDISPONIBLE: "bg-slate-100 text-slate-700 border-slate-300",
  ARCHIVÉ: "bg-slate-200 text-slate-800 border-slate-400",
};

export function overallValidity(p, warningDays = 30) {
  const s1 = validityStatus(p.voileSecours?.validityDate, warningDays);
  const s2 = validityStatus(p.appareilSecurite?.expiryDate, warningDays);
  const priority = { perime: 3, proche: 2, valide: 1, unknown: 0 };
  return priority[s1] >= priority[s2] ? s1 : s2;
}

// Global validation date for a parachute = lastPackDate + 1 year
export function packValidationDate(p) {
  const stored = parseDate(p?.voileSecours?.validityDate);
  if (stored) return stored;
  const d = parseDate(p?.voileSecours?.lastPackDate);
  if (!d) return null;
  const v = new Date(d);
  v.setFullYear(v.getFullYear() + 1);
  return v;
}

export function isParachuteInvalid(p) {
  if (!p) return false;
  if (p.status !== "EN SERVICE") return true;
  const v = packValidationDate(p);
  if (!v) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return v < today;
}
