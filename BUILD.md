# ETAT DU PARC — Générer les versions Mac et Windows

Le projet (`frontend/`) est configuré avec Electron Builder pour :
- **Mac Apple Silicon** → `ETAT DU PARC-1.0.0-mac-arm64.dmg`
- **Windows x64** → `ETAT DU PARC-1.0.0-win-x64.exe` (installateur NSIS, français, raccourcis bureau + menu Démarrer)

Les fichiers générés se trouvent dans `frontend/dist/` (ignoré par git).

---

## Prérequis (sur chaque machine)
- Node.js 18 ou plus : https://nodejs.org (version LTS)
- Yarn : `npm install -g yarn` (sur Mac : `sudo npm install -g yarn`)

---

## Sur Mac (Apple Silicon)

```bash
cd frontend
yarn install
yarn add -D electron electron-builder concurrently wait-on cross-env   # une seule fois
yarn electron:dev          # test en fenêtre (facultatif)
yarn electron:build:mac    # génère dist/ETAT DU PARC-1.0.0-mac-arm64.dmg
```

Au premier lancement du .dmg : clic droit → Ouvrir (application non signée).

---

## Transférer le projet vers le PC Windows

Copier le dossier `frontend/` **sans** les dossiers `node_modules/`, `build/` et `dist/`
(clé USB, réseau, ou via GitHub avec « Save to GitHub » puis `git clone` sur le PC).

---

## Sur Windows (x64)

Ouvrir **PowerShell** (ou l'Invite de commandes) dans le dossier `frontend` :

```powershell
yarn install
yarn add -D electron electron-builder concurrently wait-on cross-env   # une seule fois
yarn electron:build:win    # génère dist\ETAT DU PARC-1.0.0-win-x64.exe
```

Double-cliquer sur le `.exe` pour installer. Windows SmartScreen peut afficher
« Éditeur inconnu » : cliquer sur *Informations complémentaires* → *Exécuter quand même*.

---

## Notes
- **Point d'entrée Electron** : `frontend/electron/main.js`, déclaré deux fois dans `package.json`
  (`"main"` et `build.extraMetadata.main`). Si votre copie locale de `package.json` est ancienne,
  remplacez-la par celle du projet : l'erreur *« Application entry file "build/electron.js" was not found »*
  signifie que la clé `"main"` manque.
- Vérifier avant un build : `node -e "console.log(require('./package.json').main)"` doit afficher `electron/main.js`.
- La version (1.0.0) se change dans `frontend/package.json` → `"version"`.
- Icônes : `frontend/electron/icon.icns` (Mac) et `frontend/electron/icon.ico` (Windows).
- Les données (parachutes, paramètres, feuilles PDF) sont stockées localement sur chaque poste ;
  utiliser Menu → Sauvegarder / Restaurer pour les transférer.
