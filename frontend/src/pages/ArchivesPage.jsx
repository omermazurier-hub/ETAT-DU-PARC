import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import ParachuteRow from "@/components/ParachuteRow";
import { Button } from "@/components/ui/button";
import { listArchived, subscribe, archiveParachute, getSettings } from "@/lib/storage";
import { ArrowLeft, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";

export default function ArchivesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(getSettings());
  useEffect(() => {
    const reload = () => {
      setItems(listArchived());
      setSettings(getSettings());
    };
    reload();
    return subscribe(reload);
  }, []);

  return (
    <div>
      <AppHeader />
      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 text-slate-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <h1 className="font-heading mb-6 text-4xl font-extrabold tracking-tight text-slate-900">
          Archives
        </h1>
        <div className="space-y-4">
          {items.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-16 text-center text-slate-500">
              Aucun parachute archivé.
            </div>
          )}
          {items.map((p) => (
            <div key={p.id} className="relative">
              <ParachuteRow parachute={p} warningDays={settings.warningDays} />
              <Button
                size="sm"
                variant="outline"
                className="absolute right-6 top-6 z-10 bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  archiveParachute(p.id, false);
                  toast.success("Parachute désarchivé");
                }}
                data-testid={`unarchive-${p.id}`}
              >
                <ArchiveRestore className="mr-1 h-4 w-4" /> Désarchiver
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
