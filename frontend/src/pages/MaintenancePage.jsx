import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { listParachutes, subscribe } from "@/lib/storage";
import { fmtDate } from "@/lib/validity";
import { ArrowLeft, Wrench, ChevronRight } from "lucide-react";

export default function MaintenancePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  useEffect(() => {
    const reload = () => setItems(listParachutes({ includeArchived: true }));
    reload();
    return subscribe(reload);
  }, []);

  const maintenance = useMemo(() => items.filter((p) => p.status === "EN PLIAGE"), [items]);
  const reparation = useMemo(() => items.filter((p) => p.status === "EN RÉPARATION"), [items]);

  const List = ({ arr, empty }) => (
    <div className="space-y-3">
      {arr.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          {empty}
        </div>
      )}
      {arr.map((p) => {
        const last = (p.status === "EN PLIAGE" ? p.maintenance : p.reparation)?.[0];
        return (
          <Link
            key={p.id}
            to={`/parachute/${p.id}`}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 hover:shadow-md"
            style={{ transitionProperty: "border-color, box-shadow", transitionDuration: "180ms" }}
            data-testid={`mnt-row-${p.id}`}
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                  {p.type}
                </span>
                <div className="font-heading text-base font-extrabold text-slate-900">{p.reference}</div>
              </div>
              {last && (
                <div className="mt-1 text-xs text-slate-500">
                  Depuis le {fmtDate(last.date)} — {last.motif}
                </div>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </Link>
        );
      })}
    </div>
  );

  return (
    <div>
      <AppHeader />
      <main className="mx-auto max-w-[1200px] px-6 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 text-slate-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <div className="mb-6 flex items-center gap-3">
          <Wrench className="h-8 w-8 text-blue-600" />
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900">
            Pliage & Réparation
          </h1>
        </div>

        <Tabs defaultValue="maintenance">
          <TabsList className="mb-4">
            <TabsTrigger value="maintenance" data-testid="tab-maintenance">
              En pliage ({maintenance.length})
            </TabsTrigger>
            <TabsTrigger value="reparation" data-testid="tab-reparation">
              En réparation ({reparation.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="maintenance">
            <List arr={maintenance} empty="Aucun matériel en pliage." />
          </TabsContent>
          <TabsContent value="reparation">
            <List arr={reparation} empty="Aucun matériel en réparation." />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
