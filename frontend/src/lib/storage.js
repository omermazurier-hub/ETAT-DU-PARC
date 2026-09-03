// Local storage engine for ParaTech - fully offline
// All data is stored in localStorage under a single JSON blob.

const KEY = "paratech.db.v1";

const DEFAULT_SETTINGS = {
  reservePackValidityMonths: 12, // durée par défaut : 1 an
  warningDays: 30, // "péremption proche" = < 30 jours
  parachuteTypes: ["BOI", "TANDEM", "AUTRE"],
  sacTypes: ["Standard", "École", "Tandem"],
  aadTypes: ["Cypres 2", "Vigil Cuattro", "MARS m2", "Autre"],
};

function uid() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function emptyDb() {
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS },
    parachutes: [],
  };
}

function seed(db) {
  if (db.parachutes.length > 0) return db;
  const mk = (o) => ({
    id: uid(),
    type: o.type,
    reference: o.reference,
    status: o.status || "EN SERVICE",
    archived: false,
    observations: o.observations || "",
    createdAt: nowIso(),
    sac: {
      type: o.sacType || "",
      serialNumber: o.sacSN,
      manufacturingDate: o.sacDF,
      observations: "",
    },
    voilePrincipale: {
      type: o.vpType,
      serialNumber: o.vpSN,
      manufacturingDate: o.vpDF,
      totalJumps: o.vpTotal,
      jumpsSinceCone: o.vpCone,
      lastConeChangeDate: o.vpConeDate,
      observations: "",
      coneHistory: o.coneHistory || [],
    },
    voileSecours: {
      type: o.vsType,
      serialNumber: o.vsSN,
      manufacturingDate: o.vsDF,
      lastPackDate: o.vsPack,
      validityDate: o.vsValidity,
      observations: "",
      packHistory: o.packHistory || [],
    },
    appareilSecurite: {
      type: o.aadType,
      brand: o.aadBrand,
      model: o.aadModel,
      serialNumber: o.aadSN,
      manufacturingDate: o.aadDF,
      expiryDate: o.aadExp,
      observations: "",
    },
    maintenance: [],
    reparation: [],
    history: [
      { id: uid(), date: nowIso(), type: "creation", label: "Création du parachute" },
    ],
  });
  db.parachutes = [
    mk({
      type: "BOI",
      reference: "BOI-001 Mirage G4",
      sacSN: "SAC-88451",
      sacDF: "2019-05-14",
      sacType: "Standard",
      vpType: "Standard",
      vpSN: "VP-72031",
      vpDF: "2019-05-14",
      vpTotal: 1250,
      vpCone: 250,
      vpConeDate: "2025-05-15",
      coneHistory: [
        { id: uid(), date: "2025-05-15", jumpsAtChange: 1000, observation: "Changement suspentes" },
        { id: uid(), date: "2023-11-02", jumpsAtChange: 620, observation: "Changement suspentes" },
      ],
      vsType: "Aile",
      vsSN: "VS-11029",
      vsDF: "2019-05-14",
      vsPack: "2025-11-20",
      vsValidity: "2026-11-20",
      packHistory: [
        { id: uid(), packDate: "2025-11-20", validityDate: "2026-11-20", observation: "Pliage OK" },
        { id: uid(), packDate: "2024-11-18", validityDate: "2025-11-18", observation: "" },
      ],
      aadType: "Cypres 2",
      aadBrand: "Airtec",
      aadModel: "Cypres 2 Expert",
      aadSN: "AAD-A9182",
      aadDF: "2019-06-01",
      aadExp: "2031-06-01",
    }),
    mk({
      type: "TANDEM",
      reference: "TDM-002 Sigma",
      sacSN: "SAC-77120",
      sacDF: "2021-03-08",
      sacType: "Tandem",
      vpType: "Tandem principal",
      vpSN: "VP-90211",
      vpDF: "2021-03-08",
      vpTotal: 640,
      vpCone: 120,
      vpConeDate: "2025-08-01",
      coneHistory: [
        { id: uid(), date: "2025-08-01", jumpsAtChange: 520, observation: "" },
      ],
      vsType: "Tandem secours",
      vsSN: "VS-30994",
      vsDF: "2021-03-08",
      vsPack: "2025-12-10",
      vsValidity: "2026-12-10",
      packHistory: [
        { id: uid(), packDate: "2025-12-10", validityDate: "2026-12-10", observation: "" },
      ],
      aadType: "Vigil Cuattro",
      aadBrand: "Vigil",
      aadModel: "Cuattro Tandem",
      aadSN: "AAD-V4413",
      aadDF: "2021-04-01",
      aadExp: "2033-04-01",
    }),
    mk({
      type: "BOI",
      reference: "BOI-003 Vector 3",
      sacSN: "SAC-66210",
      sacDF: "2017-02-11",
      sacType: "Standard",
      vpType: "Standard",
      vpSN: "VP-55021",
      vpDF: "2017-02-11",
      vpTotal: 2100,
      vpCone: 80,
      vpConeDate: "2025-10-12",
      coneHistory: [
        { id: uid(), date: "2025-10-12", jumpsAtChange: 2020, observation: "" },
      ],
      vsType: "Aile",
      vsSN: "VS-77812",
      vsDF: "2017-02-11",
      vsPack: "2025-02-05",
      vsValidity: "2026-02-05",
      packHistory: [
        { id: uid(), packDate: "2025-02-05", validityDate: "2026-02-05", observation: "" },
      ],
      aadType: "Cypres 2",
      aadBrand: "Airtec",
      aadModel: "Cypres 2 Expert",
      aadSN: "AAD-B7712",
      aadDF: "2017-03-01",
      aadExp: "2026-03-15",
    }),
  ];
  return db;
}

