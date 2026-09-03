import React from "react";
import { STATUS_META, PARACHUTE_STATUS_META } from "@/lib/validity";
import { cn } from "@/lib/utils";

export const StatusBadge = ({ status, label, className, testId }) => {
  const meta = STATUS_META[status] || STATUS_META.unknown;
  return (
    <span
      data-testid={testId}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase",
        meta.badge,
        className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
      {label || meta.label}
    </span>
  );
};

export const ParachuteStatusPill = ({ status, className, testId }) => {
  const cls = PARACHUTE_STATUS_META[status] || "bg-slate-50 text-slate-700 border-slate-300";
  return (
    <span
      data-testid={testId}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase",
        cls,
        className,
      )}
    >
      {status}
    </span>
  );
};
