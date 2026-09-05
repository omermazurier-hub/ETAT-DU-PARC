import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import ParachuteRow from "@/components/ParachuteRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listParachutes, subscribe, getSettings } from "@/lib/storage";
import { validityStatus, overallValidity } from "@/lib/validity";
import { Search, Filter } from "lucide-react";

const STATUS_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "EN SERVICE", label: "En service" },
  { value: "EN PLIAGE", label: "En pliage" },
  { value: "EN RÉPARATION", label: "En réparation" },
  { value: "proche", label: "Prochaine péremption" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(getSettings());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const reload = () => {
      setItems(listParachutes());
      setSettings(getSettings());
    };
    reload();
    const unsub = subscribe(reload);
    return unsub;
  }, []);

  const availableTypes = useMemo(() => {
    const s = new Set(items.map((p) => p.type));
    return ["all", ...Array.from(s)];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      if (statusFilter !== "all") {
        if (["EN SERVICE", "EN PLIAGE", "EN RÉPARATION"].includes(statusFilter)) {
          if (p.status !== statusFilter) return false;
        } else if (statusFilter === "proche" || statusFilter === "perime") {
          const ov = overallValidity(p, settings.warningDays);
          if (ov !== statusFilter) return false;
        }
      }
      if (!q) return true;
      const hay = [
        p.reference,
        p.type,
        p.sac?.type,
        p.sac?.serialNumber,
        p.voilePrincipale?.type,
        p.voilePrincipale?.serialNumber,
        p.voileSecours?.type,
        p.voileSecours?.serialNumber,
        p.appareilSecurite?.type,
        p.appareilSecurite?.brand,
        p.appareilSecurite?.model,
        p.appareilSecurite?.serialNumber,
        p.observations,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, search, typeFilter, statusFilter, settings.warningDays]);

  const handlePrintList = () => {
    navigate(`/imprimer/liste/${statusFilter}`);
  };

  return (
    <div>
      <AppHeader onPrint={handlePrintList} />
      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900">
              Parc parachutes
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {filtered.length} matériel{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Search + filters */}
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              data-testid="search-input"
              placeholder="Rechercher : référence, nom ou n° série (harnais, voile, secours, appareil)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10 text-base"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger data-testid="filter-type-select" className="h-11 text-base">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <SelectValue placeholder="Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "all" ? "Tous les types" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger data-testid="filter-status-select" className="h-11 text-base">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <SelectValue placeholder="Statut" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Parachute list */}
        <div data-testid="parachute-list" className="space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-16 text-center">
              <p className="text-lg font-semibold text-slate-600">Aucun parachute trouvé</p>
              <p className="mt-2 text-sm text-slate-500">
                Modifiez les filtres ou ajoutez un nouveau parachute.
              </p>
              <Button
                className="mt-4 h-11 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/nouveau")}
                data-testid="empty-add-btn"
              >
                Ajouter un parachute
              </Button>
            </div>
          )}
          {filtered.map((p) => (
            <ParachuteRow key={p.id} parachute={p} warningDays={settings.warningDays} />
          ))}
        </div>
      </main>
    </div>
  );
}
