import React from "react";
import "@/App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import OverviewPage from "@/pages/OverviewPage";
import { Toaster } from "sonner";
import HomePage from "@/pages/HomePage";
import AddEditParachutePage from "@/pages/AddEditParachutePage";
import ParachuteDetailPage from "@/pages/ParachuteDetailPage";
import ArchivesPage from "@/pages/ArchivesPage";
import MaintenancePage from "@/pages/MaintenancePage";
import SettingsPage from "@/pages/SettingsPage";
import PrintPage from "@/pages/PrintPage";

export default function App() {
  return (
    <div className="App">
      <HashRouter>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vue-ensemble" element={<OverviewPage />} />
          <Route path="/nouveau" element={<AddEditParachutePage />} />
          <Route path="/parachute/:id/modifier" element={<AddEditParachutePage />} />
          <Route path="/parachute/:id" element={<ParachuteDetailPage />} />
          <Route path="/parachute/:id/imprimer" element={<PrintPage />} />
          <Route path="/archives" element={<ArchivesPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/parametres" element={<SettingsPage />} />
          <Route path="/imprimer/liste/:filter" element={<PrintPage />} />
        </Routes>
      </HashRouter>
    </div>
  );
}