export function loadDb() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const db = seed(emptyDb());
      saveDb(db);
      return db;
    }
    const db = JSON.parse(raw);
    if (!db.settings) db.settings = { ...DEFAULT_SETTINGS };
    // fill missing settings
    for (const k of Object.keys(DEFAULT_SETTINGS)) {
      if (db.settings[k] === undefined) db.settings[k] = DEFAULT_SETTINGS[k];
    }
    return db;
  } catch (e) {
    const db = seed(emptyDb());
    saveDb(db);
    return db;
  }
}

export function saveDb(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
  // fire an event so components can react in-page
  window.dispatchEvent(new CustomEvent("paratech:changed"));
}

export function subscribe(fn) {
  const handler = () => fn();
  window.addEventListener("paratech:changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("paratech:changed", handler);
    window.removeEventListener("storage", handler);
  };
}

export function getSettings() {
  return loadDb().settings;
}

export function updateSettings(patch) {
  const db = loadDb();
  db.settings = { ...db.settings, ...patch };
  saveDb(db);
}

export function listParachutes({ includeArchived = false } = {}) {
  const db = loadDb();
  return db.parachutes.filter((p) => includeArchived || !p.archived);
}

export function listArchived() {
  return loadDb().parachutes.filter((p) => p.archived);
}

export function getParachute(id) {
  return loadDb().parachutes.find((p) => p.id === id) || null;
}

function addHistory(p, type, label) {
  p.history = p.history || [];
  p.history.unshift({ id: uid(), date: nowIso(), type, label });
}

export function createParachute(data) {
  const db = loadDb();
  const p = {
    id: uid(),
    type: data.type || "BOI",
    reference: data.reference || "",
    status: "EN SERVICE",
    archived: false,
    observations: data.observations || "",
    createdAt: nowIso(),
    sac: {
      type: data.sac?.type || "",
      serialNumber: data.sac?.serialNumber || "",
      manufacturingDate: data.sac?.manufacturingDate || "",
      observations: "",
    },
    voilePrincipale: {
      type: data.voilePrincipale?.type || "",
      serialNumber: data.voilePrincipale?.serialNumber || "",
      manufacturingDate: data.voilePrincipale?.manufacturingDate || "",
      totalJumps: Number(data.voilePrincipale?.totalJumps || 0),
      jumpsSinceCone: Number(data.voilePrincipale?.jumpsSinceCone || 0),
      lastConeChangeDate: data.voilePrincipale?.lastConeChangeDate || "",
      observations: "",
      coneHistory: [],
    },
    voileSecours: {
      type: data.voileSecours?.type || "",
      serialNumber: data.voileSecours?.serialNumber || "",
      manufacturingDate: data.voileSecours?.manufacturingDate || "",
      lastPackDate: data.voileSecours?.lastPackDate || "",
      validityDate: data.voileSecours?.validityDate || "",
      observations: "",
      packHistory: data.voileSecours?.lastPackDate
        ? [{
            id: uid(),
            packDate: data.voileSecours.lastPackDate,
            validityDate: data.voileSecours.validityDate,
            observation: "Pliage initial",
          }]
        : [],
    },
    appareilSecurite: {
      type: data.appareilSecurite?.type || "",
      brand: data.appareilSecurite?.brand || "",
      model: data.appareilSecurite?.model || "",
      serialNumber: data.appareilSecurite?.serialNumber || "",
      manufacturingDate: data.appareilSecurite?.manufacturingDate || "",
      expiryDate: data.appareilSecurite?.expiryDate || "",
      totalJumps: Number(data.appareilSecurite?.totalJumps || 0),
      observations: "",
    },
    maintenance: [],
    reparation: [],
    history: [],
  };
  addHistory(p, "creation", "Création du parachute");
  db.parachutes.unshift(p);
  saveDb(db);
  return p;
}

export function updateParachute(id, patch) {
  const db = loadDb();
  const idx = db.parachutes.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const p = db.parachutes[idx];
  Object.assign(p, patch);
  addHistory(p, "modification", "Modification des informations");
  db.parachutes[idx] = p;
  saveDb(db);
  return p;
}

export function updateSection(id, section, patch, historyLabel) {
  const db = loadDb();
  const p = db.parachutes.find((x) => x.id === id);
  if (!p) return null;
  p[section] = { ...p[section], ...patch };
  addHistory(p, "modification", historyLabel || `Modification ${section}`);
  saveDb(db);
  return p;
}

