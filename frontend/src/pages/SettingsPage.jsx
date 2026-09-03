import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettings, updateSettings, subscribe } from "@/lib/storage";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { TYPE_PALETTE, TypeBubble } from "@/lib/typeColors";
import { toast } from "sonner";

const EditableList = ({ label, values, onChange, testIdPrefix, colors, onColorChange }) => {
  const [draft, setDraft] = useState("");
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-6 w-1 rounded bg-blue-600" />
        <h3 className="font-heading text-base font-extrabold uppercase tracking-wide text-slate-900">
          {label}
        </h3>
      </div>
      <div className="mb-3 space-y-1.5">
        {values.map((v, i) => (
          <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            {colors ? (
              <TypeBubble type={v} settings={{ parachuteTypeColors: colors }} testId={`${testIdPrefix}-bubble-${i}`} />
            ) : (
              <span className="text-sm font-medium text-slate-800">{v}</span>
            )}
            <div className="flex items-center gap-1.5">
              {colors && TYPE_PALETTE.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  title={c.label}
                  onClick={() => onColorChange({ ...colors, [v]: c.key })}
                  data-testid={`${testIdPrefix}-color-${i}-${c.key}`}
                  className={`h-5 w-5 rounded-full border-2 ${
                    (colors[v] || "blue") === c.key ? "border-slate-900 scale-110" : "border-white"
                  }`}
                  style={{ backgroundColor: c.bg, transitionProperty: "transform", transitionDuration: "120ms" }}
                />
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => onChange(values.filter((_, k) => k !== i))}
                data-testid={`${testIdPrefix}-del-${i}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ajouter une valeur…"
          className="h-10"
          data-testid={`${testIdPrefix}-input`}
        />
        <Button
          onClick={() => {
            const v = draft.trim();
            if (!v) return;
            onChange([...values, v]);
            setDraft("");
          }}
          className="h-10 bg-blue-600 hover:bg-blue-700"
          data-testid={`${testIdPrefix}-add`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const [s, setS] = useState(getSettings());
  useEffect(() => {
    return subscribe(() => setS(getSettings()));
  }, []);

  const save = () => {
    updateSettings(s);
    toast.success("Paramètres enregistrés");
  };

  return (
    <div>
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 text-slate-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <h1 className="font-heading mb-8 text-4xl font-extrabold tracking-tight text-slate-900">
          Spécifications & Paramètres
        </h1>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-heading mb-3 text-base font-extrabold uppercase tracking-wide text-slate-900">
              Validité pliage secours
            </h3>
            <Label>Durée par défaut (mois)</Label>
            <Input
              type="number"
              min={1}
              max={36}
              value={s.reservePackValidityMonths}
              onChange={(e) => setS({ ...s, reservePackValidityMonths: Number(e.target.value) })}
              className="mt-1 h-11 font-mono-tech text-lg"
              data-testid="settings-pack-months"
            />
            <p className="mt-2 text-xs text-slate-500">
              La date de validité d'un pliage est calculée automatiquement à partir de cette durée.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-heading mb-3 text-base font-extrabold uppercase tracking-wide text-slate-900">
              Seuil "péremption proche"
            </h3>
            <Label>Alerte (jours)</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={s.warningDays}
              onChange={(e) => setS({ ...s, warningDays: Number(e.target.value) })}
              className="mt-1 h-11 font-mono-tech text-lg"
              data-testid="settings-warning-days"
            />
            <p className="mt-2 text-xs text-slate-500">
              Les éléments arrivant à échéance dans moins de {s.warningDays} jours seront marqués
              🟠 PÉREMPTION PROCHE.
            </p>
          </div>

          <EditableList
            label="Types de parachutes"
            values={s.parachuteTypes}
            onChange={(v) => setS({ ...s, parachuteTypes: v })}
            colors={s.parachuteTypeColors || {}}
            onColorChange={(c) => setS({ ...s, parachuteTypeColors: c })}
            testIdPrefix="parachute-types"
          />
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            size="lg"
            className="h-12 bg-blue-600 px-6 text-base font-semibold hover:bg-blue-700"
            onClick={save}
            data-testid="save-settings"
          >
            <Save className="mr-2 h-5 w-5" /> Enregistrer les paramètres
          </Button>
        </div>
      </main>
    </div>
  );
}
