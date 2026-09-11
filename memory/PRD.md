# ParaTech — Gestion Technique de Matériel Parachutiste

## Problem Statement
Application de bureau (web app destinée à être encapsulée en .exe Windows via Electron/Tauri) pour la GESTION TECHNIQUE de matériel parachutiste. Interface blanche/bleue, hors-ligne, données locales (localStorage), aucune notion de personne/perception. Français.

## Architecture
- **Frontend only** — React 19 + Tailwind + shadcn/ui + Sonner + Lucide icons
- **Stockage** : localStorage sous clé `paratech.db.v1` (JSON unique)
- **Aucun backend utilisé** pour les données. FastAPI/Mongo présents mais inutilisés.
- **Routing** : react-router-dom (Home / nouveau / parachute/:id / archives / maintenance / parametres / imprimer)

## Data model (localStorage)
```
{
  version, settings: { reservePackValidityMonths=12, warningDays=30, parachuteTypes[], voileTypes[], secoursTypes[], aadTypes[] },
  parachutes: [{ id, type, reference, status, archived, observations, createdAt,
    sac{serialNumber,manufacturingDate,observations},
    voilePrincipale{type,serialNumber,manufacturingDate,totalJumps,jumpsSinceCone,lastConeChangeDate,observations,coneHistory[]},
    voileSecours{type,serialNumber,manufacturingDate,lastPackDate,validityDate,observations,packHistory[]},
    appareilSecurite{type,brand,model,serialNumber,manufacturingDate,expiryDate,observations},
    maintenance[], reparation[], history[] }]
}
```

## Implemented (Feb 2026)
- Page d'accueil = liste des parachutes en longs rectangles horizontaux (aucun compteur global)
- Chaque rectangle : SAC / VOILE PRINCIPALE / VOILE DE SECOURS / APPAREIL DE SÉCURITÉ + badges validité 🟢🟠🔴 auto
- Recherche instantanée (n° série sac/VP/VS/AAD + type)
- Filtres : Statut (En service, En maintenance, En réparation, Prochaine péremption, Expirés) + Type (BOI/TANDEM/Autre, dynamique)
- Bouton "+ Ajouter" → formulaire complet (Parachute, Sac, Voile P., Voile S., AAD, Observations) avec DatePicker shadcn
- Fiche détaillée : 4 cartes cliquables (Sheet) : Sac, Voile P., Voile S., AAD
- Voile principale : compteur total + compteur depuis dernier changement de cône (distincts), bouton +1 saut, modifier sauts, nouveau changement de cône (reset compteur cône, total inchangé), historique cône
- Voile secours : nouveau pliage (validité auto = pack + settings.reservePackValidityMonths), historique
- AAD : observations + badge validité auto
- Maintenance / Réparation : ajout entrées avec date, motif, observation, date remise en service ; statut du parachute mis à jour ; historique
- Statut général (EN SERVICE / EN MAINTENANCE / EN RÉPARATION / INDISPONIBLE / EXPIRÉ / ARCHIVÉ)
- Archivage / désarchivage
- Historique technique (création, modification, saut, cône, pliage, maintenance, réparation, statut, archivage) — aucune mention de personne
- Impression A4 : fiche parachute complète + listes filtrées (via /imprimer/liste/:filter)
- Sauvegarde/Restauration : export JSON téléchargeable + import JSON (avec confirmation)
- Réinitialiser avec données exemple (3 parachutes seed : BOI Mirage G4, TDM Sigma, BOI Vector 3)
- Paramètres : durée validité pliage (mois), seuil péremption proche (jours), types éditables

## Backlog / P1
- Encapsulation Electron/Tauri (guide à fournir séparément)
- Impression par section (fiche voile principale seule, fiche secours seule…) — actuellement fiche complète
- Rappels visuels dashboard (bandeau top des matériels critiques)
- Compteur "+5 sauts" rapide
- Filtre "Archivés" accessible depuis liste principale (actuellement page dédiée)

## Next tasks
- Testing E2E
- Documentation build/packaging Electron


