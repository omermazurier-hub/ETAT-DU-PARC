import React from "react";
import { Link } from "react-router-dom";
import { fmtDate, validityStatus, isParachuteInvalid, packValidationDate } from "@/lib/validity";
import { StatusBadge, ParachuteStatusPill } from "@/components/StatusBadge";
import { ChevronRight } from "lucide-react";
import { TypeBubble, typeColor } from "@/lib/typeColors";
import { getSettings } from "@/lib/storage";

const Field = ({ label, value, mono }) => (
  <div className="flex items-baseline justify-between gap-2">
    <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
    <div className={`truncate text-xs font-semibold text-slate-800 ${mono ? "font-mono-tech" : ""}`}>
      {value || "—"}
    </div>
  </div>
);

const Section = ({ title, children, testId, invalid, color }) => (
  <div
    data-testid={testId}
    className={`flex-1 min-w-[200px] rounded-md border px-2.5 py-2 ${
      invalid ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50/60"
    }`}
  >
    <div
      className="mb-1 text-[10px] font-black uppercase tracking-widest"
      style={{ color: invalid ? "#be123c" : color }}
    >
      {title}
    </div>
    <div className="space-y-0.5">{children}</div>
  </div>
);

export default function ParachuteRow({ parachute, warningDays = 30 }) {
  const p = parachute;
  const settings = getSettings();
  const color = typeColor(settings, p.type);
  const invalid = isParachuteInvalid(p);
  const enReparation = p.status === "EN RÉPARATION";
  const sectionInvalid = invalid && !enReparation;
  const vsDateStatus = validityStatus(p.voileSecours?.validityDate, warningDays);
  const aadDateStatus = validityStatus(p.appareilSecurite?.expiryDate, warningDays);
  const aadBadgeStatus = aadDateStatus;
  const overall = enReparation ? "indisponible" : invalid ? "invalide" : "valide";
  const validation = packValidationDate(p);

  return (
    <Link
      to={`/parachute/${p.id}`}
      data-testid={`parachute-row-${p.id}`}
      className={`group block rounded-xl border-2 p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        enReparation ? "bg-orange-100" : invalid ? "bg-rose-50/70" : "bg-white"
      }`}
      style={{
        borderColor: `${color}55`,
        boxShadow: `0 0 0 1px ${color}22, 0 4px 14px -2px ${color}55`,
        transitionProperty: "border-color, box-shadow",
        transitionDuration: "180ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 0 0 1px ${color}44, 0 8px 22px -4px ${color}88`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}55`;
        e.currentTarget.style.boxShadow = `0 0 0 1px ${color}22, 0 4px 14px -2px ${color}55`;
      }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <TypeBubble type={p.type} settings={settings} testId={`parachute-type-${p.id}`} />
        <div className="font-heading text-base font-bold text-slate-900">{p.reference}</div>
        {validation && (
          <span
            data-testid={`parachute-validation-${p.id}`}
            className={`rounded-md border px-1.5 py-0.5 font-mono-tech text-[11px] font-bold ${
              vsDateStatus === "perime"
                ? "border-rose-300 bg-rose-100 text-rose-800"
                : "border-emerald-300 bg-emerald-50 text-emerald-800"
            }`}
          >
            Validité : {fmtDate(validation)}
          </span>
        )}
        {vsDateStatus === "proche" && (
          <StatusBadge status="proche" testId={`parachute-vs-proche-${p.id}`} />
        )}
        <div className="ml-auto flex items-center gap-2">
          <ParachuteStatusPill status={p.status} testId={`parachute-status-${p.id}`} />
          <StatusBadge status={overall} testId={`parachute-overall-${p.id}`} />
          <ChevronRight className="h-4 w-4 text-slate-400" style={{ color: invalid ? "#f43f5e" : undefined }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Section title="Harnais" testId={`row-sac-${p.id}`} invalid={sectionInvalid} color={color}>
          <Field label="Nom" value={p.sac?.type} />
          <Field label="N° série" value={p.sac?.serialNumber} mono />
        </Section>

        <Section title="Voile principale" testId={`row-vp-${p.id}`} invalid={sectionInvalid} color={color}>
          <Field label="Nom" value={p.voilePrincipale?.type} />
          <Field label="N° série" value={p.voilePrincipale?.serialNumber} mono />
          <Field
            label="Sauts"
            value={
              <span className="font-mono-tech font-bold" style={{ color }}>
                {(p.voilePrincipale?.totalJumps || 0).toLocaleString("fr-FR")}
              </span>
            }
          />
        </Section>

        <Section title="Voile de secours" testId={`row-vs-${p.id}`} invalid={sectionInvalid} color={color}>
          <Field label="Nom" value={p.voileSecours?.type} />
          <Field label="N° série" value={p.voileSecours?.serialNumber} mono />
        </Section>

        <Section title="Appareil de sécurité" testId={`row-aad-${p.id}`} invalid={sectionInvalid} color={color}>
          <Field
            label="Nom / modèle"
            value={`${p.appareilSecurite?.brand || ""} ${p.appareilSecurite?.model || ""}`.trim() || p.appareilSecurite?.type}
          />
          <Field label="N° série" value={p.appareilSecurite?.serialNumber} mono />
          <Field label="Validité" value={fmtDate(p.appareilSecurite?.expiryDate)} mono />
          <Field label="État" value={<StatusBadge status={aadBadgeStatus} testId={`row-aad-badge-${p.id}`} />} />
        </Section>
      </div>
    </Link>
  );
}
