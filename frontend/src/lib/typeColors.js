export const TYPE_PALETTE = [
  { key: "blue", label: "Bleu", bg: "#2563eb" },
  { key: "green", label: "Vert", bg: "#16a34a" },
  { key: "red", label: "Rouge", bg: "#dc2626" },
  { key: "orange", label: "Orange", bg: "#ea580c" },
  { key: "yellow", label: "Jaune", bg: "#ca8a04" },
  { key: "purple", label: "Violet", bg: "#7c3aed" },
  { key: "pink", label: "Rose", bg: "#db2777" },
  { key: "teal", label: "Turquoise", bg: "#0d9488" },
  { key: "slate", label: "Gris", bg: "#475569" },
  { key: "black", label: "Noir", bg: "#0f172a" },
];

export function typeColor(settings, type) {
  const map = settings?.parachuteTypeColors || {};
  const t = (type || "").trim().toLowerCase();
  const entry = Object.keys(map).find((k) => k.trim().toLowerCase() === t);
  const key = entry ? map[entry] : undefined;
  return (TYPE_PALETTE.find((c) => c.key === key) || TYPE_PALETTE[0]).bg;
}

export function typeColorKey(settings, type) {
  const map = settings?.parachuteTypeColors || {};
  const t = (type || "").trim().toLowerCase();
  const entry = Object.keys(map).find((k) => k.trim().toLowerCase() === t);
  return entry ? map[entry] : "blue";
}

export function nextFreeColorKey(colors) {
  const used = new Set(Object.values(colors || {}));
  return (TYPE_PALETTE.find((c) => !used.has(c.key)) || TYPE_PALETTE[0]).key;
}

export const TypeBubble = ({ type, settings, testId }) => (
  <span
    data-testid={testId}
    className="rounded-md px-2.5 py-1 text-xs font-black uppercase tracking-widest text-white"
    style={{ backgroundColor: typeColor(settings, type) }}
  >
    {type}
  </span>
);
