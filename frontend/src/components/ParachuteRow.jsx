import React from "react";
import { Link } from "react-router-dom";
import { fmtDate, validityStatus, overallValidity } from "@/lib/validity";
import { StatusBadge, ParachuteStatusPill } from "@/components/StatusBadge";
import { ChevronRight } from "lucide-react";

const Field = ({ label, value, mono }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
    <div className={`text-sm font-semibold text-slate-800 ${mono ? "font-mono-tech" : ""}`}>
      {value || "—"}
    </div>
  </div>
);

const Section = ({ title, children, testId }) => (
  <div
    data-testid={testId}
    className="flex-1 min-w-[220px] rounded-lg border border-slate-200 bg-slate-50/60 p-3"
  >
    <div className="mb-2 flex items-center justify-between">
      <div className="text-[11px] font-black uppercase tracking-widest text-blue-700">{title}</div>
    </div>
    <div className="space-y-1.5">{children}</div>
  </div>
);

export default function ParachuteRow({ parachute, warningDays = 30 }) {
  const p = parachute;
  const vsStatus = validityStatus(p.voileSecours?.validityDate, warningDays);
  const aadStatus = validityStatus(p.appareilSecurite?.expiryDate, warningDays);
  const overall = overallValidity(p, warningDays);

  return (
    <Link
      to={`/parachute/${p.id}`}
      data-testid={`parachute-row-${p.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-500 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      style={{ transitionProperty: "border-color, box-shadow", transitionDuration: "180ms" }}
    >
      {/* Header line */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-black uppercase tracking-widest text-white">
            {p.type}
          </span>
          <div className="font-heading text-lg font-bold text-slate-900">{p.reference}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ParachuteStatusPill status={p.status} testId={`parachute-status-${p.id}`} />
          <StatusBadge status={overall} testId={`parachute-overall-${p.id}`} />
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
        </div>
      </div>

      {/* 4 sections */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Section title="Sac" testId={`row-sac-${p.id}`}>
          <Field label="N° série" value={p.sac?.serialNumber} mono />
          <Field label="Fabrication" value={fmtDate(p.sac?.manufacturingDate)} mono />
        </Section>

        <Section title="Voile principale" testId={`row-vp-${p.id}`}>
          <Field label="N° série" value={p.voilePrincipale?.serialNumber} mono />
          <Field label="Fabrication" value={fmtDate(p.voilePrincipale?.manufacturingDate)} mono />
          <Field
            label="Sauts (total)"
            value={
              <span className="font-mono-tech font-bold text-blue-700">
                {(p.voilePrincipale?.totalJumps || 0).toLocaleString("fr-FR")}
              </span>
            }
          />
        </Section>

        <Section title="Voile de secours" testId={`row-vs-${p.id}`}>
          <Field label="N° série" value={p.voileSecours?.serialNumber} mono />
          <Field label="Fabrication" value={fmtDate(p.voileSecours?.manufacturingDate)} mono />
          <div className="pt-1">
            <StatusBadge status={vsStatus} testId={`row-vs-badge-${p.id}`} />
          </div>
        </Section>

        <Section title="Appareil de sécurité" testId={`row-aad-${p.id}`}>
          <Field label="N° série" value={p.appareilSecurite?.serialNumber} mono />
          <Field label="Fabrication" value={fmtDate(p.appareilSecurite?.manufacturingDate)} mono />
          <Field label="Péremption" value={fmtDate(p.appareilSecurite?.expiryDate)} mono />
          <div className="pt-1">
            <StatusBadge status={aadStatus} testId={`row-aad-badge-${p.id}`} />
          </div>
        </Section>
      </div>
    </Link>
  );
}
