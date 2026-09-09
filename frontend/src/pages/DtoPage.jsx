import React, { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { listParachutes, subscribe, getSettings } from "@/lib/storage";
import { isParachuteAvailable } from "@/lib/validity";
import { TypeBubble } from "@/lib/typeColors";

const collator = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });

function groupByCanopy(items) {
  const map = new Map();
  items.forEach((p) => {
    const name = (p.voilePrincipale?.type || "Voile non renseignée").trim();
    const key = name.toLowerCase();
    if (!map.has(key)) map.set(key, { name, total: 0, available: 0, types: new Set() });
    const g = map.get(key);
    g.total += 1;
    if (isParachuteAvailable(p)) g.available += 1;
    g.types.add(p.type);
  });
  return [...map.values()].sort((a, b) => collator.compare(a.name, b.name));
}

export default function DtoPage() {
  const [items, setItems] = useState(listParachutes());
  const [settings, setSettings] = useState(getSettings());
  useEffect(
    () =>
      subscribe(() => {
        setItems(listParachutes());
        setSettings(getSettings());
      }),
    []
  );
  const groups = useMemo(() => groupByCanopy(items), [items]);
  const totalAvailable = items.filter(isParachuteAvailable).length;

  return (
    <div>
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-6">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900">DTO</h1>
        <p className="mb-5 flex items-center gap-2 text-sm text-slate-500">
          <span>Voiles disponibles par taille</span>
          <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800" data-testid="dto-total-available">
            {totalAvailable} disponible{totalAvailable > 1 ? "s" : ""} / {items.length}
          </span>
        </p>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2" data-testid="dto-list">
          {groups.length === 0 && <div className="text-sm text-slate-500">Aucun parachute.</div>}
          {groups.map((g) => (
            <div
              key={g.name}
              data-testid={`dto-row-${g.name.replace(/\s+/g, "-").toLowerCase()}`}
              className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2 shadow-sm ${
                g.available === 0 ? "border-rose-200" : "border-slate-200"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-mono-tech text-2xl font-extrabold ${
                  g.available === 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-800"
                }`}
                data-testid={`dto-available-${g.name.replace(/\s+/g, "-").toLowerCase()}`}
              >
                {g.available}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-heading text-base font-bold text-slate-900">{g.name}</div>
                <div className="text-[11px] text-slate-500">
                  {g.available} disponible{g.available > 1 ? "s" : ""} sur {g.total}
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                {[...g.types].map((t) => (
                  <TypeBubble key={t} type={t} settings={settings} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
