import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Plus,
  Printer,
  Settings,
  Wrench,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { exportJson, importJson, resetToSeed } from "@/lib/storage";

// Fallback icon (lucide has no parachute icon in some versions)
const ParachuteGlyph = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12a10 10 0 0 1 20 0" />
    <path d="M2 12l10 10 10-10" />
    <path d="M8 12l4 10 4-10" />
  </svg>
);

export default function AppHeader({ onPrint }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const handleExport = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `paratech-sauvegarde-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Sauvegarde exportée avec succès");
  };

  const handleImportClick = () => {
    if (!window.confirm("Restaurer une sauvegarde remplacera les données actuelles. Continuer ?")) return;
    fileRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importJson(text);
      toast.success("Sauvegarde restaurée");
      navigate("/");
    } catch (err) {
      toast.error("Fichier invalide : " + err.message);
    } finally {
      e.target.value = "";
    }
  };

  const handleReset = () => {
    if (!window.confirm("Réinitialiser toutes les données avec les exemples ? Cette action est irréversible.")) return;
    resetToSeed();
    toast.success("Données réinitialisées");
    navigate("/");
  };

  return (
    <header
      data-testid="app-header"
      className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-3" data-testid="app-logo-link">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <ParachuteGlyph className="h-6 w-6" />
          </div>
          <div>
            <div className="font-heading text-xl font-extrabold text-slate-900">ETAT DU PARC</div>
            <div className="-mt-0.5 text-xs font-medium text-slate-500">
              Gestion technique du matériel parachutiste
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="lg"
            className="h-11 bg-blue-600 px-5 text-base font-semibold hover:bg-blue-700"
            data-testid="add-parachute-button"
          >
            <Link to="/nouveau">
              <Plus className="mr-2 h-5 w-5" /> Ajouter
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="h-11 border-slate-300 px-5 text-base font-semibold"
                data-testid="menu-button"
              >
                <Menu className="mr-2 h-5 w-5" /> Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate("/")} data-testid="menu-parachutes">
                <ParachuteGlyph className="mr-2 h-4 w-4" /> Tous les parachutes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/maintenance")} data-testid="menu-maintenance">
                <Wrench className="mr-2 h-4 w-4" /> Pliage
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Données</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleExport} data-testid="menu-export">
                <Download className="mr-2 h-4 w-4" /> Sauvegarder (Export)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportClick} data-testid="menu-import">
                <Upload className="mr-2 h-4 w-4" /> Restaurer (Import)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReset} data-testid="menu-reset">
                <RefreshCw className="mr-2 h-4 w-4" /> Réinitialiser (données exemple)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/parametres")} data-testid="menu-settings">
                <Settings className="mr-2 h-4 w-4" /> Spécifications & Paramètres
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChange}
            data-testid="import-file-input"
          />
        </div>
      </div>
    </header>
  );
}
