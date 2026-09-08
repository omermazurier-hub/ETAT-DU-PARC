import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { listParachutes, subscribe, getSettings } from "@/lib/storage";
import { fmtDate, validityStatus, isParachuteInvalid, packValidationDate } from "@/lib/validity";
import { TypeBubble, typeColor } from "@/lib/typeColors";
import { ChevronRight } from "lucide-react";

const ValidityPill = ({ label, date, status, testId }) => {
  const cls =
    status === "perime"
      ? "border-rose-300 bg-rose-100 text-rose-800"
      : status === "proche"
      ? "border-amber-300 bg-amber-100 text-amber-800"
      : status === "valide"
      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
      : "border-slate-300 bg-slate-100 text-slate-600";
  return (
    <div className={`flex items-center gap-1.5 rounded border px-1.5 py-0.5 leading-none ${cls}`} data-testid={testId}>
      <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{label}</span>
      <span className="font-mono-tech text-[11px] font-bold">{date ? fmtDate(date) : "—"}</span>
    </div>
  );
};

const OverviewRow = ({ p, settings }) => {
  const color = typeColor(settings, p.type);
  const enReparation = p.status === "EN RÉPARATION";
  const invalid = isParachuteInvalid(p);
  const vsDate = packValidationDate(p);
  const vsStatus = validityStatus(p.voileSecours?.validityDate, settings.warningDays);
  const aadStatus = validityStatus(p.appareilSecurite?.expiryDate, settings.warningDays);
  const aad = `${p.appareilSecurite?.brand || ""} ${p.appareilSecurite?.model || ""}`.trim() || p.appareilSecurite?.type;
  const parts = [p.sac?.type, p.voilePrincipale?.type, p.voileSecours?.type, aad].filter(Boolean);
  const bg = enReparation ? "bg-orange-100" : invalid ? "bg-rose-50" : "bg-white";
  return (
    <Link
      to={`/parachute/${p.id}`}
      data-testid={`overview-row-${p.id}`}
      className={`flex flex-wrap items-center gap-2 rounded-md border px-2 py-1 ${bg}`}
      style={{ borderColor: `${color}66`, boxShadow: `0 1px 4px -1px ${color}55` }}
    >
      <TypeBubble type={p.type} settings={settings} />
      <div className="font-heading text-xs font-bold text-slate-900">{p.reference}</div>
      <div className="flex-1 truncate text-xs text-slate-700" data-testid={`overview-parts-${p.id}`}>
        {parts.map((x, i) => (
          <span key={i}>
            {i > 0 && <span className="mx-1.5 text-slate-300">•</span>}
            <span className="font-medium">{x}</span>
          </span>
        ))}
      </div>
      <ValidityPill label="Val." date={vsDate} status={vsStatus} testId={`overview-vs-${p.id}`} />
      <ValidityPill label="Val. EQS" date={p.appareilSecurite?.expiryDate} status={aadStatus} testId={`overview-aad-${p.id}`} />
      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
    </Link>
  );
};

export default function OverviewPage() {
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
  const count = useMemo(() => items.length, [items]);
  return (
    <div>
      <AppHeader />
      <main className="mx-auto max-w-7xl px-6 py-5">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900">Vue d'ensemble</h1>
        <p className="mb-3 text-xs text-slate-500">{count} matériel{count > 1 ? "s" : ""}</p>
        <div className="space-y-1" data-testid="overview-list">
          {items.length === 0 && <div className="text-sm text-slate-500">Aucun parachute.</div>}
          {items.map((p) => (
            <OverviewRow key={p.id} p={p} settings={settings} />
          ))}
        </div>
      </main>
    </div>
  );
}
