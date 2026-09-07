import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import DatePickerFR from "@/components/DatePickerFR";
import { StatusBadge, ParachuteStatusPill } from "@/components/StatusBadge";
import { deleteSheet } from "@/lib/sheets";
import {
  deleteParachute,
  getParachute,
  subscribe,
  addJump,
  setJumps,
  addConeChange,
  addReservePack,
  addReserveOpening,
  setReserveCounters,
  setReserveValidity,
  updateSection,
  updateParachute,
  addMaintenance,
  addReparation,
  setAadJumps,
  setStatus,
  getSettings,
} from "@/lib/storage";
import { fmtDate, fmtDateTime, validityStatus, isParachuteInvalid, packValidationDate } from "@/lib/validity";
import {
  ArrowLeft,
  Package,
  Wind,
  Shield,
  Cpu,
  Plus,
  Pencil,
  RefreshCcw,
  Wrench,
  Printer,
  History,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { TypeBubble } from "@/lib/typeColors";

const InfoLine = ({ label, value, mono, testId }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
    <div className="text-sm font-medium text-slate-500">{label}</div>
    <div
      data-testid={testId}
      className={`text-right text-sm font-semibold text-slate-900 ${mono ? "font-mono-tech" : ""}`}
    >
      {value || "—"}
    </div>
  </div>
);

const SectionEditor = ({ p, section, title, fields, testId, prepare = (x) => x }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => prepare(p[section] || {}));
  useEffect(() => setDraft(prepare(p[section] || {})), [p, section]);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));
  const save = () => {
    updateSection(p.id, section, draft, `Modification ${title}`);
    toast.success(`${title} mis à jour`);
    setEditing(false);
  };
  if (!editing) {
    return (
      <Button variant="outline" size="sm" onClick={() => setEditing(true)} data-testid={`${testId}-edit-btn`}>
        <Pencil className="mr-2 h-4 w-4" /> Modifier
      </Button>
    );
  }
  return (
    <div className="mt-4 space-y-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4" data-testid={`${testId}-edit-form`}>
      {fields.map((f) => (
        <div key={f.key}>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">{f.label}</Label>
          {f.type === "date" ? (
            <DatePickerFR value={draft[f.key] || ""} onChange={set(f.key)} testId={`${testId}-edit-${f.key}`} />
          ) : (
            <Input
              type={f.type || "text"}
              value={draft[f.key] ?? ""}
              onChange={(e) => set(f.key)(f.type === "number" ? Number(e.target.value) : e.target.value)}
              className={`mt-1 h-11 ${f.mono ? "font-mono-tech" : ""}`}
              data-testid={`${testId}-edit-${f.key}`}
            />
          )}
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" onClick={() => { setDraft(prepare(p[section] || {})); setEditing(false); }}>Annuler</Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={save} data-testid={`${testId}-edit-save`}>Enregistrer</Button>
      </div>
    </div>
  );
};

const SubCard = ({ title, icon: Icon, onClick, children, testId, badge }) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    className="group flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-500 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    style={{ transitionProperty: "border-color, box-shadow", transitionDuration: "180ms" }}
  >
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>
        <div className="font-heading text-base font-extrabold uppercase tracking-wide text-slate-900">
          {title}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
    </div>
    <div className="flex-1 space-y-1">{children}</div>
    {badge && <div className="mt-3">{badge}</div>}
  </button>
);

export default function ParachuteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [settings, setSettings] = useState(getSettings());
  const [sheet, setSheet] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [obs, setObs] = useState("");

  useEffect(() => {
    const reload = () => {
      const cur = getParachute(id);
      setP(cur);
      setObs(cur?.observations || "");
      setSettings(getSettings());
    };
    reload();
    return subscribe(reload);
  }, [id]);

  if (!p) {
    return (
      <div>
        <AppHeader />
        <main className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-slate-600">Parachute introuvable.</p>
          <Button onClick={() => navigate("/")} className="mt-4 bg-blue-600 hover:bg-blue-700">
            Retour à l'accueil
          </Button>
        </main>
      </div>
    );
  }

  const invalid = isParachuteInvalid(p);
  const overall = invalid ? "invalide" : "valide";
  const vsStatus = validityStatus(p.voileSecours?.validityDate, settings.warningDays);
  const aadStatus = validityStatus(p.appareilSecurite?.expiryDate, settings.warningDays);
  const validation = packValidationDate(p);

  const saveObs = () => {
    updateParachute(p.id, { observations: obs });
    toast.success("Observations mises à jour");
  };

  return (
    <div>
      <AppHeader onPrint={() => navigate(`/parachute/${id}/imprimer`)} />
      <main className="mx-auto max-w-[1300px] px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 text-slate-600"
          data-testid="back-button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>

        {/* Header */}
        <div className={`mb-8 flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-6 shadow-sm ${
          p.status === "EN RÉPARATION" ? "border-orange-300 bg-orange-100" : invalid ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"
        }`}>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <TypeBubble type={p.type} settings={settings} testId="detail-type" />
              <ParachuteStatusPill status={p.status} testId="detail-status" />
              <StatusBadge status={overall} testId="detail-overall" />
              {validation && (
                <span
                  data-testid="detail-validation-date"
                  className={`rounded-md border px-2.5 py-1 font-mono-tech text-xs font-bold ${
                    vsStatus === "perime"
                      ? "border-rose-300 bg-rose-100 text-rose-800"
                      : "border-emerald-300 bg-emerald-50 text-emerald-800"
                  }`}
                >
                  Validité : {fmtDate(validation)}
                </span>
              )}
            </div>
            <h1
              data-testid="detail-title"
              className="font-heading text-4xl font-extrabold tracking-tight text-slate-900"
            >
              {p.reference}
            </h1>
            <p className="mt-1 text-sm text-slate-500">Créé le {fmtDate(p.createdAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="h-11" onClick={() => setSheet("maintenance")} data-testid="maintenance-btn">
              <Wrench className="mr-2 h-4 w-4" /> Pliage
            </Button>
            <Button variant="outline" className="h-11" onClick={() => setSheet("reparation")} data-testid="reparation-btn">
              <Wrench className="mr-2 h-4 w-4" /> Réparation
            </Button>
            <Button variant="outline" className="h-11" onClick={() => setSheet("history")} data-testid="history-btn">
              <History className="mr-2 h-4 w-4" /> Historique
            </Button>
            <Button
              variant="outline"
              className="h-11"
              onClick={() => navigate(`/parachute/${id}/imprimer`)}
              data-testid="print-btn"
            >
              <Printer className="mr-2 h-4 w-4" /> Imprimer
            </Button>
            <Button
              variant="outline"
              className="h-11 border-rose-400 bg-rose-50 text-rose-700 hover:bg-rose-100"
              onClick={() => setDeleteOpen(true)}
              data-testid="delete-parachute-btn"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </Button>
          </div>
        </div>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent data-testid="delete-parachute-dialog">
            <DialogHeader>
              <DialogTitle>Supprimer l'ensemble {p.reference} ?</DialogTitle>
              <DialogDescription>
                Le harnais, la voile principale, la voile de secours, l'appareil de sécurité et tout l'historique seront définitivement supprimés. Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Annuler</Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => {
                  deleteParachute(p.id);
                  deleteSheet(p.id).catch(() => {});
                  toast.success(`Ensemble ${p.reference} supprimé`);
                  navigate("/");
                }}
                data-testid="confirm-delete-parachute"
              >
                Supprimer définitivement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status change buttons */}
        <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <span className="self-center px-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            Statut :
          </span>
          {["EN SERVICE", "EN PLIAGE", "EN RÉPARATION", "INDISPONIBLE"].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={p.status === s ? "default" : "outline"}
              className={p.status === s ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => {
                setStatus(id, s);
                toast.success(`Statut : ${s}`);
              }}
              data-testid={`set-status-${s.replace(/\s+/g, "-")}`}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* 4 sub-cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SubCard title="Harnais" icon={Package} onClick={() => setSheet("sac")} testId="card-sac">
            <InfoLine label="Nom" value={p.sac?.type} />
            <InfoLine label="N° série" value={p.sac?.serialNumber} mono />
            <InfoLine label="Fabrication" value={fmtDate(p.sac?.manufacturingDate)} mono />
          </SubCard>
          <SubCard title="Voile principale" icon={Wind} onClick={() => setSheet("vp")} testId="card-voile-principale">
            <InfoLine label="Nom" value={p.voilePrincipale?.type} />
            <InfoLine label="N° série" value={p.voilePrincipale?.serialNumber} mono />
            <InfoLine label="Total sauts" value={(p.voilePrincipale?.totalJumps || 0).toLocaleString("fr-FR")} mono />
            <InfoLine label="Cône" value={(p.voilePrincipale?.jumpsSinceCone || 0).toLocaleString("fr-FR")} mono />
          </SubCard>
          <SubCard
            title="Voile de secours"
            icon={Shield}
            onClick={() => setSheet("vs")}
            testId="card-voile-secours"
            badge={<StatusBadge status={invalid && p.status !== "EN RÉPARATION" ? "invalide" : vsStatus} testId="badge-vs" />}
          >
            <InfoLine label="Nom" value={p.voileSecours?.type} />
            <InfoLine label="N° série" value={p.voileSecours?.serialNumber} mono />
            <InfoLine label="Dernier pliage" value={fmtDate(p.voileSecours?.lastPackDate)} mono />
            <InfoLine label="Validité" value={fmtDate(p.voileSecours?.validityDate)} mono />
            <InfoLine label="Nombre de pliages" value={(p.voileSecours?.packCount || 0).toLocaleString("fr-FR")} mono testId="card-vs-packcount" />
            <InfoLine label="Nombre d'ouvertures" value={(p.voileSecours?.openingCount || 0).toLocaleString("fr-FR")} mono testId="card-vs-openings" />
          </SubCard>
          <SubCard
            title="Appareil de sécurité"
            icon={Cpu}
            onClick={() => setSheet("aad")}
            testId="card-appareil-securite"
            badge={<StatusBadge status={invalid && p.status !== "EN RÉPARATION" ? "invalide" : aadStatus} testId="badge-aad" />}
          >
            <InfoLine label="Nom / Modèle" value={`${p.appareilSecurite?.brand || ""} ${p.appareilSecurite?.model || ""}`.trim() || p.appareilSecurite?.type} />
            <InfoLine label="N° série" value={p.appareilSecurite?.serialNumber} mono />
            <InfoLine label="Validité / péremption" value={fmtDate(p.appareilSecurite?.expiryDate)} mono />
          </SubCard>
        </div>

        {/* Global observations */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-6 w-1 rounded bg-blue-600" />
            <h2 className="font-heading text-base font-extrabold uppercase tracking-wide text-slate-900">
              Observations
            </h2>
          </div>
          <Textarea
            rows={4}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Observations générales sur le matériel…"
            data-testid="parachute-observations"
          />
          <div className="mt-3 flex justify-end">
            <Button
              onClick={saveObs}
              className="h-11 bg-blue-600 hover:bg-blue-700"
              data-testid="save-parachute-observations"
            >
              Enregistrer les observations
            </Button>
          </div>
        </div>

        {/* Sheets */}
        <SacSheet open={sheet === "sac"} onClose={() => setSheet(null)} p={p} />
        <VoilePrincipaleSheet open={sheet === "vp"} onClose={() => setSheet(null)} p={p} />
        <VoileSecoursSheet open={sheet === "vs"} onClose={() => setSheet(null)} p={p} settings={settings} />
        <AadSheet open={sheet === "aad"} onClose={() => setSheet(null)} p={p} settings={settings} />
        <MaintenanceSheet open={sheet === "maintenance"} onClose={() => setSheet(null)} p={p} kind="maintenance" />
        <MaintenanceSheet open={sheet === "reparation"} onClose={() => setSheet(null)} p={p} kind="reparation" />
        <HistorySheet open={sheet === "history"} onClose={() => setSheet(null)} p={p} />
      </main>
    </div>
  );
}

/* -------------------- SAC SHEET -------------------- */
function SacSheet({ open, onClose, p }) {
  const [obs, setObs] = useState(p.sac?.observations || "");
  useEffect(() => setObs(p.sac?.observations || ""), [p]);
  const save = () => {
    updateSection(p.id, "sac", { observations: obs }, "Modification observations sac");
    toast.success("Sac mis à jour");
    onClose();
  };
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Harnais</SheetTitle>
          <SheetDescription>Fiche technique du harnais (sac)</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <InfoLine label="Nom" value={p.sac?.type} />
          <InfoLine label="N° série" value={p.sac?.serialNumber} mono />
          <InfoLine label="Date de fabrication" value={fmtDate(p.sac?.manufacturingDate)} mono />
        </div>
        <div className="mt-3">
          <SectionEditor
            p={p}
            section="sac"
            title="Harnais"
            testId="sac"
            fields={[
              { key: "type", label: "Nom du harnais" },
              { key: "serialNumber", label: "N° de série", mono: true },
              { key: "manufacturingDate", label: "Date de fabrication", type: "date" },
            ]}
          />
        </div>
        <div className="mt-6 space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Observations
          </Label>
          <Textarea rows={5} value={obs} onChange={(e) => setObs(e.target.value)} data-testid="sac-observations" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={save} data-testid="save-sac-obs">
            Enregistrer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------- VOILE PRINCIPALE SHEET -------------------- */
function VoilePrincipaleSheet({ open, onClose, p }) {
  const vp = p.voilePrincipale || {};
  const [dlg, setDlg] = useState(null);
  const [coneDate, setConeDate] = useState("");
  const [coneObs, setConeObs] = useState("");
  const [editTotal, setEditTotal] = useState(vp.totalJumps || 0);
  const [editCone, setEditCone] = useState(vp.jumpsSinceCone || 0);
  const [vpObs, setVpObs] = useState(vp.observations || "");

  useEffect(() => {
    setEditTotal(vp.totalJumps || 0);
    setEditCone(vp.jumpsSinceCone || 0);
    setVpObs(vp.observations || "");
  }, [vp.totalJumps, vp.jumpsSinceCone, vp.observations]);

  const saveVpObs = () => {
    updateSection(p.id, "voilePrincipale", { observations: vpObs }, "Modification observations voile principale");
    toast.success("Observations mises à jour");
  };

  const doAddJump = () => {
    addJump(p.id, 1);
    toast.success("Saut ajouté (+1 total, +1 cône actuel)");
  };
  const doEditJumps = () => {
    setJumps(p.id, editTotal, editCone);
    toast.success("Nombre de sauts mis à jour");
    setDlg(null);
  };
  const doConeChange = () => {
    if (!coneDate) {
      toast.error("Choisissez une date");
      return;
    }
    addConeChange(p.id, { date: coneDate, observation: coneObs });
    toast.success("Changement de cône enregistré — compteur cône remis à 0");
    setConeDate("");
    setConeObs("");
    setDlg(null);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Voile principale</SheetTitle>
          <SheetDescription>{vp.type}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <InfoLine label="Nom" value={vp.type} />
          <InfoLine label="N° série" value={vp.serialNumber} mono />
          <InfoLine label="Date de fabrication" value={fmtDate(vp.manufacturingDate)} mono />
        </div>
        <div className="mt-3">
          <SectionEditor
            p={p}
            section="voilePrincipale"
            title="Voile principale"
            testId="vp"
            fields={[
              { key: "type", label: "Nom de la voile" },
              { key: "serialNumber", label: "N° de série", mono: true },
              { key: "manufacturingDate", label: "Date de fabrication", type: "date" },
            ]}
          />
        </div>

        {/* Jumps */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700">
              Nombre total de sauts
            </div>
            <div data-testid="vp-total-jumps" className="font-mono-tech text-4xl font-extrabold text-blue-900">
              {(vp.totalJumps || 0).toLocaleString("fr-FR")}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Cône actuel
            </div>
            <div data-testid="vp-cone-jumps" className="font-mono-tech text-4xl font-extrabold text-slate-900">
              {(vp.jumpsSinceCone || 0).toLocaleString("fr-FR")}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="h-11 bg-blue-600 hover:bg-blue-700" onClick={doAddJump} data-testid="btn-add-jump">
            <Plus className="mr-2 h-5 w-5" /> Ajouter un saut
          </Button>
          <Button variant="outline" className="h-11" onClick={() => setDlg("edit-jumps")} data-testid="btn-edit-jumps">
            <Pencil className="mr-2 h-4 w-4" /> Modifier le nombre de sauts
          </Button>
        </div>

        {/* Cone section */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-lg font-extrabold uppercase tracking-wide text-slate-900">
              Cône de suspension
            </h3>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setDlg("cone")} data-testid="btn-cone-change">
              <RefreshCcw className="mr-2 h-4 w-4" /> Nouveau changement
            </Button>
          </div>
          <InfoLine label="Cône actuel" value={(vp.jumpsSinceCone || 0).toLocaleString("fr-FR")} mono />
          <InfoLine label="Date du dernier changement" value={fmtDate(vp.lastConeChangeDate)} mono />

          <div className="mt-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
              Historique des changements
            </div>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {(vp.coneHistory || []).length === 0 && (
                <div className="p-3 text-sm text-slate-500">Aucun changement enregistré.</div>
              )}
              {(vp.coneHistory || []).map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-3 p-3">
                  <div>
                    <div className="font-mono-tech text-sm font-semibold text-slate-900">
                      {fmtDate(h.date)}
                    </div>
                    <div className="text-xs text-slate-500">{h.observation || "—"}</div>
                  </div>
                  <div className="font-mono-tech text-sm font-bold text-blue-700">
                    {h.jumpsAtChange} sauts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VP observations */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Observations</Label>
          <Textarea
            rows={3}
            value={vpObs}
            onChange={(e) => setVpObs(e.target.value)}
            className="mt-2"
            data-testid="vp-observations"
          />
          <div className="mt-2 flex justify-end">
            <Button
              onClick={saveVpObs}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="save-vp-observations"
            >
              Enregistrer les observations
            </Button>
          </div>
        </div>

        {/* Edit jumps dialog */}
        <Dialog open={dlg === "edit-jumps"} onOpenChange={(o) => !o && setDlg(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le nombre de sauts</DialogTitle>
              <DialogDescription>
                Utile pour enregistrer une voile déjà utilisée. Aucun nom de personne n'est demandé.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nombre total de sauts</Label>
                <Input
                  type="number"
                  min={0}
                  value={editTotal}
                  onChange={(e) => setEditTotal(Number(e.target.value))}
                  data-testid="edit-total-input"
                />
              </div>
              <div>
                <Label>Cône actuel</Label>
                <Input
                  type="number"
                  min={0}
                  value={editCone}
                  onChange={(e) => setEditCone(Number(e.target.value))}
                  data-testid="edit-cone-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDlg(null)}>Annuler</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={doEditJumps} data-testid="save-edit-jumps">
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cone change dialog */}
        <Dialog open={dlg === "cone"} onOpenChange={(o) => !o && setDlg(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau changement de cône</DialogTitle>
              <DialogDescription>
                Le compteur &quot;cône actuel&quot; sera remis à 0. Le nombre
                total de sauts de la voile reste inchangé.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Date du changement</Label>
                <DatePickerFR value={coneDate} onChange={setConeDate} testId="cone-date-picker" />
              </div>
              <div>
                <Label>Observation</Label>
                <Textarea value={coneObs} onChange={(e) => setConeObs(e.target.value)} rows={3} data-testid="cone-obs" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDlg(null)}>Annuler</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={doConeChange} data-testid="save-cone-change">
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------- VOILE SECOURS SHEET -------------------- */
function VoileSecoursSheet({ open, onClose, p, settings }) {
  const vs = p.voileSecours || {};
  const [dlg, setDlg] = useState(false);
  const [packDate, setPackDate] = useState("");
  const [packObs, setPackObs] = useState("");
  const [vsObs, setVsObs] = useState(vs.observations || "");
  const [editCounters, setEditCounters] = useState(false);
  const [packCount, setPackCount] = useState(vs.packCount || 0);
  const [openCount, setOpenCount] = useState(vs.openingCount || 0);
  const status = validityStatus(vs.validityDate, settings.warningDays);

  useEffect(() => setVsObs(vs.observations || ""), [vs.observations]);
  useEffect(() => {
    setPackCount(vs.packCount || 0);
    setOpenCount(vs.openingCount || 0);
  }, [vs.packCount, vs.openingCount]);

  const saveCounters = () => {
    setReserveCounters(p.id, packCount, openCount);
    toast.success("Compteurs mis à jour");
    setEditCounters(false);
  };

  const saveVsObs = () => {
    updateSection(p.id, "voileSecours", { observations: vsObs }, "Modification observations voile de secours");
    toast.success("Observations mises à jour");
  };

  const doPack = () => {
    if (!packDate) { toast.error("Choisissez une date"); return; }
    addReservePack(p.id, { packDate, observation: packObs });
    toast.success("Nouveau pliage enregistré");
    setPackDate("");
    setPackObs("");
    setDlg(false);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Voile de secours</SheetTitle>
          <SheetDescription>Pliage et validité</SheetDescription>
        </SheetHeader>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-500">Statut de validité</div>
            <StatusBadge status={status} testId="vs-sheet-status" />
          </div>
          <InfoLine label="Nom" value={vs.type} />
          <InfoLine label="N° série" value={vs.serialNumber} mono />
          <InfoLine label="Date de fabrication" value={fmtDate(vs.manufacturingDate)} mono />
          <InfoLine label="Dernier pliage" value={fmtDate(vs.lastPackDate)} mono />
          <InfoLine label="Validité du pliage" value={fmtDate(vs.validityDate)} mono />
        </div>
        <div className="mt-3">
          <SectionEditor
            p={p}
            section="voileSecours"
            title="Voile de secours"
            testId="vs"
            fields={[
              { key: "type", label: "Nom de la voile de secours" },
              { key: "serialNumber", label: "N° de série", mono: true },
              { key: "manufacturingDate", label: "Date de fabrication", type: "date" },
              { key: "lastPackDate", label: "Date dernier pliage", type: "date" },
              { key: "validityDate", label: "Date de validité du pliage", type: "date" },
            ]}
          />
        </div>

        {/* Counters */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Nombre de pliages</div>
            {editCounters ? (
              <Input type="number" min={0} value={packCount} onChange={(e) => setPackCount(Number(e.target.value))} className="mt-2 h-11 font-mono-tech text-lg" data-testid="vs-packcount-input" />
            ) : (
              <div data-testid="vs-packcount" className="font-mono-tech text-4xl font-extrabold text-blue-900">
                {(vs.packCount || 0).toLocaleString("fr-FR")}
              </div>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Nombre d'ouvertures</div>
            {editCounters ? (
              <Input type="number" min={0} value={openCount} onChange={(e) => setOpenCount(Number(e.target.value))} className="mt-2 h-11 font-mono-tech text-lg" data-testid="vs-openings-input" />
            ) : (
              <div data-testid="vs-openings" className="font-mono-tech text-4xl font-extrabold text-slate-900">
                {(vs.openingCount || 0).toLocaleString("fr-FR")}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {editCounters ? (
            <>
              <Button className="h-11 bg-blue-600 hover:bg-blue-700" onClick={saveCounters} data-testid="save-vs-counters">Enregistrer</Button>
              <Button variant="outline" className="h-11" onClick={() => setEditCounters(false)}>Annuler</Button>
            </>
          ) : (
            <>
              <Button className="h-11 bg-blue-600 hover:bg-blue-700" onClick={() => setDlg(true)} data-testid="btn-new-pack">
                <Plus className="mr-2 h-5 w-5" /> Nouveau pliage
              </Button>
              <Button variant="outline" className="h-11" onClick={() => { addReserveOpening(p.id); toast.success("Ouverture ajoutée (+1)"); }} data-testid="btn-add-opening">
                <Plus className="mr-2 h-4 w-4" /> Ajouter une ouverture
              </Button>
              <Button variant="outline" className="h-11" onClick={() => setEditCounters(true)} data-testid="btn-edit-vs-counters">
                <Pencil className="mr-2 h-4 w-4" /> Modifier les compteurs
              </Button>
            </>
          )}
        </div>

        <div className="mt-6">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            Historique des pliages
          </div>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {(vs.packHistory || []).length === 0 && (
              <div className="p-3 text-sm text-slate-500">Aucun pliage enregistré.</div>
            )}
            {(vs.packHistory || []).map((h) => (
              <div key={h.id} className="flex flex-col gap-1 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono-tech text-sm font-semibold text-slate-900">
                    Pliage : {fmtDate(h.packDate)}
                  </div>
                  <div className="font-mono-tech text-xs font-bold text-blue-700">
                    Validité : {fmtDate(h.validityDate)}
                  </div>
                </div>
                {h.observation && <div className="text-xs text-slate-500">{h.observation}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* VS observations */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Observations</Label>
          <Textarea
            rows={3}
            value={vsObs}
            onChange={(e) => setVsObs(e.target.value)}
            className="mt-2"
            data-testid="vs-observations"
          />
          <div className="mt-2 flex justify-end">
            <Button
              onClick={saveVsObs}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="save-vs-observations"
            >
              Enregistrer les observations
            </Button>
          </div>
        </div>

        <Dialog open={dlg} onOpenChange={setDlg}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau pliage du secours</DialogTitle>
              <DialogDescription>
                La date de validité est calculée automatiquement selon les paramètres
                ({settings.reservePackValidityMonths} mois).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Date du pliage</Label>
                <DatePickerFR value={packDate} onChange={setPackDate} testId="pack-date-picker" />
              </div>
              <div>
                <Label>Observation</Label>
                <Textarea value={packObs} onChange={(e) => setPackObs(e.target.value)} rows={3} data-testid="pack-obs" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDlg(false)}>Annuler</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={doPack} data-testid="save-pack">
                Enregistrer le pliage
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------- AAD SHEET -------------------- */
function AadSheet({ open, onClose, p, settings }) {
  const a = p.appareilSecurite || {};
  const [obs, setObs] = useState(a.observations || "");
  const [editing, setEditing] = useState(false);
  const [jumps, setJumpsVal] = useState(a.totalJumps || 0);
  useEffect(() => {
    setObs(a.observations || "");
    setJumpsVal(a.totalJumps || 0);
  }, [p]);
  const status = validityStatus(a.expiryDate, settings.warningDays);
  const save = () => {
    updateSection(p.id, "appareilSecurite", { observations: obs }, "Modification observations appareil de sécurité");
    toast.success("Appareil de sécurité mis à jour");
    onClose();
  };
  const saveJumps = () => {
    setAadJumps(p.id, jumps);
    toast.success("Nombre de sauts de l'appareil mis à jour");
    setEditing(false);
  };
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Appareil de sécurité</SheetTitle>
          <SheetDescription>{`${a.brand || ""} ${a.model || ""}`.trim() || a.type}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-500">Statut</div>
            <StatusBadge status={status} testId="aad-sheet-status" />
          </div>
          <InfoLine label="Nom / Modèle" value={`${a.brand || ""} ${a.model || ""}`.trim() || a.type} testId="aad-sheet-model" />
          <InfoLine label="N° série" value={a.serialNumber} mono testId="aad-sheet-sn" />
          <InfoLine label="Date de fabrication" value={fmtDate(a.manufacturingDate)} mono />
          <InfoLine label="Validité / péremption" value={fmtDate(a.expiryDate)} mono />
        </div>
        <div className="mt-3">
          <SectionEditor
            p={p}
            section="appareilSecurite"
            title="Appareil de sécurité"
            testId="aad"
            prepare={(x) => ({ ...x, model: `${x.brand || ""} ${x.model || ""}`.trim() || x.type || "", brand: "", type: "" })}
            fields={[
              { key: "model", label: "Nom / Modèle" },
              { key: "serialNumber", label: "N° de série", mono: true },
              { key: "manufacturingDate", label: "Date de fabrication", type: "date" },
              { key: "expiryDate", label: "Validité / péremption", type: "date" },
            ]}
          />
        </div>

        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Nombre de sauts</div>
          {editing ? (
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={jumps}
                onChange={(e) => setJumpsVal(Number(e.target.value))}
                className="h-11 max-w-[180px] font-mono-tech text-lg"
                data-testid="aad-jumps-input"
              />
              <Button className="h-11 bg-blue-600 hover:bg-blue-700" onClick={saveJumps} data-testid="save-aad-jumps">
                Enregistrer
              </Button>
              <Button variant="outline" className="h-11" onClick={() => { setEditing(false); setJumpsVal(a.totalJumps || 0); }}>
                Annuler
              </Button>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between gap-3">
              <div data-testid="aad-total-jumps" className="font-mono-tech text-4xl font-extrabold text-blue-900">
                {(a.totalJumps || 0).toLocaleString("fr-FR")}
              </div>
              <Button variant="outline" onClick={() => setEditing(true)} data-testid="btn-edit-aad-jumps">
                <Pencil className="mr-2 h-4 w-4" /> Modifier
              </Button>
            </div>
          )}
        </div>
        <div className="mt-6 space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Observations</Label>
          <Textarea rows={4} value={obs} onChange={(e) => setObs(e.target.value)} data-testid="aad-observations" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={save} data-testid="save-aad">
            Enregistrer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------- MAINTENANCE / REPARATION SHEET -------------------- */
function MaintenanceSheet({ open, onClose, p, kind }) {
  const isM = kind === "maintenance";
  const entries = isM ? p.maintenance || [] : p.reparation || [];
  const [date, setDate] = useState("");
  const [motif, setMotif] = useState("");
  const [obs, setObs] = useState("");
  const [adjust, setAdjust] = useState(false);
  const [adjustDate, setAdjustDate] = useState("");

  const doAdd = () => {
    if (!date || (!isM && !motif.trim())) { toast.error(isM ? "Date requise" : "Date et motif requis"); return; }
    const entry = { date, motif, observation: obs };
    if (isM) addMaintenance(p.id, entry);
    else addReparation(p.id, entry);
    toast.success(isM ? "Pliage enregistré — validité +1 an" : "Réparation enregistrée");
    setDate(""); setMotif(""); setObs("");
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">{isM ? "Pliage" : "Réparation"}</SheetTitle>
          <SheetDescription>
            {isM ? "Enregistrer un nouveau pliage : la validité est prolongée automatiquement d'un an" : "Enregistrer une opération de réparation"}
          </SheetDescription>
        </SheetHeader>

        {isM && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Dernier pliage</div>
              <div className="font-mono-tech text-lg font-bold text-slate-900" data-testid="pliage-last">{fmtDate(p.voileSecours?.lastPackDate)}</div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Valide jusqu'au</div>
              <div className="font-mono-tech text-lg font-bold text-blue-900" data-testid="pliage-validity">{fmtDate(p.voileSecours?.validityDate)}</div>
              <button
                type="button"
                className="mt-1 text-xs font-semibold text-blue-700 underline-offset-2 hover:underline"
                onClick={() => { setAdjustDate(p.voileSecours?.validityDate || ""); setAdjust((v) => !v); }}
                data-testid="pliage-adjust-toggle"
              >
                Ajuster la date de validité
              </button>
            </div>
          </div>
        )}

        {isM && adjust && (
          <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3" data-testid="pliage-adjust-form">
            <div className="flex-1 min-w-[200px]">
              <Label>Nouvelle date de validité</Label>
              <DatePickerFR value={adjustDate} onChange={setAdjustDate} testId="pliage-adjust-date" />
            </div>
            <Button
              className="h-11 bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                if (!adjustDate) return toast.error("Date requise");
                setReserveValidity(p.id, adjustDate);
                toast.success("Validité ajustée");
                setAdjust(false);
              }}
              data-testid="pliage-adjust-save"
            >
              Enregistrer
            </Button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div>
            <Label>{isM ? "Date du pliage" : "Date"}</Label>
            <DatePickerFR value={date} onChange={setDate} testId={`${kind}-date`} />
          </div>
          <div>
            <Label>{isM ? "Motif (facultatif)" : "Motif"}</Label>
            <Input value={motif} onChange={(e) => setMotif(e.target.value)} data-testid={`${kind}-motif`} />
          </div>
          <div>
            <Label>Observation</Label>
            <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={3} data-testid={`${kind}-obs`} />
          </div>
          <Button className="mt-2 bg-blue-600 hover:bg-blue-700" onClick={doAdd} data-testid={`${kind}-save`}>
            Enregistrer
          </Button>
        </div>

        <div className="mt-6">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            Historique
          </div>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {entries.length === 0 && <div className="p-3 text-sm text-slate-500">Aucune opération.</div>}
            {entries.map((e) => (
              <div key={e.id} className="flex flex-col gap-1 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono-tech text-sm font-semibold text-slate-900">
                    {fmtDate(e.date)}
                  </div>
                  {e.validityDate && (
                    <div className="font-mono-tech text-xs text-blue-700">Valide jusqu'au {fmtDate(e.validityDate)}</div>
                  )}
                </div>
                {e.motif && <div className="text-sm font-semibold text-slate-800">{e.motif}</div>}
                {e.observation && <div className="text-xs text-slate-500">{e.observation}</div>}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------- HISTORY SHEET -------------------- */
function HistorySheet({ open, onClose, p }) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Historique technique</SheetTitle>
          <SheetDescription>Opérations enregistrées sur le matériel</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {(p.history || []).length === 0 && <p className="text-sm text-slate-500">Aucune entrée.</p>}
          {(p.history || []).map((h) => (
            <div key={h.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="font-mono-tech text-xs font-semibold text-blue-700">
                {fmtDateTime(h.date)}
              </div>
              <div className="text-sm font-medium text-slate-900">{h.label}</div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