## 2026-06 — Correction affichage sauts
- Page principale : Harnais (nom, N° série), Voile principale (nom, N° série, nombre de sauts), Voile de secours (nom, N° série, badge), Appareil de sécurité (nom/modèle, N° série, validité/péremption, badge).
- Fiche Appareil de sécurité : ajout du champ `appareilSecurite.totalJumps`, affiché et modifiable (setAadJumps dans storage.js), + champ dans le formulaire ajout/modif et fiche imprimable.
- Reste à faire : vérifier import fichier à imprimer (AppHeader), supprimer ArchivesPage orpheline, sauvegarde/restauration, guide .exe.
- 2026-06 : menus déroulants Type remplacés par zones de texte libres (parachute, harnais, appareil), libellés 'Nom'.
- 2026-06 : palette de 10 couleurs par type de parachute dans Paramètres (settings.parachuteTypeColors, lib/typeColors.js), appliquée aux bulles type (page principale + fiche).
- 2026-06 : section 'Types de harnais' supprimée des paramètres.
- 2026-06 : suppression Types AAD des paramètres ; AAD = un seul champ Nom/Modèle ; voile de secours : compteurs pliages (packCount, +1 auto à chaque pliage) et ouvertures (openingCount), modifiables dans la fiche.
- 2026-06 : bouton Modifier global retiré de la fiche parachute ; bouton Modifier + formulaire inline (SectionEditor) dans chaque fiche Harnais / VP / VS / AAD.
- 2026-06 : option 'Imprimer un fichier' retirée du menu déroulant.
- 2026-06 : libellé 'Depuis dernier changement de cône' → 'Cône actuel' (ajout saut incrémente total + cône actuel).
- 2026-06 : feuilles PDF personnalisées par parachute (IndexedDB, lib/sheets.js, composant SheetsSettings dans Paramètres) ; Imprimer affiche uniquement la feuille si présente, sinon la fiche générée.
- 2026-06 : préparation Electron (electron/main.js, scripts electron:*, HashRouter, homepage '.'), guide /app/GUIDE_MAC.md.
- 2026-06 : bouton Supprimer (avec confirmation) sur la fiche parachute, supprime l'ensemble + sa feuille PDF.
- Note: ne jamais utiliser de commentaire eslint-disable référençant un plugin (react-hooks/...) : le linter de la plateforme plante.
- 2026-06 : cartes accueil compactes (police réduite, champs sur une ligne), bordure + ombre colorées selon la couleur du type de parachute.
- 2026-06 : tri des parachutes par type puis référence (tri numérique naturel : BOI 1, BOI 2, BOI 10) dans listParachutes.
- 2026-06 : champ 'Date de remise en service' supprimé (pliage/réparation) ; placeholders 'Ex : …' retirés du formulaire d'ajout.
- 2026-06 : formulaire ajout : champs 'dernier pliage'/'validité' retirés de la voile de secours ; la fiche Pliage (bouton clé) enregistre le pliage et fixe automatiquement lastPackDate + validityDate (+12 mois paramétrable), incrémente packCount, sans changer le statut.
- 2026-06 : icône application (fond blanc supprimé) : electron/icon.png/.icns/.ico + favicon/logo192/logo512, référencée dans package.json build.mac/win.icon et main.js.
- 2026-06 : 'Validé' → 'Validité' ; ajustement manuel de la date de validité du pliage secours dans la fiche Pliage (setReserveValidity) ; recherche étendue aux noms/marques/modèles de tous les éléments ; calendrier avec menus déroulants mois/année en français.
- 2026-06 : accueil : badge État retiré de la voile de secours ; badge PÉREMPTION PROCHE affiché à côté de 'Validité' dans l'en-tête de la carte quand le pliage secours approche de l'échéance.
- 2026-06 : packValidationDate utilise désormais voileSecours.validityDate (ajustements manuels reflétés dans la bulle Validité).
- 2026-06 : couleurs de type persistées immédiatement au clic (updateSettings), lookup insensible à la casse, couleur auto pour tout nouveau type ; fond orange (bg-orange-100) du cadre quand statut EN RÉPARATION (accueil + fiche).
- 2026-06 : bulle Validité rouge uniquement si la date de validité du pliage est dépassée (indépendante du statut réparation).
- 2026-06 : option 'Réinitialiser (données exemple)' retirée du menu.
- 2026-06 : en réparation, les 4 rectangles éléments (accueil) gardent leur couleur d'origine (pas de rouge).
- 2026-06 : type de parachute via menu déroulant alimenté par settings.parachuteTypes ; tri par type puis premier nombre de la référence ; page Vue d'ensemble (/vue-ensemble) compacte avec bulles Val. réserve / Val. appareil, bouton bascule Vue d'ensemble ↔ Menu principal dans l'en-tête.
- 2026-06 : vue d'ensemble compactée (bulles sur une ligne 'Val. réserve JJ/MM/AAAA', 'Val. EQS', sans libellé d'état, police réduite).
- 2026-06 : thème (settings.theme {pageBg, accent}) : lib/theme.js applique des variables CSS (--app-bg, --app-accent…), index.css remappe bg-blue-600/hover/blue-50/text-blue-700 ; section Apparence dans Paramètres (10 presets + couleur personnalisée, appliqué immédiatement).
- 2026-06 : badge global INDISPONIBLE (orange) en réparation ; badge appareil de sécu reflète uniquement sa date ; bouton Modifier (type/référence) remplace 'Créé le' sur la fiche ; vue d'ensemble 'Val.' au lieu de 'Val. réserve'.
- 2026-06 : modification clavier du total de sauts → cône actuel ajusté du même delta automatiquement.
- 2026-06 : page DTO (/dto, menu Navigation) = nombre de voiles disponibles par nom/taille de voile principale ; badge 'N disponibles' sur l'accueil (suit les filtres) et la vue d'ensemble. Disponible = EN SERVICE et validité pliage OK.
- 2026-06 : DTO regroupe par taille de voile (dernier nombre 80–600 du nom de la voile principale), tri décroissant, modèles listés en sous-titre.
- 2026-06 : electron-builder configuré Mac arm64 (dmg) + Windows x64 (nsis FR), scripts electron:build:mac / electron:build:win, cross-env pour electron:dev, /dist ignoré, guide /app/BUILD.md.
