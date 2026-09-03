import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getParachute, listParachutes, getSettings } from "@/lib/storage";
import { fmtDate, validityStatus, overallValidity, STATUS_META } from "@/lib/validity";
import { Printer, ArrowLeft } from "lucide-react";

const Row = ({ label, value, mono }) => (
  <tr>
    <td className="border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
      {label}
    </td>
    <td className={`border border-slate-300 px-3 py-1.5 text-sm text-slate-900 ${mono ? "font-mono-tech" : ""}`}>
      {value || "—"}
    </td>
  </tr>
);

const StatusText = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.unknown;
  return <span className="font-bold uppercase">{m.label}</span>;
};

export default function PrintPage() {
  const { id, filter } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [list, setList] = useState([]);
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    setSettings(getSettings());
    if (id) setP(getParachute(id));
    if (filter) {
      const arr = listParachutes({ includeArchived: filter === "archives" });
      let filtered = arr;
      if (filter === "EN SERVICE" || filter === "EN PLIAGE" || filter === "EN RÉPARATION") {
        filtered = arr.filter((x) => x.status === filter);
      } else if (filter === "proche" || filter === "perime") {
        filtered = arr.filter((x) => overallValidity(x, getSettings().warningDays) === filter);
      }
      setList(filtered);
    }
  }, [id, filter]);

  useEffect(() => {
    // slight delay so components render before print dialog opens
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [p, list]);

  const filterLabel = {
    all: "Tous les parachutes",
    "EN SERVICE": "En service",
    "EN PLIAGE": "En pliage",
    "EN RÉPARATION": "En réparation",
    proche: "Prochaines péremptions",
    perime: "Expirés",
  }[filter] || "Liste des parachutes";

  return (
    <div className="min-h-screen bg-white">
      <div className="no-print sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white p-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Imprimer / PDF
        </Button>
      </div>

      <div className="print-container mx-auto max-w-[210mm] bg-white p-8 shadow-md">
        <div className="mb-6 border-b-2 border-blue-600 pb-3">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-600">ParaTech</div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">
            {p ? `Fiche parachute — ${p.reference}` : filterLabel}
          </h1>
          <div className="text-xs text-slate-500">Éditée le {new Date().toLocaleString("fr-FR")}</div>
        </div>

        {p && (
          <div className="space-y-6">
            <section>
              <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-black uppercase tracking-widest text-blue-700">
                Identification
              </h2>
              <table className="w-full border-collapse">
                <tbody>
                  <Row label="Type" value={p.type} />
                  <Row label="Référence" value={p.reference} />
                  <Row label="Statut" value={p.status} />
                  <Row label="Créé le" value={fmtDate(p.createdAt)} mono />
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-black uppercase tracking-widest text-blue-700">
                Harnais
              </h2>
              <table className="w-full border-collapse">
                <tbody>
                  <Row label="Type" value={p.sac?.type} />
                  <Row label="N° série" value={p.sac?.serialNumber} mono />
                  <Row label="Date fabrication" value={fmtDate(p.sac?.manufacturingDate)} mono />
                  <Row label="Observations" value={p.sac?.observations} />
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-black uppercase tracking-widest text-blue-700">
                Voile principale
              </h2>
              <table className="w-full border-collapse">
                <tbody>
                  <Row label="Type" value={p.voilePrincipale?.type} />
                  <Row label="N° série" value={p.voilePrincipale?.serialNumber} mono />
                  <Row label="Date fabrication" value={fmtDate(p.voilePrincipale?.manufacturingDate)} mono />
                  <Row label="Nombre total de sauts" value={(p.voilePrincipale?.totalJumps || 0).toLocaleString("fr-FR")} mono />
                  <Row label="Cône actuel" value={(p.voilePrincipale?.jumpsSinceCone || 0).toLocaleString("fr-FR")} mono />
                  <Row label="Dernier changement de cône" value={fmtDate(p.voilePrincipale?.lastConeChangeDate)} mono />
                </tbody>
              </table>
              {(p.voilePrincipale?.coneHistory || []).length > 0 && (
                <div className="mt-3">
                  <div className="mb-1 text-xs font-bold uppercase text-slate-600">Historique des changements de cône</div>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Date</th>
                        <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Sauts au changement</th>
                        <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Observation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.voilePrincipale.coneHistory.map((h) => (
                        <tr key={h.id}>
                          <td className="border border-slate-300 px-2 py-1 font-mono-tech">{fmtDate(h.date)}</td>
                          <td className="border border-slate-300 px-2 py-1 font-mono-tech">{h.jumpsAtChange}</td>
                          <td className="border border-slate-300 px-2 py-1">{h.observation || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-black uppercase tracking-widest text-blue-700">
                Voile de secours
              </h2>
              <table className="w-full border-collapse">
                <tbody>
                  <Row label="Type" value={p.voileSecours?.type} />
                  <Row label="N° série" value={p.voileSecours?.serialNumber} mono />
                  <Row label="Date fabrication" value={fmtDate(p.voileSecours?.manufacturingDate)} mono />
                  <Row label="Dernier pliage" value={fmtDate(p.voileSecours?.lastPackDate)} mono />
                  <Row label="Validité" value={fmtDate(p.voileSecours?.validityDate)} mono />
                  <Row
                    label="Statut"
                    value={<StatusText status={validityStatus(p.voileSecours?.validityDate, settings.warningDays)} />}
                  />
                </tbody>
              </table>
              {(p.voileSecours?.packHistory || []).length > 0 && (
                <div className="mt-3">
                  <div className="mb-1 text-xs font-bold uppercase text-slate-600">Historique des pliages</div>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Date pliage</th>
                        <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Validité</th>
                        <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Observation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.voileSecours.packHistory.map((h) => (
                        <tr key={h.id}>
                          <td className="border border-slate-300 px-2 py-1 font-mono-tech">{fmtDate(h.packDate)}</td>
                          <td className="border border-slate-300 px-2 py-1 font-mono-tech">{fmtDate(h.validityDate)}</td>
                          <td className="border border-slate-300 px-2 py-1">{h.observation || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-black uppercase tracking-widest text-blue-700">
                Appareil de sécurité
              </h2>
              <table className="w-full border-collapse">
                <tbody>
                  <Row label="Nom / Modèle" value={`${p.appareilSecurite?.brand || ""} ${p.appareilSecurite?.model || ""}`.trim() || p.appareilSecurite?.type} />
                  <Row label="N° série" value={p.appareilSecurite?.serialNumber} mono />
                  <Row label="Date fabrication" value={fmtDate(p.appareilSecurite?.manufacturingDate)} mono />
                  <Row label="Date péremption" value={fmtDate(p.appareilSecurite?.expiryDate)} mono />
                  <Row label="Nombre de sauts" value={(p.appareilSecurite?.totalJumps || 0).toLocaleString("fr-FR")} mono />
                  <Row
                    label="Statut"
                    value={<StatusText status={validityStatus(p.appareilSecurite?.expiryDate, settings.warningDays)} />}
                  />
                </tbody>
              </table>
            </section>

            {p.observations && (
              <section>
                <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-black uppercase tracking-widest text-blue-700">
                  Observations
                </h2>
                <p className="text-sm text-slate-800">{p.observations}</p>
              </section>
            )}
          </div>
        )}

        {!p && (
          <section>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Type</th>
                  <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Référence</th>
                  <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Harnais N°</th>
                  <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Voile P. N°</th>
                  <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Total sauts</th>
                  <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Validité secours</th>
                  <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Péremp. AAD</th>
                  <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">Statut</th>
                </tr>
              </thead>
              <tbody>
                {list.map((x) => (
                  <tr key={x.id}>
                    <td className="border border-slate-300 px-2 py-1">{x.type}</td>
                    <td className="border border-slate-300 px-2 py-1">{x.reference}</td>
                    <td className="border border-slate-300 px-2 py-1 font-mono-tech">{x.sac?.serialNumber}</td>
                    <td className="border border-slate-300 px-2 py-1 font-mono-tech">{x.voilePrincipale?.serialNumber}</td>
                    <td className="border border-slate-300 px-2 py-1 font-mono-tech">{(x.voilePrincipale?.totalJumps || 0).toLocaleString("fr-FR")}</td>
                    <td className="border border-slate-300 px-2 py-1 font-mono-tech">{fmtDate(x.voileSecours?.validityDate)}</td>
                    <td className="border border-slate-300 px-2 py-1 font-mono-tech">{fmtDate(x.appareilSecurite?.expiryDate)}</td>
                    <td className="border border-slate-300 px-2 py-1">{x.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-xs text-slate-500">Total : {list.length} matériel(s)</div>
          </section>
        )}
      </div>
    </div>
  );
}
