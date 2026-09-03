import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { listParachutes, getSettings } from "@/lib/storage";
import { listSheets, saveSheet, deleteSheet } from "@/lib/sheets";
import { TypeBubble } from "@/lib/typeColors";
import { FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const MAX_MB = 20;

const SheetRow = ({ p, sheet, onChange }) => {
  const ref = useRef(null);
  const settings = getSettings();
  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.type !== "application/pdf") return toast.error("Seuls les fichiers PDF sont acceptés");
    if (f.size > MAX_MB * 1024 * 1024) return toast.error(`Fichier trop volumineux (max ${MAX_MB} Mo)`);
    await saveSheet(p.id, f);
    toast.success(`Feuille enregistrée pour ${p.reference}`);
    onChange();
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" data-testid={`sheet-row-${p.id}`}>
      <div className="flex items-center gap-3">
        <TypeBubble type={p.type} settings={settings} />
        <span className="text-sm font-semibold text-slate-800">{p.reference}</span>
      </div>
      <div className="flex items-center gap-2">
        {sheet ? (
          <span className="flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800" data-testid={`sheet-name-${p.id}`}>
            <FileText className="h-3.5 w-3.5" /> {sheet.name}
          </span>
        ) : (
          <span className="text-xs text-slate-400" data-testid={`sheet-none-${p.id}`}>Aucune feuille</span>
        )}
        <input ref={ref} type="file" accept="application/pdf" className="hidden" onChange={pick} data-testid={`sheet-input-${p.id}`} />
        <Button size="sm" variant="outline" onClick={() => ref.current?.click()} data-testid={`sheet-pick-${p.id}`}>
          <Upload className="mr-2 h-4 w-4" /> {sheet ? "Remplacer" : "Choisir un fichier"}
        </Button>
        {sheet && (
          <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" data-testid={`sheet-del-${p.id}`}
            onClick={async () => { await deleteSheet(p.id); toast.success("Feuille supprimée"); onChange(); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default function SheetsSettings() {
  const [sheets, setSheets] = useState({});
  const parachutes = listParachutes();
  const reload = () => listSheets().then((arr) => setSheets(Object.fromEntries(arr.map((s) => [s.parachuteId, s]))));
  useEffect(() => { reload(); }, []);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2" data-testid="sheets-settings">
      <div className="mb-1 flex items-center gap-2">
        <div className="h-6 w-1 rounded bg-blue-600" />
        <h3 className="font-heading text-base font-extrabold uppercase tracking-wide text-slate-900">Feuilles d'impression (PDF)</h3>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        Choisissez pour chaque parachute la feuille PDF de votre ordinateur qui sera affichée lorsque vous cliquez sur « Imprimer ». Le fichier est conservé hors ligne dans l'application.
      </p>
      <div className="space-y-1.5">
        {parachutes.length === 0 && <div className="text-sm text-slate-500">Aucun parachute.</div>}
        {parachutes.map((p) => <SheetRow key={p.id} p={p} sheet={sheets[p.id]} onChange={reload} />)}
      </div>
    </div>
  );
}
