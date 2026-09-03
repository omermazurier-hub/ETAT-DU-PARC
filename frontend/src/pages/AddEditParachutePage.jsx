import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DatePickerFR from "@/components/DatePickerFR";
import { createParachute, updateParachute, getParachute } from "@/lib/storage";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const emptyForm = () => ({
  type: "BOI",
  reference: "",
  observations: "",
  sac: { type: "", serialNumber: "", manufacturingDate: "" },
  voilePrincipale: {
    type: "",
    serialNumber: "",
    manufacturingDate: "",
    totalJumps: 0,
    jumpsSinceCone: 0,
    lastConeChangeDate: "",
  },
  voileSecours: {
    type: "",
    serialNumber: "",
    manufacturingDate: "",
    lastPackDate: "",
    validityDate: "",
  },
  appareilSecurite: {
    type: "",
    brand: "",
    model: "",
    serialNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    totalJumps: 0,
  },
});

const Field = ({ label, children, className }) => (
  <div className={`space-y-1.5 ${className || ""}`}>
    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">{label}</Label>
    {children}
  </div>
);

const SectionCard = ({ title, children, accent }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-center gap-3">
      <div className={`h-8 w-1.5 rounded ${accent || "bg-blue-600"}`} />
      <h2 className="font-heading text-lg font-extrabold uppercase tracking-wide text-slate-900">
        {title}
      </h2>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
  </section>
);

