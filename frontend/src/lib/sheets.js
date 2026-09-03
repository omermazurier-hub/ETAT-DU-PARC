// Feuilles PDF personnalisées par parachute — stockées hors ligne dans IndexedDB
const DB = "paratech.sheets";
const STORE = "sheets";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "parachuteId" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(mode, fn) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

export function saveSheet(parachuteId, file) {
  return tx("readwrite", (s) =>
    s.put({ parachuteId, name: file.name, size: file.size, blob: file, updatedAt: new Date().toISOString() })
  );
}

export function getSheet(parachuteId) {
  return tx("readonly", (s) => s.get(parachuteId));
}

export function deleteSheet(parachuteId) {
  return tx("readwrite", (s) => s.delete(parachuteId));
}

export function listSheets() {
  return tx("readonly", (s) => s.getAll());
}