export function addJump(id, count = 1) {
  const db = loadDb();
  const p = db.parachutes.find((x) => x.id === id);
  if (!p) return null;
  p.voilePrincipale.totalJumps = (p.voilePrincipale.totalJumps || 0) + count;
  p.voilePrincipale.jumpsSinceCone = (p.voilePrincipale.jumpsSinceCone || 0) + count;
  addHistory(p, "saut", `Ajout de ${count} saut${count > 1 ? "s" : ""}`);
  saveDb(db);
  return p;
}

export function setJumps(id, total, sinceCone) {
  const db = loadDb();
  const p = db.parachutes.find((x) => x.id === id);
  if (!p) return null;
  p.voilePrincipale.totalJumps = Number(total);
  p.voilePrincipale.jumpsSinceCone = Number(sinceCone);
  addHistory(p, "modification", `Modification du nombre de sauts (total=${total}, cône=${sinceCone})`);
  saveDb(db);
  return p;
}

export function setAadJumps(id, jumps) {
  const db = loadDb();
  const p = db.parachutes.find((x) => x.id === id);
  if (!p) return null;
  p.appareilSecurite.totalJumps = Number(jumps);
  addHistory(p, "modification", `Modification du nombre de sauts de l'appareil de sécurité (${jumps})`);
  saveDb(db);
  return p;
}

export function addConeChange(id, { date, observation }) {
  const db = loadDb();
  const p = db.parachutes.find((x) => x.id === id);
  if (!p) return null;
  const jumpsAtChange = p.voilePrincipale.jumpsSinceCone || 0;
  p.voilePrincipale.coneHistory = p.voilePrincipale.coneHistory || [];
  p.voilePrincipale.coneHistory.unshift({
    id: uid(),
    date,
    jumpsAtChange,
    observation: observation || "",
  });
  p.voilePrincipale.lastConeChangeDate = date;
  p.voilePrincipale.jumpsSinceCone = 0; // reset counter — total unchanged
  addHistory(p, "cone", `Changement de cône (${jumpsAtChange} sauts avant changement)`);
  saveDb(db);
  return p;
}

export function addReservePack(id, { packDate, observation }) {
  const db = loadDb();
  const p = db.parachutes.find((x) => x.id === id);
  if (!p) return null;
  const months = db.settings.reservePackValidityMonths || 12;
  const d = new Date(packDate);
  const v = new Date(d);
  v.setMonth(v.getMonth() + months);
  const validityDate = v.toISOString().slice(0, 10);
  p.voileSecours.lastPackDate = packDate;
  p.voileSecours.validityDate = validityDate;
  p.voileSecours.packHistory = p.voileSecours.packHistory || [];
  p.voileSecours.packHistory.unshift({
    id: uid(),
    packDate,
    validityDate,
    observation: observation || "",
  });
  addHistory(p, "pliage", `Nouveau pliage du secours (valide jusqu'au ${validityDate})`);
  saveDb(db);
  return p;
}

export function addMaintenance(id, entry) {
  const db = loadDb();
  const p = db.parachutes.find((x) => x.id === id);
  if (!p) return null;
  p.maintenance = p.maintenance || [];
  p.maintenance.unshift({ id: uid(), ...entry, createdAt: nowIso() });
  p.status = "EN PLIAGE";
  addHistory(p, "pliage-op", `Mise en pliage : ${entry.motif || ""}`);
  saveDb(db);
  return p;
}

export function addReparation(id, entry) {
  const db = loadDb();
  const p = db.parachutes.find((x) => x.id === id);
  if (!p) return null;
  p.reparation = p.reparation || [];
  p.reparation.unshift({ id: uid(), ...entry, createdAt: nowIso() });
  p.status = "EN RÉPARATION";
  addHistory(p, "reparation", `Mise en réparation : ${entry.motif || ""}`);
  saveDb(db);
  return p;
}

export function setStatus(id, status) {
  const db = loadDb();
  const p = db.parachutes.find((x) => x.id === id);
  if (!p) return null;
  p.status = status;
  addHistory(p, "statut", `Statut : ${status}`);
  saveDb(db);
  return p;
}

export function archiveParachute(id, archived = true) {
  const db = loadDb();
  const p = db.parachutes.find((x) => x.id === id);
  if (!p) return null;
  p.archived = archived;
  p.status = archived ? "ARCHIVÉ" : "EN SERVICE";
  addHistory(p, "archivage", archived ? "Archivage" : "Désarchivage");
  saveDb(db);
  return p;
}

export function deleteParachute(id) {
  const db = loadDb();
  db.parachutes = db.parachutes.filter((p) => p.id !== id);
  saveDb(db);
}

export function exportJson() {
  return JSON.stringify(loadDb(), null, 2);
}

export function importJson(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.parachutes)) {
    throw new Error("Fichier de sauvegarde invalide");
  }
  saveDb(parsed);
  return parsed;
}

export function resetToSeed() {
  const db = seed(emptyDb());
  saveDb(db);
  return db;
}