export default function AddEditParachutePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (isEdit) {
      const p = getParachute(id);
      if (p) {
        setForm({
          type: p.type,
          reference: p.reference,
          observations: p.observations || "",
          sac: { ...p.sac },
          voilePrincipale: { ...p.voilePrincipale },
          voileSecours: { ...p.voileSecours },
          appareilSecurite: {
            ...p.appareilSecurite,
            model: `${p.appareilSecurite?.brand || ""} ${p.appareilSecurite?.model || ""}`.trim() || p.appareilSecurite?.type || "",
            brand: "",
            type: "",
          },
        });
      }
    }
  }, [id, isEdit]);

  const upd = (section, key) => (val) =>
    setForm((f) => ({ ...f, [section]: { ...f[section], [key]: val } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.reference.trim()) {
      toast.error("La référence / désignation est requise");
      return;
    }
    if (isEdit) {
      updateParachute(id, form);
      toast.success("Parachute mis à jour");
      navigate(`/parachute/${id}`);
    } else {
      const p = createParachute(form);
      toast.success("Parachute ajouté");
      navigate(`/parachute/${p.id}`);
    }
  };

  return (
    <div>
      <AppHeader onPrint={() => window.print()} />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 text-slate-600"
          data-testid="back-button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <h1 className="font-heading mb-8 text-4xl font-extrabold tracking-tight text-slate-900">
          {isEdit ? "Modifier le parachute" : "Nouveau parachute"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <SectionCard title="Parachute" accent="bg-blue-600">
            <Field label="Type">
              <Input
                data-testid="form-parachute-type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="h-11"
                placeholder="Ex : BOI, TANDEM…"
              />
            </Field>
            <Field label="Référence / Désignation" className="md:col-span-2">
              <Input
                data-testid="form-reference"
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                className="h-11"
                placeholder="Ex : BOI-001 Mirage G4"
              />
            </Field>
          </SectionCard>

          <SectionCard title="Harnais" accent="bg-blue-500">
            <Field label="Nom du harnais">
              <Input
                data-testid="form-sac-type"
                value={form.sac.type}
                onChange={(e) => upd("sac", "type")(e.target.value)}
                className="h-11"
                placeholder="Ex : Mirage G4, Vector 3…"
              />
            </Field>
            <Field label="N° de série">
              <Input
                data-testid="form-sac-sn"
                value={form.sac.serialNumber}
                onChange={(e) => upd("sac", "serialNumber")(e.target.value)}
                className="h-11 font-mono-tech"
              />
            </Field>
            <Field label="Date de fabrication">
              <DatePickerFR
                testId="form-sac-date"
                value={form.sac.manufacturingDate}
                onChange={upd("sac", "manufacturingDate")}
              />
            </Field>
          </SectionCard>

          <SectionCard title="Voile principale" accent="bg-blue-500">
            <Field label="Nom de la voile">
              <Input
                data-testid="form-vp-type"
                value={form.voilePrincipale.type}
                onChange={(e) => upd("voilePrincipale", "type")(e.target.value)}
                className="h-11"
                placeholder="Ex : Standard, Haute performance…"
              />
            </Field>
            <Field label="N° de série">
              <Input
                data-testid="form-vp-sn"
                value={form.voilePrincipale.serialNumber}
                onChange={(e) => upd("voilePrincipale", "serialNumber")(e.target.value)}
                className="h-11 font-mono-tech"
              />
            </Field>
            <Field label="Date de fabrication">
              <DatePickerFR
                testId="form-vp-date"
                value={form.voilePrincipale.manufacturingDate}
                onChange={upd("voilePrincipale", "manufacturingDate")}
              />
            </Field>
            <Field label="Nombre total de sauts">
              <Input
                data-testid="form-vp-total"
                type="number"
                min={0}
                value={form.voilePrincipale.totalJumps}
                onChange={(e) => upd("voilePrincipale", "totalJumps")(Number(e.target.value))}
                className="h-11 font-mono-tech"
              />
            </Field>
            <Field label="Sauts depuis dernier changement de cône">
              <Input
                data-testid="form-vp-cone"
                type="number"
                min={0}
                value={form.voilePrincipale.jumpsSinceCone}
                onChange={(e) => upd("voilePrincipale", "jumpsSinceCone")(Number(e.target.value))}
                className="h-11 font-mono-tech"
              />
            </Field>
            <Field label="Date dernier changement de cône">
              <DatePickerFR
                testId="form-vp-cone-date"
                value={form.voilePrincipale.lastConeChangeDate}
                onChange={upd("voilePrincipale", "lastConeChangeDate")}
              />
            </Field>
          </SectionCard>

          <SectionCard title="Voile de secours" accent="bg-blue-500">
            <Field label="Nom de la voile de secours">
              <Input
                data-testid="form-vs-type"
                value={form.voileSecours.type}
                onChange={(e) => upd("voileSecours", "type")(e.target.value)}
                className="h-11"
                placeholder="Ex : Rond, Aile, Tandem secours…"
              />
            </Field>
            <Field label="N° de série">
              <Input
                data-testid="form-vs-sn"
                value={form.voileSecours.serialNumber}
                onChange={(e) => upd("voileSecours", "serialNumber")(e.target.value)}
                className="h-11 font-mono-tech"
              />
            </Field>
            <Field label="Date de fabrication">
              <DatePickerFR
                testId="form-vs-date"
                value={form.voileSecours.manufacturingDate}
                onChange={upd("voileSecours", "manufacturingDate")}
              />
            </Field>
            <Field label="Date dernier pliage">
              <DatePickerFR
                testId="form-vs-pack"
                value={form.voileSecours.lastPackDate}
                onChange={upd("voileSecours", "lastPackDate")}
              />
            </Field>
            <Field label="Date de validité du pliage">
              <DatePickerFR
                testId="form-vs-validity"
                value={form.voileSecours.validityDate}
                onChange={upd("voileSecours", "validityDate")}
              />
            </Field>
          </SectionCard>

          <SectionCard title="Appareil de sécurité" accent="bg-blue-500">
            <Field label="Nom / Modèle">
              <Input
                data-testid="form-aad-model"
                value={form.appareilSecurite.model}
                onChange={(e) => upd("appareilSecurite", "model")(e.target.value)}
                className="h-11"
                placeholder="Ex : Cypres 2 Expert, Vigil Cuattro…"
              />
            </Field>
            <Field label="N° de série">
              <Input
                data-testid="form-aad-sn"
                value={form.appareilSecurite.serialNumber}
                onChange={(e) => upd("appareilSecurite", "serialNumber")(e.target.value)}
                className="h-11 font-mono-tech"
              />
            </Field>
            <Field label="Date de fabrication">
              <DatePickerFR
                testId="form-aad-df"
                value={form.appareilSecurite.manufacturingDate}
                onChange={upd("appareilSecurite", "manufacturingDate")}
              />
            </Field>
            <Field label="Date de péremption">
              <DatePickerFR
                testId="form-aad-exp"
                value={form.appareilSecurite.expiryDate}
                onChange={upd("appareilSecurite", "expiryDate")}
              />
            </Field>
            <Field label="Nombre de sauts">
              <Input
                type="number"
                min={0}
                data-testid="form-aad-jumps"
                value={form.appareilSecurite.totalJumps ?? 0}
                onChange={(e) => upd("appareilSecurite", "totalJumps")(Number(e.target.value))}
              />
            </Field>
          </SectionCard>

          <SectionCard title="Observations" accent="bg-blue-400">
            <div className="md:col-span-3">
              <Textarea
                data-testid="form-observations"
                value={form.observations}
                onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))}
                rows={4}
                placeholder="Observations générales sur le parachute…"
              />
            </div>
          </SectionCard>

          <div className="flex items-center justify-end gap-3 pb-10">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12"
              onClick={() => navigate(-1)}
              data-testid="cancel-button"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="lg"
              className="h-12 bg-blue-600 px-6 text-base font-semibold hover:bg-blue-700"
              data-testid="submit-button"
            >
              <Save className="mr-2 h-5 w-5" />
              {isEdit ? "Enregistrer les modifications" : "Créer le parachute"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
