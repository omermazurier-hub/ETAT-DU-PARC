# Créer l'application « ETAT DU PARC » en logiciel Mac (.app / .dmg)

Le projet est déjà préparé pour Electron : `frontend/electron/main.js`, scripts `electron:*` et configuration `build` dans `frontend/package.json`, routage en `HashRouter` (obligatoire pour fonctionner hors navigateur).

## Étape 1 — Installer les outils sur le Mac (une seule fois)

1. Ouvrir **Terminal** (Cmd + Espace → « Terminal »).
2. Installer Homebrew (si absent) :
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
3. Installer Node.js, Yarn et Git :
   ```bash
   brew install node git
   npm install -g yarn
   ```
4. Vérifier :
   ```bash
   node -v    # v18 ou plus
   yarn -v
   git --version
   ```

## Étape 2 — Récupérer le code sur le Mac

**Via GitHub (recommandé)** : dans Emergent, bouton **Save → Save to GitHub**, puis sur le Mac :
```bash
cd ~/Documents
git clone https://github.com/VOTRE_COMPTE/VOTRE_DEPOT.git etat-du-parc
cd etat-du-parc/frontend
```
(Sinon : copier les fichiers via l'éditeur **Code** d'Emergent dans un dossier `etat-du-parc/frontend`.)

## Étape 3 — Installer les dépendances

```bash
cd ~/Documents/etat-du-parc/frontend
yarn install
yarn add -D electron electron-builder concurrently wait-on
```

## Étape 4 — Tester en mode développement

```bash
yarn electron:dev
```
Une fenêtre « ETAT DU PARC » s'ouvre avec l'application. Fermer la fenêtre et faire Ctrl + C dans le Terminal pour arrêter.

## Étape 5 — Générer le logiciel Mac

```bash
yarn electron:build
```
Résultat dans `frontend/dist/` :
- `ETAT DU PARC-1.0.0.dmg` → double-cliquer, glisser l'icône dans **Applications**.
- `ETAT DU PARC-1.0.0-mac.zip` → contient directement `ETAT DU PARC.app`.

Au premier lancement, macOS peut afficher « développeur non identifié » : **clic droit → Ouvrir**, ou Réglages Système → Confidentialité et sécurité → **Ouvrir quand même**.

## Étape 6 — (Optionnel) Icône personnalisée

Placer un fichier `icon.icns` (1024×1024) dans `frontend/electron/` puis relancer `yarn electron:build`.

## Où sont mes données ?

Les données (parachutes, paramètres, feuilles PDF) sont stockées localement dans l'application, hors ligne, dans :
`~/Library/Application Support/ETAT DU PARC/`
Utilisez **Menu → Sauvegarder** dans l'application pour exporter un fichier de secours.

## Mettre à jour le logiciel après une modification

```bash
cd ~/Documents/etat-du-parc/frontend
git pull
yarn install
yarn electron:build
```

## Version Windows depuis le Mac

```bash
yarn electron:build:win
```
Produit un installateur `.exe` dans `frontend/dist/`.

## Problèmes fréquents

| Symptôme | Solution |
|---|---|
| `command not found: yarn` | `npm install -g yarn` |
| Page blanche dans l'application | Vérifier que `"homepage": "."` est dans `package.json` et relancer `yarn build` |
| `electron-builder` échoue sur le code signing | Ajouter `CSC_IDENTITY_AUTO_DISCOVERY=false yarn electron:build` |
| Application bloquée par Gatekeeper | Clic droit → Ouvrir |
